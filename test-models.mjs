import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function check() {
    try {
        console.log("Fetching models...");
        let response = await ai.models.list();
        for await (const model of response) {
            console.log(`- ${model.name} (Supported: ${model.supportedGenerationMethods?.join(', ') || 'none'})`);
        }
    } catch (e) {
        console.error("Error fetching", e);
    }
}
check();
