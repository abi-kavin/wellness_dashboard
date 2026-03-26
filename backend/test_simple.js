const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config({ path: 'd:/Wellness Dashboard/backend/.env' });
async function test() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const ms = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    for (const m of ms) {
        try {
            const mod = genAI.getGenerativeModel({ model: m });
            const res = await mod.generateContent("hi");
            console.log(`OK: ${m}`);
            process.exit(0);
        } catch (e) {
            console.log(`FAIL: ${m} - ${e.message.substring(0, 50)}`);
        }
    }
}
test();
