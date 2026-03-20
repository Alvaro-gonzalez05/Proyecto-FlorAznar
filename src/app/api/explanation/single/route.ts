import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';
import { TYPE_TRANSLATIONS, DEFAULT_PROMPTS } from '@/lib/defaultPrompts';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
    try {
        const { key, numValue } = await request.json();

        if (!key || !numValue) {
            return NextResponse.json({ error: 'Payload incompleto' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not defined.");
        }

        // Determinar el nombre legible de la métrica
        let readableType = TYPE_TRANSLATIONS[key] || key;
        if (key.startsWith('sistema_familiar_linaje_')) {
            readableType = 'Sistema Familiar - Linaje';
        }

        // Fetch custom global instruction
        let globalInstruction = DEFAULT_PROMPTS['global_instruction'];
        try {
            const { data, error } = await supabase.from('prompts').select('prompt_text').eq('id', 'global_instruction').single();
            if (!error && data) {
                globalInstruction = data.prompt_text;
            }
        } catch (e) {
            console.error('Error fetching global instruction', e);
        }

        // Fetch custom prompt specific to this metric
        let specificInstruction = '';
        try {
            const { data, error } = await supabase.from('prompts').select('prompt_text').eq('id', key).single();
            if (!error && data) {
                specificInstruction = data.prompt_text;
            }
        } catch (e) {
            console.error('Error fetching custom prompt', e);
        }

        // Leer documentos de base
        const file1Path = path.join(process.cwd(), 'informacionParte1.txt');
        const file2Path = path.join(process.cwd(), 'informacionParte2.txt');

        const file1Text = await fs.readFile(file1Path, 'utf8').catch(() => '');
        const file2Text = await fs.readFile(file2Path, 'utf8').catch(() => '');

        let promptText = `${globalInstruction}

=== DOCUMENTO 1 ===
${file1Text}

=== DOCUMENTO 2 ===
${file2Text}

=== TU TAREA ===
Analiza la siguiente métrica específica de la persona:
Métrica: ${readableType}
Valor/Número: ${numValue}
`;

        if (specificInstruction) {
            promptText = `INSTRUCCIÓN PRINCIPAL Y OBLIGATORIA DEL USUARIO:
"""
${specificInstruction}
"""

NOTA PARA LA IA: Debes obedecer AL PIE DE LA LETRA la instrucción anterior por encima de TODO lo demás. Si te pide decir algo específico, cambiar el formato, o simplemente omitir el análisis y retornar algo exacto (ej: "solo di hola"), hazlo sin justificaciones ni agregados. El siguiente contenido es sólo contexto de apoyo:

${promptText}`;
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptText,
            config: {
                temperature: 0.3, 
            }
        });

        const reply = response.text || 'Sin explicación generada.';

        return NextResponse.json({ explanation: reply.trim() });

    } catch (error: any) {
        console.error('API Error with Gemini single generation:', error);
        return NextResponse.json({ error: 'Hubo un error al generar la explicación con IA.' }, { status: 500 });
    }
}
