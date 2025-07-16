const Fastify = require("fastify");

const fastify = Fastify({
  logger: false,
});

fastify.register(require("@fastify/postgres"), {
  connectionString: "postgresql://neondb_owner:npg_oY2EBJrcb5AR@ep-billowing-recipe-ad8vh7sp-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require",
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

fastify.put("/editaprojeto", async (req, res) => {

try{

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
      UPDATE projetos SET 
        engenheiro = $2, 
        municipio = $3, 
        objeto = $4, 
        prioridade = $5, 
        inicio = $6, 
        fim = $7,
        financiamento = $8, 
        vencimento_convenio = $9, 
        clasula_suspensiva = $10 
        observações = $11,
        WHERE id = $1`;

    const values = [
      Id,
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

}catch(error){




}

})


fastify.get("/getservicos", async (req, res) =>{
    
    try {
    const client = await fastify.pg.connect(); 
    const result = await client.query("SELECT * FROM serviços");
    client.release();
    res.send(result.rows); 

  } catch (error) {
    res.status(500).send(error);
  }



})


