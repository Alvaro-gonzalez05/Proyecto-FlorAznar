import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function check() {
    try {
        console.log("Fetching models...");
        let response = await ai.models.list();
        for await (const model of response) {
            console.log(`- ${model.name} (Supported: ${model.supportedGenerationMethods?.join(', ')})`);
        }
    } catch (e) {
        console.error("Error fetching", e);
    }
}
check();
