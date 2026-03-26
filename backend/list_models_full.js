const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config({ path: 'd:/Wellness Dashboard/backend/.env' });

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        fs.writeFileSync("models_full.json", JSON.stringify(data, null, 2));
    } catch (e) {
        fs.writeFileSync("models_full.json", JSON.stringify({ error: e.message }, null, 2));
    }
}
listModels();
