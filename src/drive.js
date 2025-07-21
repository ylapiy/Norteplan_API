const { fastify, oauth2Client } = require("./plugins.js");

const fs = require("fs");
const path = require("path");
const { finished } = require("stream/promises");

let authTokens = null;

fastify.get("/", async (req, reply) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/drive"],
  });
  reply.redirect(url);
});

fastify.get("/oauth2callback", async (req, reply) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  authTokens = tokens;
  reply.send("Autenticação concluída. Agora você pode fazer upload.");
});

async function uploadToDrive(filePath, fileName, mimeType, pasta_pai) {
  if (!authTokens) throw new Error("Usuário não autenticado.");

  oauth2Client.setCredentials(authTokens);
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: ["pasta_pai"],
    },
    media: {
      mimeType,
      body: fs.createReadStream(filePath),
    },
    fields: "id, name",
  });

  fs.unlink(filePath, () => {});
  return res.data;
}

fastify.post("/upload/:id", async function (req, reply) {
  if (!authTokens) {
    reply.code(401).send({ error: "Usuário ainda não autenticado." });
    return;
  }

  const pasta_pai = req.params.id;
  const parts = req.parts();
  const tempDir = path.join(__dirname, "temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  for await (const part of parts) {
    if (part.file) {
      const tempPath = path.join(tempDir, part.filename);
      const ws = fs.createWriteStream(tempPath);
      part.file.pipe(ws);
      await finished(ws);

      try {
        await uploadToDrive(tempPath, part.filename, part.mimetype, pasta_pai);
      } catch (err) {
        reply.code(500).send({
          error: "Erro ao enviar arquivo para o Drive",
          detail: err.message,
        });
        return;
      }
    }
  }

  reply.send({ success: true });
});

async function CriaPasta(nome, pasta_pai) {
  const FoldData = {
    name: nome,
    mimeType: "application/vnd.google-apps.folder",
    parents: [pasta_pai],
  };

  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const Pasta = await drive.files.create({
    requestBody: FoldData,
    fields: "id",
  });

  await drive.permissions.create({
    fileId: Pasta.data.id,
    requestBody: {
      role: "writer",
      type: "anyone",
    },
  });

  return Pasta.data.id;
}

fastify.post("/criapasta/:nome/:id_pastapai", async function (req, res) {
  try {
    const link = await CriaPasta(req.params.nome, req.params.id_pastapai);
    res.send({ success: true, link });
  } catch (err) {
    res.code(500).send({
      error: "Erro ao criar a pasta",
      detail: err.message,
    });
  }
});
