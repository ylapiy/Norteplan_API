const { google } = require("googleapis");
const Fastify = require("fastify");
const fastify = Fastify({
  logger: false,
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

const credentials = require("./client_secret_508528174189-upsji6h2eip0dv4uqej1da7119ks66kr.apps.googleusercontent.com.json");

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
