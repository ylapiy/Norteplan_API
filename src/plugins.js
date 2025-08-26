const { google } = require("googleapis");
const Fastify = require("fastify");
const fastify = Fastify({
  logger: false,
});

fastify.register(require("@fastify/cors"), {
  origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
});

fastify.register(require("@fastify/multipart"), {
  attachFieldsToBody: false,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

fastify.register(require("@fastify/postgres"), {
  connectionString:
    "postgresql://neondb_owner:npg_oY2EBJrcb5AR@ep-billowing-recipe-ad8vh7sp-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require",
});

const credentials = {
  web: {
    client_id:
      "508528174189-upsji6h2eip0dv4uqej1da7119ks66kr.apps.googleusercontent.com",
    project_id: "norteplandriveconcection",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_secret: "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",
    redirect_uris: [
      "http://localhost:3000/oauth2callback",
      "https://norteplanapi-production.up.railway.app/oauth2callback",
    ],
  },
};

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
