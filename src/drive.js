const fs = require("fs");
const path = require("path");
const Fastify = require("fastify");
const fastify = Fastify({ logger: false });
const { finished } = require("stream/promises");
const { google } = require("googleapis");
const credentials = require("./client_secret_508528174189-upsji6h2eip0dv4uqej1da7119ks66kr.apps.googleusercontent.com.json");

const { request } = require("http");

fastify.register(require("@fastify/multipart"), {
  attachFieldsToBody: false,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const CLIENT_ID = credentials.web.client_id;
const CLIENT_SECRET = credentials.web.client_secret;
const REDIRECT_URI = credentials.web.redirect_uris[0];

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

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

async function uploadToDrive(filePath, fileName, mimeType) {
  if (!authTokens) throw new Error("Usuário não autenticado.");

  oauth2Client.setCredentials(authTokens);
  const drive = google.drive({ version: "v3", auth: oauth2Client });

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: ["1nZPC0oYrxAq0Ujrp2EKosNYd5BTbYUyx"],
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

fastify.post("/upload", async function (req, reply) {
  if (!authTokens) {
    reply.code(401).send({ error: "Usuário ainda não autenticado." });
    return;
  }

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
        await uploadToDrive(tempPath, part.filename, part.mimetype);
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
    fields: "id, webViewLink",
  });

  await drive.permissions.create({
    fileId: Pasta.data.id,
    requestBody: {
      role: "writer",
      type: "anyone",
    },
  });

  return Pasta.data.webViewLink;
}

fastify.post("/criapasta/:nome/:pastaPaiID", async function (req, res) {
  try {
    const link = await CriaPasta(req.params.nome, req.params.pastaPaiID);
    res.send({ success: true, link });
  } catch (err) {
    res.code(500).send({
      error: "Erro ao criar a pasta",
      detail: err.message,
    });
  }
});

fastify.listen({ port: 3001 }, function (err, address) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log("Servidor rodando em:", address);
});
