const { fastify } = require("./plugins.js");
require("./drive.js");
require("./banco.js");

const { carregaTokensDoBanco } = require("./drive");

async function start() {
  await fastify.ready();
  await carregaTokensDoBanco();
  await fastify.listen({ port: process.env.PORT || 3000, host: "0.0.0.0" });
  console.log("Servidor iniciado em http://localhost:3000");
}

start();
