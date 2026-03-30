import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

const envContent = fs.readFileSync('.env', 'utf-8');
const keyMatch = envContent.match(/VITE_GEMINI_API_KEY="?([^"\n]+)"?/);
const apiKey = keyMatch ? keyMatch[1] : null;

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log("AVAILABLE MODELS:", JSON.stringify(data.models.map(m => m.name), null, 2));
  } catch (err) {
    console.error("Critical Failure:", err);
  }
}
test();
