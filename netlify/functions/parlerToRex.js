// Fichier : netlify/functions/parlerToRex.js
// VERSION "TOUT-TERRAIN" (Compatible avec tous les serveurs)

const https = require('https'); // On utilise l'outil de base de Node.js

exports.handler = async function(event, context) {
    // 1. Sécurité
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // 2. Récupérer le message
    let body;
    try { body = JSON.parse(event.body); } catch(e) { return { statusCode: 400, body: "Erreur lecture" }; }
    const userMessage = body.message;
    const API_KEY = process.env.OPENAI_API_KEY;

    // 3. Configuration de la requête vers OpenAI
    const postData = JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
            { 
                role: "system", 
                content: "Tu es REX, l'IA de Maptopia (Heartopia). Tu es utile, geek et sympa. Réponds en français (max 50 mots). Infos: Myrtilles au Nord, Poissons rares en mer calme." 
            },
            { role: "user", content: userMessage }
        ],
        temperature: 0.7
    });

    const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    // 4. Envoi de la requête (Méthode compatible Anciens Serveurs)
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';

            // On reçoit les morceaux de réponse
            res.on('data', (chunk) => {
                data += chunk;
            });

            // Quand c'est fini
            res.on('end', () => {
                try {
                    const jsonResponse = JSON.parse(data);
                    if (jsonResponse.choices && jsonResponse.choices.length > 0) {
                        resolve({
                            statusCode: 200,
                            body: JSON.stringify({ reply: jsonResponse.choices[0].message.content })
                        });
                    } else {
                        // Si OpenAI renvoie une erreur (ex: clé invalide)
                        console.log("Erreur OpenAI:", jsonResponse);
                        resolve({
                            statusCode: 500,
                            body: JSON.stringify({ reply: "Mon cerveau est embrouillé (Erreur API)." })
                        });
                    }
                } catch (e) {
                    resolve({ statusCode: 500, body: JSON.stringify({ reply: "Erreur de lecture cerveau." }) });
                }
            });
        });

        req.on('error', (e) => {
            console.error(e);
            resolve({ statusCode: 500, body: JSON.stringify({ reply: "Je n'arrive pas à contacter Internet." }) });
        });

        // Envoyer les données
        req.write(postData);
        req.end();
    });
};
