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

        // Fetch per-card specific instruction — prefer Supabase, fall back to DEFAULT_PROMPTS
        let specificInstruction = DEFAULT_PROMPTS[key] || '';
        try {
            const { data, error } = await supabase.from('prompts').select('prompt_text').eq('id', key).single();
            if (!error && data?.prompt_text) {
                specificInstruction = data.prompt_text;
            }
        } catch (e) {
            console.error('Error fetching custom prompt', e);
        }

        // Leer documentos de base (bibliografía numerológica de referencia)
        const file1Path = path.join(process.cwd(), 'informacionParte1.txt');
        const file2Path = path.join(process.cwd(), 'informacionParte2.txt');

        const file1Text = await fs.readFile(file1Path, 'utf8').catch(() => '');
        const file2Text = await fs.readFile(file2Path, 'utf8').catch(() => '');

        // Build a focused, single-section prompt.
        // The per-card instruction is the PRIMARY directive — the docs are just knowledge reference.
        const promptText = `Eres un especialista en numerología pitagórica aplicada al autoconocimiento y desarrollo personal.

INSTRUCCIÓN ESPECÍFICA (sigue esto al pie de la letra, es lo único que debes responder):
"""
${specificInstruction || `Explica el significado de ${readableType} con valor ${numValue}. Máximo 200 palabras.`}
"""

DATOS A INTERPRETAR:
Sección: ${readableType}
Valores: ${numValue}

BIBLIOGRAFÍA DE REFERENCIA (usa solo como conocimiento base, NO generes un reporte completo del mapa):

--- DOCUMENTO 1 ---
${file1Text}

--- DOCUMENTO 2 ---
${file2Text}

RECUERDA: Tu respuesta debe limitarse estrictamente a lo que pide la instrucción específica. No generes análisis de otras secciones, ni un reporte completo del mapa numerológico.`;

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
