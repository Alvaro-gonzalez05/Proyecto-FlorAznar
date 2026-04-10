
import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { buildContentsWithDocs } from '@/lib/numerologyDocs';
import { supabase } from '@/lib/supabase';
import { DEFAULT_PROMPTS } from '@/lib/defaultPrompts';

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { section, value, context, nombre, sectionData } = body;

        if (!section || !value) {
            return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error("GEMINI_API_KEY is not defined.");
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // --- FETCH CUSTOM PROMPTS FROM DB ---
        // Start mixed prompts logic
        let finalGlobalPrompt = DEFAULT_PROMPTS['global_instruction'] || '';
        
        // --- NEW LOGIC: ALWAYS USE GENERIC SECTION TEMPLATE ---
        // We no longer fetch specific section prompts from DB for cards, only the global one.
        // We use the GENERIC_SECTION_PROMPT from defaults, which relies on the Global Instruction.
        let finalSectionPrompt = DEFAULT_PROMPTS['GENERIC_SECTION_PROMPT'] || `
TAREA: Analiza la sección "[SECCION]" de la carta numerológica de [NOMBRE].

VALOR PRINCIPAL: [VALOR]
[CONTEXTO]
[DATOS]

INSTRUCCIONES:
1. Usa la INSTRUCCIÓN GLOBAL MAESTRA para interpretar este resultado.
2. Sé conciso pero profundo.
`;

        try {
            // Fetch ONLY global instruction (and maybe reports if we were in that endpoint, but this is explain route)
            const { data: promptsData } = await supabase
                .from('prompts')
                .select('id, prompt_text')
                .eq('id', 'global_instruction')
                .maybeSingle(); // Changed single to maybeSingle

            if (promptsData && promptsData.prompt_text) {
                finalGlobalPrompt = promptsData.prompt_text;
            }
        } catch (dbError) {
            console.warn('Could not fetch custom prompts, using defaults.', dbError);
        }

        // Build data blocks
        const dataBlock = sectionData ? `\n\n=== DATOS COMPLETOS (Raw Data) ===\n${JSON.stringify(sectionData, null, 2)}\n` : '';
        const contextBlock = context ? `\n\n=== CONTEXTO PREVIO ===\n${context}` : '';
        const nameBlock = nombre || 'el consultante';

        // --- REPLACE PLACEHOLDERS ---
        let processedSectionPrompt = finalSectionPrompt
            .replace(/\[SECCION\]/g, section)
            .replace(/\[NOMBRE\]/g, nameBlock)
            .replace(/\[VALOR\]/g, String(value))
            .replace(/\[CONTEXTO\]/g, contextBlock)
            .replace(/\[DATOS\]/g, dataBlock);

        // Fallback: If placeholders are missing in custom prompt, append data automatically so AI context is not lost
        if (!finalSectionPrompt.includes('[VALOR]') && !finalSectionPrompt.includes('[DATOS]')) {
             processedSectionPrompt += `\n\n--- DATOS AUTOMÁTICOS ---\nVALOR PRINCIPAL: ${value}\n${contextBlock}\n${dataBlock}`;
        }

        const fullPrompt = `${finalGlobalPrompt}\n\n${processedSectionPrompt}`;

        const contents = await buildContentsWithDocs(fullPrompt);

        // Call Gemini 1.5 Flash
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents,
            config: {
                temperature: 0.4,
            }
        });

        const explanation = response.text || '';
        return NextResponse.json({ explanation });

    } catch (error: any) {
        console.error('Error in /api/explain:', error);
        return NextResponse.json({ error: 'Failed to generate explanation', details: error.message }, { status: 500 });
    }
}
