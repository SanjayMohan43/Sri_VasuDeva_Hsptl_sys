require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    console.log("Testing with API Key:", process.env.VITE_GEMINI_API_KEY.slice(0, 10) + "...");
    const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
    
    // Test gemini-1.5-flash
    let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    try {
        const result = await model.generateContent("Say hello");
        console.log("gemini-1.5-flash SUCCESS:", result.response.text());
    } catch (e) {
        console.log("gemini-1.5-flash FAILED:", e.message);
    }
    
  } catch (err) {
    console.error("Critical Failure:", err);
  }
}
test();
