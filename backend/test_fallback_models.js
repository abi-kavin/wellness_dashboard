const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config({ path: 'd:/Wellness Dashboard/backend/.env' });
async function test() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const ms = [
        "gemini-2.0-flash-lite",
        "gemini-1.5-flash-8b",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-2.5-flash-lite"
    ];
    for (const m of ms) {
        try {
            console.log(`Testing: ${m}...`);
            const mod = genAI.getGenerativeModel({ model: m });
            const res = await mod.generateContent("hi");
            console.log(`OK: ${m}`);
            process.exit(0);
        } catch (e) {
            console.log(`FAIL: ${m} - ${e.message.substring(0, 100)}`);
        }
    }
}
test();
