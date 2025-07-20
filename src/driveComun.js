const fs = require('fs');
const path = require('path');
const Fastify = require("fastify");
const fastify = Fastify({ logger: false });
const { finished } = require('stream/promises');
const { google } = require('googleapis');
const credentials = require('./client_secret_508528174189-upsji6h2eip0dv4uqej1da7119ks66kr.apps.googleusercontent.com.json');

fastify.register(require("@fastify/multipart"),{
    attachFieldsToBody: false,
    limits: {
    fileSize: 10 * 1024 * 1024
    }
})

const CLIENT_ID = credentials.web.client_id;
const CLIENT_SECRET = credentials.web.client_secret;
const REDIRECT_URI = credentials.web.redirect_uris[0];

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

let authTokens = null;

fastify.get('/', async (req, reply) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive'],
  });
  reply.redirect(url);
});

fastify.get('/oauth2callback', async (req, reply) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  authTokens = tokens;
  reply.send('Autenticação concluída. Agora você pode fazer upload.');
});

async function uploadToDrive(filePath, fileName, mimeType) {
  if (!authTokens) throw new Error("Usuário não autenticado.");

  oauth2Client.setCredentials(authTokens);
  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: ["1nZPC0oYrxAq0Ujrp2EKosNYd5BTbYUyx"],
    },
    media: {
      mimeType,
      body: fs.createReadStream(filePath),
    },
    fields: 'id, name',
  });

  fs.unlink(filePath, () => {});
  return res.data;
}

fastify.post('/upload', async function (req, reply) {
  if (!authTokens) {
    reply.code(401).send({ error: 'Usuário ainda não autenticado.' });
    return;
  }

  const parts = req.parts();
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  let fileId = null;

  for await (const part of parts) {
    if (part.file) {
      const tempPath = path.join(tempDir, part.filename);
      const ws = fs.createWriteStream(tempPath);
      part.file.pipe(ws);
      await finished(ws);

      try {
        const uploaded = await uploadToDrive(tempPath, part.filename, part.mimetype);
        fileId = uploaded.id;
      } catch (err) {
        reply.code(500).send({ error: 'Erro ao enviar arquivo para o Drive', detail: err.message });
        return;
      }
    }
  }

  reply.send({ success: true, fileId });
});


fastify.listen({ port: 3001 }, function (err, address) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log("Servidor rodando em:", address);
});

