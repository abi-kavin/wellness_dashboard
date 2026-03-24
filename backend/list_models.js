const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config({ path: 'd:/Wellness Dashboard/backend/.env' });

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();
        const generateContentModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent")).map(m => m.name);
        fs.writeFileSync("models.json", JSON.stringify(generateContentModels, null, 2));
    } catch (e) {
        console.error(e);
    }
}
listModels();
