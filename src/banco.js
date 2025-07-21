const { fastify } = require("./plugins.js");

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

fastify.get("/getprojetos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const client = await fastify.pg.connect();
    const result = await client.query("SELECT * FROM projetos WHERE id = $1", [
      id,
    ]);
    client.release();
    res.send(result.rows);
  } catch (error) {
    res.status(500).send(error);
  }
});

fastify.get("/getprojetos/serv", async (req, res) => {
  try {
    const id = req.params.id;
    const client = await fastify.pg.connect();
    const result = await client.query(`SELECT 
  p.id AS projeto_id,
  p.engenheiro,
  p.municipio,
  p.objeto,
  p.prioridade,
  p.inicio AS inicio_projeto,
  p.fim AS fim_projeto,
  p.financiamento,
  p.vencimento_convenio,
  p.clasula_suspensiva,
  p.observações,
  p.id_pastaPai,
  json_agg(
    json_build_object(
      'id_pasta', s.id_pasta,
      'serviço', s.serviço,
      'status', s.status,
      'inicio', s.inicio,
      'fim', s.fim
    )
  ) AS servicos
FROM 
  projetos p
LEFT JOIN 
  serviços s ON s.id_projeto = p.id
GROUP BY 
  p.id
ORDER BY 
  p.id`);
    client.release();
    res.send(result.rows);
  } catch (error) {
    res.status(500).send(error);
  }
});

fastify.post("/criaprojetos", async (req, res) => {
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
    id_pastapai,
  } = req.body;

  const query = `
      INSERT INTO projetos (
        engenheiro, municipio, objeto, prioridade, inicio, fim,
        financiamento, vencimento_convenio, clasula_suspensiva, observações, id_pastapai
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
    observações,
    id_pastapai,
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
    observações,
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

fastify.delete("/excluirprojetos/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const client = await fastify.pg.connect();

    await client.query("DELETE FROM serviços WHERE id_projeto = $1", [id]);
    await client.query("DELETE FROM projetos WHERE id = $1", [id]);

    client.release();

    res.send({ success: true, message: "Olha o banco" });
  } catch (error) {
    res.status(500).send(error);
  }
});

fastify.get("/getservicos", async (req, res) => {
  try {
    const client = await fastify.pg.connect();
    const result = await client.query("SELECT * FROM serviços");
    client.release();
    res.send(result.rows);
  } catch (error) {
    res.status(500).send(error);
  }
});

fastify.get("/getservicos/:id/:servico", async (req, res) => {
  try {
    const id = req.params.id;
    const servico = req.params.servico;

    const client = await fastify.pg.connect();
    const result = await client.query(
      "SELECT * FROM serviços WHERE id_projeto = $1 AND serviço = $2",
      [id, servico]
    );
    client.release();
    res.send(result.rows);
  } catch (error) {
    res.status(500).send(error);
  }
});

fastify.get("/getservicos/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const client = await fastify.pg.connect();
    const result = await client.query(
      "SELECT * FROM serviços WHERE id_projeto = $1",
      [id]
    );
    client.release();
    res.send(result.rows);
  } catch (error) {
    res.status(500).send(error);
  }
});

fastify.post("/criaservico", async (req, res) => {
  const { id_projeto, servico, status, inicio, fim, id_pasta } = req.body;

  const query = `
    INSERT INTO serviços (
    id_projeto, serviço, status, inicio, fim, id_pasta
    ) VALUES ($1, $2, $3, $4, $5, $6)`;

  const values = [id_projeto, servico, status, inicio, fim, id_pasta];

  try {
    const client = await fastify.pg.connect();
    await client.query(query, values);
    client.release();

    res.send({ success: true, message: "Olha o banco" });
  } catch (error) {
    res.status(500).send(error);
  }
});

fastify.put("/editarservicos/:id/:servico", async (req, res) => {
  const id_projeto = req.params.id;
  const servico = req.params.servico;

  const { status, inicio, fim } = req.body;

  const query = `
    UPDATE serviços SET
    id_projeto, serviço, status, inicio, fim
    WHERE id = $1 AND serviço = $2`;

  const values = [id_projeto, servico, status, inicio, fim];

  try {
    const client = await fastify.pg.connect();
    await client.query(query, values);
    client.release();

    res.send({ success: true, message: "Olha o banco" });
  } catch (error) {
    res.status(500).send(error);
  }
});

fastify.delete("/excluirservicos/:id/:servico", async (req, res) => {
  const id_projeto = req.params.id;
  const servico = req.params.servico;

  const query = `DELETE FROM serviços WHERE id_projeto = $1 AND serviço = $2`;

  const values = [id_projeto, servico];

  try {
    const client = await fastify.pg.connect();
    await client.query(query, values);
    client.release();

    res.send({ success: true, message: "Olha o banco" });
  } catch (error) {
    res.status(500).send(error);
  }
});

fastify.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  try {
    const client = await fastify.pg.connect();
    const respot = await client.query(
      `SELECT CASE 
      WHEN EXISTS (
        SELECT 1 FROM login 
        WHERE email = $1 AND senha = $2
      )
      THEN (
        SELECT acesso 
        FROM login 
        WHERE email = $1 AND senha = $2
        LIMIT 1
      )
      ELSE NULL
    END AS acesso`,
      [email, senha]
    );

    client.release();
    res.send(respot.rows);
  } catch (error) {
    res.status(500).send(error);
  }
});
