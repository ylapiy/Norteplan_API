const Fastify = require("fastify");
const { Connection } = require("pg");

const fastify = Fastify({
    logger: false
});

fastify.register(require("@fastify/postgres"), {ConnectionString:'postgresql://neondb_owner:npg_oY2EBJrcb5AR@ep-billowing-recipe-ad8vh7sp-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require', ssl: {rejectUnauthorized: false}
}
)

fastify.get("/projetos", function(req, res){
    res.send({hello : "world"});


});

fastify.listen({ port:3000}, function(error,address){
    
    if(error){
        console.log(erro);
        process.exit(1)
    }
    
    console.log("Servidor rodando", address);

})