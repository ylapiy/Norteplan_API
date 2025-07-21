const { fastify } = require("./plugins.js");
require("./drive.js");
require("./banco.js");

const { carregaTokensDoBanco } = require("./drive");

async function start() {
  await fastify.ready();
  await carregaTokensDoBanco();
  await fastify.listen({ port: 3000 });
  console.log("Servidor iniciado em http://localhost:3000");
}

start();
