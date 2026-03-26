const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config({ path: 'd:/Wellness Dashboard/backend/.env' });
async function test() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const m = "gemini-2.5-flash";
    try {
        const mod = genAI.getGenerativeModel({ model: m });
        const res = await mod.generateContent("hi");
        console.log(`OK: ${m}`);
        console.log(res.response.text());
    } catch (e) {
        console.log(`FAIL: ${m} - ${e.message}`);
    }
}
test();
