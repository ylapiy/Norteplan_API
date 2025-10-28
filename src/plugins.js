const { google } = require("googleapis");
const Fastify = require("fastify");
const fastify = Fastify({
  logger: false,
});

fastify.register(require("@fastify/cors"), {
  origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
});

fastify.register(require("@fastify/multipart"), {
  attachFieldsToBody: false,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

fastify.register(require("@fastify/postgres"), {
  connectionString:
    process.env.DATABASE_URL,
});

if (!process.env.GOOGLE_CREDENTIALS_JSON) {
  throw new Error("A variável GOOGLE_CREDENTIALS_JSON não está definida!");
}

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON)

const CLIENT_ID = credentials.web.client_id;
const CLIENT_SECRET = credentials.web.client_secret;
const REDIRECT_URI = credentials.web.redirect_uris[0];

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

module.exports = {
  fastify,
  oauth2Client,
  google,
};
