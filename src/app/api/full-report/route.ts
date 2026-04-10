import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';
import { DEFAULT_PROMPTS } from '@/lib/defaultPrompts';
import { buildDatosEstructurados } from '@/lib/buildDatosEstructurados';
import { buildContentsWithDocs } from '@/lib/numerologyDocs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
    try {
        const { type, dataStr, explicaciones } = await request.json();

        if (!dataStr) {
            return NextResponse.json({ error: 'Faltan datos de consulta.' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not defined.");
        }

        const data = JSON.parse(dataStr);
        const legibleData = buildDatosEstructurados(data);

        // Fetch the analyst's custom instructions (prompt = style/tone/rules only, NOT data)
        let instructions = '';
        const promptKey = type === 'analista' ? 'resumen_analista' : type === 'cliente' ? 'resumen_cliente' : null;
        if (!promptKey) {
            return NextResponse.json({ error: 'Tipo de resumen inválido.' }, { status: 400 });
        }
        try {
            const { data: row } = await supabase.from('prompts').select('prompt_text').eq('id', promptKey).single();
            if (row?.prompt_text) instructions = row.prompt_text;
        } catch (e) {}
        if (!instructions) instructions = DEFAULT_PROMPTS[promptKey] || '';

        // Strip any old placeholder tokens so they don't appear literally in the prompt
        instructions = instructions
            .replace(/\[DATOS_PERSONA\]/g, '')
            .replace(/\[PEGAR AQUÍ[^\]]*\]/g, '')
            .trim();

        // Always build the final prompt as: instructions + data (unconditional)
        let promptText = `${instructions}\n\n=== DATOS NUMEROLÓGICOS DE LA PERSONA ===\n${legibleData}`;

        if (type === 'cliente') {
            // If per-card explanations are available, inject them as context
            if (explicaciones && typeof explicaciones === 'object' && Object.keys(explicaciones).length > 0) {
                const explicacionesStr = Object.entries(explicaciones)
                    .map(([k, v]) => `[${k}]: ${v}`)
                    .join('\n\n');
                promptText += `\n\n=== ANÁLISIS PREVIO POR SECCIÓN (úsalo como base para el reporte al cliente) ===\n${explicacionesStr}`;
            }
        }

        const contents = await buildContentsWithDocs(promptText);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                temperature: 0.5,
            }
        });

        const reply = response.text || '';

        return NextResponse.json({ summary: reply });

    } catch (error: any) {
        console.error('API Error with Gemini full report:', error);
        return NextResponse.json({ error: 'Hubo un error al generar el resumen. Revisa los logs.' }, { status: 500 });
    }
}
