import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { DEFAULT_PROMPTS } from '@/lib/defaultPrompts';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: NextRequest) {
    try {
        const { sessionId, token } = await request.json();

        if (!sessionId || !token) {
            return NextResponse.json({ error: 'sessionId y token requeridos' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
        );

        // Fetch the session, verifying token
        const { data: session, error: fetchError } = await supabase
            .from('coaching_sessions')
            .select('*')
            .eq('id', sessionId)
            .eq('client_token', token)
            .single();

        if (fetchError || !session) {
            return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 });
        }

        // Fetch synthesis prompt
        let synthesisPrompt = DEFAULT_PROMPTS['coaching_sintesis'];
        try {
            const { data } = await supabase
                .from('prompts')
                .select('content')
                .eq('type', 'coaching_sintesis')
                .single();
            if (data?.content) synthesisPrompt = data.content;
        } catch { /* use default */ }

        const dataStr = JSON.stringify(session.numerology_data, null, 2);

        // Format client responses for the prompt
        const plan = session.ai_coaching_plan;
        let respuestasTexto = '';
        if (plan?.etapas && session.respuestas_cliente) {
            for (const etapa of plan.etapas) {
                const etapaRespuestas = session.respuestas_cliente[etapa.numero] || {};
                respuestasTexto += `\n\nEtapa ${etapa.numero}: ${etapa.titulo}\n`;
                for (let i = 0; i < etapa.preguntas.length; i++) {
                    const resp = etapaRespuestas[i] || '(sin respuesta)';
                    respuestasTexto += `  P${i + 1}: ${etapa.preguntas[i]}\n  R: ${resp}\n`;
                }
            }
        }

        const prompt = `=== DATOS NUMEROLÓGICOS DE LA PERSONA ===
${dataStr}

=== RESPUESTAS DEL CLIENTE A LAS 3 ETAPAS ===
${respuestasTexto}

=== INSTRUCCIONES DE LA COACH ===
` + synthesisPrompt
            .replace('[DATOS_PERSONA]', '')
            .replace('[RESPUESTAS_CLIENTE]', '') + `

=== FORMATO DE SALIDA OBLIGATORIO ===
Respondé SOLO con un JSON válido (sin markdown, sin comentarios, sin texto adicional alrededor) con esta estructura exacta:
{
  "sintesis": "Párrafo de síntesis del proceso del cliente (3-4 oraciones). Qué reveló, qué reconoció, qué está listo para mover.",
  "acciones": [
    {
      "titulo": "Título corto de la acción",
      "descripcion": "Descripción concreta de qué hacer, por qué es importante para esta persona en particular, y cómo empezar."
    }
  ]
}
Máximo 8 acciones. Texto en español, dirigido en segunda persona al cliente.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const rawText = response.text ?? '';
        const jsonText = rawText
            .replace(/^```(?:json)?\s*/i, '')
            .replace(/```\s*$/, '')
            .trim();

        let synthesis: any;
        try {
            synthesis = JSON.parse(jsonText);
        } catch {
            return NextResponse.json({ error: 'La IA no devolvió JSON válido', raw: rawText }, { status: 500 });
        }

        // Save synthesis to the session
        const accionesStr = JSON.stringify(synthesis);
        await supabase
            .from('coaching_sessions')
            .update({ acciones_ia: accionesStr, estado: 'completado' })
            .eq('id', sessionId);

        return NextResponse.json({ synthesis });
    } catch (err) {
        console.error('Error in generate-synthesis:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
