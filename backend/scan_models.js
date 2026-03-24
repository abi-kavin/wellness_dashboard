const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config({ path: 'd:/Wellness Dashboard/backend/.env' });

async function check() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash"];
    let results = "";
    for (let m of models) {
        try {
            results += `Checking ${m}...\n`;
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("hi");
            results += `${m}: SUCCESS\n`;
        } catch (e) {
            results += `${m}: FAILED - ${e.message.substring(0, 100)}\n`;
        }
    }
    fs.writeFileSync("scan_results.json", results);
}
check();
