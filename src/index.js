const Fastify = require("fastify");

const fastify = Fastify({
  logger: false,
});

fastify.register(require("@fastify/postgres"), {
  connectionString: "",
});

fastify.listen({ port: 3000 }, function (error, address) {
  if (error) {
    console.log(error); 
    process.exit(1);
  }

  console.log("Servidor rodando em:", address);
});

fastify.get("/getprojetos", async (req, res) => {
  try {
    const client = await fastify.pg.connect(); 
    const result = await client.query("SELECT * FROM projetos");
    client.release();
    res.send(result.rows); 
  } catch (error) {
    res.status(500).send(error);
  }
});

fastify.post("/criaprojeto", async (req, res) => {
  try {
    const client = await fastify.pg.connect();

    const {
      engenheiro,
      municipio,
      objeto,
      prioridade,
      inicio,
      fim,
      financiamento,
      vencimento_convenio,
      clasula_suspensiva,
      observações,
    } = req.body;

    const query = `
      INSERT INTO projetos (
        engenheiro, municipio, objeto, prioridade, inicio, fim,
        financiamento, vencimento_convenio, clasula_suspensiva, observações
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    const values = [
      engenheiro,
      municipio,
      objeto,
      prioridade,
      inicio,
      fim,
      financiamento,
      vencimento_convenio,
      clasula_suspensiva,
      observações
    ];

    await client.query(query, values);
    client.release();

    res.send({ success: true, message: "Olha o banco" });
  } catch (error) {
    res.status(500).send(error);
  }
});


