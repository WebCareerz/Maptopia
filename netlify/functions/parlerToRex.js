exports.handler = async function(event, context) {
    // Petit code de diagnostic pour voir ce qui cloche
    const keyCheck = process.env.OPENAI_API_KEY ? "OUI (La clé est là)" : "NON (Clé manquante !)";
    
    return {
        statusCode: 200,
        body: JSON.stringify({ 
            reply: `🤖 TEST REX : Le système fonctionne ! Ma clé de sécurité est-elle visible ? -> ${keyCheck}` 
        })
    };
};
