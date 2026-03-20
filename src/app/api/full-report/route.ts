import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '@/lib/supabase';
import { DEFAULT_PROMPTS } from '@/lib/defaultPrompts';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
    try {
        const { type, dataStr } = await request.json();

        if (!dataStr) {
            return NextResponse.json({ error: 'Faltan datos de consulta.' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not defined.");
        }

        const data = JSON.parse(dataStr);
        const hasSegundaParte = !!data.segundaParte;

        let promptText = '';
        if (type === 'analista') {
            let customAnalista = '';
            try {
                const { data } = await supabase.from('prompts').select('prompt_text').eq('id', 'resumen_analista').single();
                if (data) customAnalista = data.prompt_text;
            } catch (e) {}

            promptText = customAnalista || DEFAULT_PROMPTS['resumen_analista'];
            promptText = promptText.replace('[DATOS_PERSONA]', dataStr).replace('[PEGAR AQUÍ NOMBRE COMPLETO, FECHA DE NACIMIENTO Y TODOS LOS CÁLCULOS]', dataStr).replace('[PEGAR AQUÍ LOS DATOS DEL SISTEMA]', dataStr);
        } else if (type === 'cliente') {
            let customCliente = '';
            try {
                const { data } = await supabase.from('prompts').select('prompt_text').eq('id', 'resumen_cliente').single();
                if (data) customCliente = data.prompt_text;
            } catch (e) {}

            promptText = customCliente || DEFAULT_PROMPTS['resumen_cliente'];
            promptText = promptText.replace('[DATOS_PERSONA]', dataStr).replace('[PEGAR AQUÍ EL ANÁLISIS INTERNO COMPLETO]', dataStr).replace('[PEGAR AQUÍ EL ANÁLISIS GENERADO POR EL PROMPT INTERNO]', dataStr);
        } else {
            return NextResponse.json({ error: 'Tipo de resumen inválido.' }, { status: 400 });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptText,
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
