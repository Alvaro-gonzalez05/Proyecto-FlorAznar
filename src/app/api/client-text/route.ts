import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * API Route: Generación de texto para PDF del cliente (Prompt 6B)
 * Flujo de 2 pasos:
 * 1. Recibe análisis técnico interno
 * 2. Lo transforma en texto humano para el cliente
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { analysisTecnico, tieneSegundaParte } = body;

        if (!analysisTecnico || !process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Datos o API key faltantes' }, { status: 400 });
        }

        // PROMPT PRIMERA PARTE — Carta Normal (1 o 2 apellidos)
        const promptPrimera = `Actúa como especialista en autoconocimiento y desarrollo personal.
Tu tarea es transformar el análisis numerológico completo de esta persona en un TEXTO PROFUNDO, NATURAL, HUMANO Y FÁCIL DE LEER, como si fuera un capítulo de un libro personal.

IMPORTANTE:
- No uses tecnicismos numerológicos.
- No menciones términos como: número de alma, número de personalidad, misión, propósito, camino de vida, número raíz, número maestro, número kármico, subconsciente, inconsciente, sombra, ciclo de realización, cálculos, reducciones.
- No expliques números.
- No digas "tu número es..."
- Quiero que se lea natural, profundo y fluido.

BASE PARA EL INFORME:
${analysisTecnico}

ESTRUCTURA DEL TEXTO:
1. INTRODUCCIÓN (breve, cálida, explica que es una mirada de autoconocimiento, no un destino fijo)
2. SU MUNDO INTERNO (cómo vive internamente, qué la mueve, qué necesita)
3. SU FORMA DE ESTAR EN EL MUNDO (cómo actúa, cómo la perciben, qué energía proyecta)
4. LO QUE VINO A DESARROLLAR (sin decir "propósito" ni "misión")
5. EL TIPO DE CAMINO QUE VA HACIENDO (sin decir "camino de vida")
6. SUS TALENTOS NATURALES
7. HUELLAS TEMPRANAS DE SU HISTORIA (sin mencionar "mes de nacimiento" ni "ciclo")
8. APRENDIZAJES IMPORTANTES
9. TENDENCIAS QUE PODRÍAN BLOQUEARLA (con suavidad: "puede aparecer una tendencia a…")
10. CÓMO PUEDE EQUILIBRARSE (A. vida personal / B. vínculos / C. objetivos y vida material)
11. LA ETAPA QUE ESTÁ VIVIENDO HOY (sin decir "año personal")
12. INTEGRACIÓN FINAL
13. PREGUNTAS DE REFLEXIÓN

FORMA DE REDACTAR: natural, fluida, humana, profunda, como un libro personal, sin tecnicismos, sin fatalismo, sin etiquetar.
MUY IMPORTANTE: Todo lo del análisis técnico debe estar traducido. No omitas aprendizajes, talentos, bloqueos ni claves de equilibrio.`;

        const responsePrimera = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptPrimera,
            config: { temperature: 0.5 }
        });

        const textoPrimera = responsePrimera.text || '';

        // Si tiene segunda parte (sistema familiar, 3+ apellidos)
        let textoSegunda = '';
        if (tieneSegundaParte) {
            const promptSegunda = `Actúa como especialista en autoconocimiento, numerología evolutiva y desarrollo personal.
Tu tarea es transformar el análisis del sistema familiar de esta persona en un INFORME CLARO, PROFUNDO Y ACCIONABLE.

IMPORTANTE:
- No etiquetes a la persona.
- No digas "sos así".
- Explica energías como potenciales y aprendizajes.
- Usa lenguaje humano, claro y transformador.

DATOS O ANÁLISIS BASE:
${analysisTecnico}

ESTRUCTURA DEL INFORME:
1. INTRODUCCIÓN (este informe muestra patrones, talentos y aprendizajes del sistema familiar)
2. VISIÓN GENERAL DEL MAPA (energías principales, temas que se repiten, eje central)
3. LOS PATRONES MÁS IMPORTANTES (cómo se manifiestan, potencial, cuándo se vuelven bloqueo)
4. QUÉ VINO A APRENDER (desafíos de fondo, qué necesita desarrollar)
5. ETAPAS DEL PROCESO PERSONAL (años 30, 58, 87: qué aprendizaje se activa en cada etapa)
6. PATRONES INCONSCIENTES (tendencias automáticas, mandatos internos)
7. PRIMER MOVIMIENTO DE TRANSFORMACIÓN (puente iniciático: primer paso para salir del patrón)
8. DIRECCIÓN DE EVOLUCIÓN (puente de evolución: energía que ayuda a avanzar)
9. CLARIDAD PARA AVANZAR (qué necesita comprender o cambiar internamente)
10. FORTALEZAS
11. SÍNTESIS FINAL
12. PREGUNTAS DE REFLEXIÓN

ESTILO: claro, humano, profundo, sin juicio, orientado a claridad y crecimiento.`;

            const responseSegunda = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: promptSegunda,
                config: { temperature: 0.5 }
            });
            textoSegunda = responseSegunda.text || '';
        }

        return NextResponse.json({
            textoPrimera,
            textoSegunda,
        });

    } catch (error: any) {
        console.error('Error al generar texto para el cliente:', error);
        return NextResponse.json({ error: 'Error al generar texto para el cliente.' }, { status: 500 });
    }
}
