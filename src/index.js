const Fastify = require("fastify");

const fastify = Fastify({
  logger: false,
});

fastify.register(require("@fastify/postgres"), {
  connectionString: "postgresql://neondb_owner:npg_oY2EBJrcb5AR@ep-billowing-recipe-ad8vh7sp-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require",
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
  
  
    try {

    const client = await fastify.pg.connect();
    await client.query(query, values);
    client.release();

    res.send({ success: true, message: "Olha o banco" });
  } catch (error) {
    res.status(500).send(error);
  }
});

fastify.put("/projetos/:id", async (req, res) => {
  const id = req.params.id;

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
    observações
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
        clasula_suspensiva = $10,
        observações = $11
      WHERE id = $1`;

    const values = [
      id,
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

  try {
    
    const client = await fastify.pg.connect();
    await client.query(query, values);
    client.release();

    res.send({ success: true, message: "Projeto atualizado com sucesso!" });

  } catch (error) {
    res.status(500).send(error);
  }
});




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

fastify.post("/criaservico", async(req, res) =>{

    const {
    id_projeto,
    servico,
    status,
    inicio,
    fim
    } = req.body;

    const query = `
    INSERT INTO serviços (
    id_projeto, serviço, status, inicio, fim
    ) VALUES ($1, $2, $3, $4, $5)`;

    const values = [
    id_projeto,
    servico,
    status,
    inicio,
    fim
    ]

    try{

    const client = await fastify.pg.connect(); 
    await client.query(query, values);
    client.release();

    res.send({ success: true, message: "Olha o banco" });
    } catch (error) {
    res.status(500).send(error);
    }



})

fastify.put("/editarservicos/:id/:servico", async(req, res) =>{
    const id_projeto = req.params.id;
    const servico  = req.params.servico;

   const {
    status,
    inicio,
    fim
    } = req.body;

    const query = `
    UPDATE serviços 
    id_projeto, serviço, status, inicio, fim
    WHERE id = $1 AND serviço = $2`;

    const values = [
    id_projeto,
    servico,
    status,
    inicio,
    fim
    ]

    try{

    const client = await fastify.pg.connect(); 
    await client.query(query, values);
    client.release();

    res.send({ success: true, message: "Olha o banco" });
    } catch (error) {
    res.status(500).send(error);
    }

});

fastify.delete("/excluirservicos/:id/:servico", async(req, res) =>{
    
    const id_projeto = req.params.id;
    const servico  = req.params.servico;

    const query = `DELETE FROM serviços WHERE id_projeto = $1 AND serviço = $2`;

    const values = [
    id_projeto,
    servico,
    ]

    try{
        
    const client = await fastify.pg.connect(); 
    await client.query(query, values);
    client.release();

    res.send({ success: true, message: "Olha o banco" });
    } catch (error) {
    res.status(500).send(error);
    }



});

fastify.listen({ port: 3000 }, function (error, address) {
  if (error) {
    console.log(error); 
    process.exit(1);
  }

  console.log("Servidor rodando em:", address);
});


