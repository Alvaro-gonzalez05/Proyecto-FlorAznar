import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';
import { DEFAULT_PROMPTS } from '@/lib/defaultPrompts';
import { buildDatosEstructurados } from '@/lib/buildDatosEstructurados';
import { buildContentsWithDocs } from '@/lib/numerologyDocs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Maps each output key (used by the frontend) → the DEFAULT_PROMPTS key that contains instructions for it
const KEY_PROMPT_MAP: Record<string, string> = {
    vibracion_interna: 'vibracion_interna',
    alma: 'alma',
    personalidad: 'personalidad',
    mision: 'mision',
    camino_de_vida: 'camino_de_vida',
    fuerza: 'fuerza',
    inconsciente: 'inconsciente',
    sombra: 'inconsciente',        // sombra is explained together with inconsciente
    anio_personal: 'anio_personal',
    mes_personal: 'anio_personal', // mes_personal grouped with anio_personal
    talento: 'fecha',
    karma_mes: 'fecha',
    pasado: 'fecha',
    letras_faltantes: 'letras_faltantes',
    subconsciente_i: 'subconsciente',
    subconsciente_o: 'subconsciente',
    ciclo_actual: 'ciclos',
    ciclos_desafios: 'ciclos',
    ciclo_1: 'ciclo_1',
    ciclo_2: 'ciclo_2',
    ciclo_3: 'ciclo_3',
    ciclo_4: 'ciclo_4',
    desafio_1: 'desafio_1',
    desafio_2: 'desafio_2',
    desafio_3: 'desafio_3',
    desafio_4: 'desafio_4',
    casas_9: 'casas_9',
    ser_interior: 'ser_interior',
    equilibrio: 'equilibrio',
    regalo_divino: 'regalo_divino',
    planos_existenciales: 'planos_existenciales',
};

const OUTPUT_KEYS = Object.keys(KEY_PROMPT_MAP);

export async function POST(request: Request) {
    try {
        const { dataStr, metricsPayload } = await request.json();

        if (!dataStr) {
            return NextResponse.json({ error: 'Faltan datos de la persona.' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not defined.');
        }

        const data = JSON.parse(dataStr);

        // Determine unique prompt keys we need to fetch from Supabase
        const uniquePromptKeys = [...new Set(Object.values(KEY_PROMPT_MAP))];

        // Initialize with defaults
        const sectionPrompts: Record<string, string> = {};
        for (const key of uniquePromptKeys) {
            sectionPrompts[key] = DEFAULT_PROMPTS[key] || '';
        }

        // Override with any custom prompts saved in Supabase
        try {
            const { data: dbPrompts } = await supabase
                .from('prompts')
                .select('id, prompt_text')
                .in('id', uniquePromptKeys);
            if (dbPrompts) {
                for (const row of dbPrompts) {
                    if (row.prompt_text) sectionPrompts[row.id] = row.prompt_text;
                }
            }
        } catch { /* ignore */ }

        // Build structured data string from the numerology result
        const datosStr = buildDatosEstructurados(data);

        // Build section-by-section instructions with specific values per key
        const sectionInstructions = OUTPUT_KEYS.map(key => {
            const promptKey = KEY_PROMPT_MAP[key];
            const instruction = sectionPrompts[promptKey] || `Proporciona una explicación para "${key}".`;
            const specificValue = metricsPayload?.[key]
                ? `\n  [Datos específicos para esta sección]: ${metricsPayload[key]}`
                : '';
            return `• "${key}":${specificValue}\n  [Instrucción]: ${instruction}`;
        }).join('\n\n');

        // Simple, focused system prompt — NOT the 22-section analyst prompt
        const superPrompt = `Eres un especialista en numerología pitagórica aplicada al autoconocimiento y desarrollo personal.

Tu tarea es generar explicaciones individuales y enfocadas para cada sección de la carta numerológica de esta persona. REGLA FUNDAMENTAL: cada explicación debe limitarse EXCLUSIVAMENTE a su propia sección, respetando el límite de palabras indicado. NO mezcles secciones ni generes un análisis global del mapa.

=== DATOS COMPLETOS DE LA PERSONA ===
${datosStr}

=== BIBLIOGRAFÍA DE REFERENCIA (solo como base de conocimiento) ===
Consulta los documentos adjuntos.

=== INSTRUCCIONES POR SECCIÓN ===
Genera una explicación para cada clave JSON siguiendo estrictamente su instrucción:

${sectionInstructions}

=== FORMATO DE RESPUESTA OBLIGATORIO ===
Responde ÚNICAMENTE con un objeto JSON válido. Sin bloques markdown. Sin texto fuera del JSON.
Claves exactas: ${OUTPUT_KEYS.map(k => `"${k}"`).join(', ')}.
Cada valor es el texto de la explicación en español para esa sección.`;

        const contents = await buildContentsWithDocs(superPrompt);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                responseMimeType: 'application/json',
                temperature: 0.3,
            },
        });

        const rawText = response.text || '{}';
        let explanations: Record<string, string> = {};

        try {
            explanations = JSON.parse(rawText);
        } catch {
            // Fallback: try to extract a JSON object from the response
            const match = rawText.match(/\{[\s\S]*\}/);
            if (match) {
                try { explanations = JSON.parse(match[0]); } catch { /* best effort */ }
            }
        }

        return NextResponse.json({ explanations });

    } catch (error: any) {
        console.error('API Error in analysis-complete:', error);
        return NextResponse.json({ error: 'Error al generar el análisis completo.' }, { status: 500 });
    }
}
