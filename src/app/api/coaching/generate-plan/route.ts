import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { DEFAULT_PROMPTS } from '@/lib/defaultPrompts';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const ETAPA_KEYS = ['coaching_etapa_1', 'coaching_etapa_2', 'coaching_etapa_3'] as const;

const ETAPA_TITULOS_DEFAULT = [
    'Autoconocimiento y Patrones',
    'Bloqueos y Recursos',
    'Acción y Transformación',
];

// Boilerplate técnico que se añade automáticamente. Flor no necesita escribirlo.
function buildFormatInstruction(idx: number): string {
    const tituloDefault = ETAPA_TITULOS_DEFAULT[idx];
    return `

=== FORMATO DE SALIDA OBLIGATORIO ===
Respondé SOLO con un JSON válido (sin markdown, sin comentarios, sin texto adicional alrededor) con esta estructura exacta:
{
  "titulo": "${tituloDefault}",
  "descripcion": "Descripción breve (2 oraciones) de qué se trabajará en esta etapa específica para esta persona.",
  "preguntas": [
    "Pregunta 1 personalizada en base al análisis",
    "Pregunta 2",
    "Pregunta 3",
    "Pregunta 4",
    "Pregunta 5"
  ]
}
Las "preguntas" deben ser exactamente 5, en español, dirigidas en segunda persona (vos/tú) al cliente.`;
}

function stripJson(raw: string): string {
    return raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
}

export async function POST(request: NextRequest) {
    try {
        const { numerologyData, resumenAnalista, consultaId, nombreCliente } = await request.json();

        if (!numerologyData) {
            return NextResponse.json({ error: 'Datos de numerología requeridos' }, { status: 400 });
        }
        if (!resumenAnalista || typeof resumenAnalista !== 'string') {
            return NextResponse.json({ error: 'Resumen Analista requerido — generá primero el análisis del analista' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
        );

        // Fetch the 3 etapa prompts (DB overrides falling back to defaults)
        const { data: dbPrompts } = await supabase
            .from('prompts')
            .select('type, content')
            .in('type', [...ETAPA_KEYS]);

        const dbMap: Record<string, string> = {};
        (dbPrompts || []).forEach((p: any) => { dbMap[p.type] = p.content; });

        const dataStr = JSON.stringify(numerologyData, null, 2);

        // Context block prepended automatically before each etapa prompt.
        // Flor no need to write any [DATOS_PERSONA] / [RESUMEN_ANALISTA] placeholders.
        const contextBlock = `=== DATOS NUMEROLÓGICOS DE LA PERSONA ===
${dataStr}

=== ANÁLISIS PROFESIONAL DEL ANALISTA (Resumen Analista IA) ===
${resumenAnalista}

=== INSTRUCCIONES DE LA COACH (qué hacer con los datos de arriba) ===
`;

        // Run 3 etapa generations in parallel
        const etapaPromises = ETAPA_KEYS.map(async (key, idx) => {
            const promptTpl = dbMap[key] || DEFAULT_PROMPTS[key];
            // Backwards compat: still strip any old placeholders if present
            const userPrompt = promptTpl
                .replace('[DATOS_PERSONA]', '')
                .replace('[RESUMEN_ANALISTA]', '');
            const prompt = contextBlock + userPrompt + buildFormatInstruction(idx);

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const rawText = response.text ?? '';
            const jsonText = stripJson(rawText);

            try {
                const etapa = JSON.parse(jsonText);
                return {
                    numero: idx + 1,
                    titulo: etapa.titulo || `Etapa ${idx + 1}`,
                    descripcion: etapa.descripcion || '',
                    preguntas: Array.isArray(etapa.preguntas) ? etapa.preguntas : [],
                };
            } catch {
                throw new Error(`La IA no devolvió JSON válido para etapa ${idx + 1}: ${rawText.slice(0, 200)}`);
            }
        });

        let etapas;
        try {
            etapas = await Promise.all(etapaPromises);
        } catch (err: any) {
            return NextResponse.json({ error: err?.message || 'Error generando etapas' }, { status: 500 });
        }

        // Build contexto from the first ~700 chars of the resumen analista
        const contexto = resumenAnalista.length > 700
            ? resumenAnalista.slice(0, 700).trim() + '...'
            : resumenAnalista.trim();

        const plan = { contexto, etapas };

        const insertData: any = {
            numerology_data: numerologyData,
            ai_coaching_plan: plan,
            nombre_cliente: nombreCliente ?? null,
        };
        if (consultaId) insertData.consulta_id = consultaId;

        const { data: session, error: insertError } = await supabase
            .from('coaching_sessions')
            .insert([insertData])
            .select('id, client_token')
            .single();

        if (insertError) {
            console.error('Error inserting coaching session:', insertError);
            return NextResponse.json({ error: 'Error guardando sesión de coaching' }, { status: 500 });
        }

        return NextResponse.json({
            sessionId: session.id,
            clientToken: session.client_token,
            plan,
        });
    } catch (err) {
        console.error('Error in generate-plan:', err);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
