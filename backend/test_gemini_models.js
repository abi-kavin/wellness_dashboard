const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config({ path: 'd:/Wellness Dashboard/backend/.env' });

async function test() {
    try {
        console.log("Testing with Key Prefix: " + process.env.GEMINI_API_KEY.substring(0, 5));
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Let's try gemini-1.5-flash
        console.log("Trying gemini-1.5-flash...");
        try {
            const m1 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const r1 = await m1.generateContent("test");
            console.log("SUCCESS gemini-1.5-flash: " + r1.response.text().substring(0, 20));
        } catch (e) {
            console.log("FAILED gemini-1.5-flash: " + e.message);
        }

        // Let's try gemini-pro
        console.log("Trying gemini-pro...");
        try {
            const m2 = genAI.getGenerativeModel({ model: "gemini-pro" });
            const r2 = await m2.generateContent("test");
            console.log("SUCCESS gemini-pro: " + r2.response.text().substring(0, 20));
        } catch (e) {
            console.log("FAILED gemini-pro: " + e.message);
        }

        // Let's try gemini-1.0-pro
        console.log("Trying gemini-1.0-pro...");
        try {
            const m3 = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
            const r3 = await m3.generateContent("test");
            console.log("SUCCESS gemini-1.0-pro: " + r3.response.text().substring(0, 20));
        } catch (e) {
            console.log("FAILED gemini-1.0-pro: " + e.message);
        }

    } catch (e) {
        console.log("GLOBAL ERROR: " + e.message);
    }
}

test();
