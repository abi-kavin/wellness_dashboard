const { GoogleGenerativeAI } = require("@google/generative-ai");
const Student = require("../models/Student");

const analyzePlatform = async (req, res) => {
    try {
        const students = await Student.find({});

        if (!process.env.GEMINI_API_KEY) {
            return res.status(200).json({
                success: true,
                summary: "AI Monitoring: No Gemini Key provided. (Mock Mode)",
                insights: [
                    "Attendance in IT department is slightly below average.",
                    "High stress levels detected in 15% of the student population.",
                    "Mental health score is stable across most departments."
                ]
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using gemini-2.5-flash which has available quota on this key
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const studentSummary = students.map(s => ({
            dept: s.department,
            cgpa: s.cgpa || 0,
            att: s.attendance || 0,
            stress: s.stressLevel || "Medium",
            risk: s.riskLevel || "Low"
        })).slice(0, 30);

        const prompt = `
      You are the "Wellness AI" for an Academic Wellness Risk Dashboard. 
      Analyze this student data summary: ${JSON.stringify(studentSummary)}
      
      Provide:
      1. A short summary of overall platform wellness.
      2. Exactly 3 brief "Indications" (insights about trends/risks).
      
      Respond STRICTLY in JSON:
      {
        "summary": "...",
        "insights": ["...", "...", "..."]
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("Could not find JSON in AI response");

        res.json(JSON.parse(jsonMatch[0]));

    } catch (error) {
        console.error("AI Analysis Error:", error);

        // Rate limit or quota exhaustion fallback
        if (error.message && (error.message.includes('429') || error.message.includes('quota') || error.message.includes('retry') || error.message.includes('Retry'))) {
            return res.status(200).json({
                success: true,
                summary: "System Notice: Free Tier API Rate limit reached. Using Mock Data for now.",
                insights: [
                    "Overall platform health is stable and normal.",
                    "Please wait a few moments before requesting real-time analytics.",
                    "Historical data indicates general low risk across departments."
                ]
            });
        }

        res.status(500).json({
            message: "AI Analysis failed",
            error: error.message,
            tip: "This usually happens when the API quota is exceeded or the model name is updated."
        });
    }
};

const handleQuery = async (req, res) => {
    let query;
    let students = [];
    try {
        query = req.body.query;
        if (!query) return res.status(400).json({ message: "Query is required" });

        students = await Student.find({}, "-password -__v");

        if (!process.env.GEMINI_API_KEY) {
            return res.status(200).json({
                answer: "I'm currently in Mock Mode. Please add GEMINI_API_KEY to .env to enable real AI responses."
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const studentData = students.map(s => ({
            name: s.name,
            registerNumber: s.registerNumber,
            department: s.department,
            cgpa: s.cgpa || 0,
            attendance: s.attendance || 0,
            stressLevel: s.stressLevel || 'Medium',
            riskLevel: s.riskLevel || 'Low'
        }));

        const prompt = `
      You are the "Wellness AI Assist" for an Academic Wellness Risk Dashboard.
      User question: "${query}"
      
      Here are the summarized records of all current students:
      ${JSON.stringify(studentData)}
      
      Platform statistics:
      - Student count: ${students.length}
      - Departments: ${[...new Set(students.map(s => s.department))].join(', ')}
      
      As a helpful, knowledgeable AI assistant, you should:
      1. Answer data-specific queries by looking at the provided student records accurately. Do not hallucinate data. If asked to list students, provide their actual names, register numbers, and the corresponding metrics.
      2. Answer general questions about the platform, features, academic wellness, stress management, or any other topics the user brings up. 
      3. If the user asks for advice, plans, or suggestions (like "schedule a stress management plan"), provide a helpful, constructive, and detailed response tailored to their needs.
      
      Format your response neatly using Markdown (lists, bold text, etc.). Always maintain a friendly, supportive tone.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ answer: response.text() });

    } catch (error) {
        console.error("AI Query Error:", error);

        // Smart Local Fallback Engine if Google API is exhausted
        if (error.message && (error.message.includes('429') || error.message.includes('quota') || error.message.includes('retry') || error.message.includes('Retry'))) {

            const lowerQuery = (query || "").toLowerCase();
            let fallbackAnswer = "⏱️ **API Quota Exceeded:** I'm currently running in Local Offline Mode due to API limits. I can only answer basic queries right now.\n\n";

            if (lowerQuery.includes("list") && lowerQuery.includes("student")) {
                fallbackAnswer += "**Here is the current list of students:**\n";
                students.forEach(s => {
                    fallbackAnswer += `- **${s.name}** (Reg: ${s.registerNumber}) | Dept: ${s.department} | CGPA: ${s.cgpa || 'N/A'}\n`;
                });
            } else if (lowerQuery.includes("risk")) {
                let targetLevel = "High"; // Default
                if (lowerQuery.includes("low")) targetLevel = "Low";
                else if (lowerQuery.includes("medium")) targetLevel = "Medium";

                const results = students.filter(s => s.riskLevel === targetLevel);
                if (results.length > 0) {
                    fallbackAnswer += `**Students at ${targetLevel} Risk:**\n`;
                    results.forEach(s => fallbackAnswer += `- **${s.name}** (${s.department})\n`);
                } else {
                    fallbackAnswer += `I couldn't find any students currently at ${targetLevel} risk.`;
                }
            } else if (lowerQuery.includes("cgpa")) {
                fallbackAnswer += "**Current Student CGPAs:**\n";
                students.forEach(s => fallbackAnswer += `- **${s.name}**: ${s.cgpa || 'N/A'}\n`);
            } else if (lowerQuery.includes("attendance")) {
                fallbackAnswer += "**Current Student Attendance:**\n";
                students.forEach(s => fallbackAnswer += `- **${s.name}**: ${s.attendance || 0}%\n`);
            } else if (lowerQuery.includes("hello") || lowerQuery.includes("hi")) {
                fallbackAnswer += "Hello! How can I help you analyze the platform data today? (Running in Offline Mode)";
            } else {
                fallbackAnswer += "I'm sorry, my advanced AI language skills are temporarily paused due to API quota limits. Try asking me to **'list all students'** or show **'high risk'** students!";
            }

            return res.status(200).json({ answer: fallbackAnswer });
        }

        res.status(200).json({ answer: `⚠️ AI Assistant encountered an error processing your query: ${error.message}` });
    }
};

module.exports = { analyzePlatform, handleQuery };
