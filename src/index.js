const { fastify } = require("./plugins.js");
require("./drive.js");
require("./banco.js");

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("Servidor rodando em:", address);
});
