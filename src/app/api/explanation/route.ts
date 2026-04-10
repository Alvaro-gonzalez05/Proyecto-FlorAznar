import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { buildContentsWithDocs } from '@/lib/numerologyDocs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper to normalize the incoming number parameter
function normalizeNumberArg(num: string | null): string {
    if (!num) return '';
    return num.toString().trim();
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body || typeof body !== 'object' || Object.keys(body).length === 0) {
            return NextResponse.json({ error: 'Payload vacío o inválido' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not defined.");
        }

        // 1. Build mapping of internal type names to readable prompts
        const typeTranslations: Record<string, string> = {
            'vibracion_interna': 'Vibración Interna (o Cálculo del Impulso)',
            'alma': 'Cálculo de Alma',
            'personalidad': 'Cálculo de Personalidad',
            'mision': 'Misión (o Sendero/Destino)',
            'camino_de_vida': 'Día de Nacimiento / Camino de Vida (buscar Luz/Sombra)',
            'fuerza': 'Número de Fuerza (Potenciador)',
            'sombra': 'Número de Sombra (buscar debajo del subtítulo de la sombra en la vibración del número)',
            'anio_personal': 'Año Personal',
            'mes_personal': 'Mes Personal',
            'talento': 'Don / Talento de la fecha de nacimiento (Día)',
            'karma_mes': 'Karma / Tensión de la fecha de nacimiento (Mes)',
            'pasado': 'Memoria de Vida Pasada de la fecha de nacimiento (Año)',
            'letras_faltantes': 'Lecciones Kármicas (estos son los números pitagóricos con valor 0 o faltantes en el nombre, que indican deuda u obstáculos a trabajar)',
            'subconsciente_i': 'Número de Subconsciente I (suma de los 3 primeros ciclos de realización)',
            'subconsciente_o': 'Número de Subconsciente O (suma de los 3 primeros desafíos)',
            'inconsciente': 'Número del Inconsciente (4to ciclo + camino de vida)',
            'ciclo_actual': 'Ciclo de Realización Actual (etapa vital actual)',
            'ciclos_desafios': 'Mapa del Diamante (Análisis en conjunto de los 4 Ciclos de Realización y los 4 Desafíos)',
            'casas_9': 'Cuadro de las 9 Casas (panorama general de los habitantes y puente de evolución global)',
            'sistema_familiar_herencia': 'Sistema Familiar - Herencia Familiar',
            'sistema_familiar_evolucion': 'Sistema Familiar - Evolución Familiar',
            'sistema_familiar_expresion': 'Sistema Familiar - Campo de Expresión',
            'sistema_familiar_potencial': 'Sistema Familiar - Potencial Evolutivo'
        };

        // Prepare the text indicating what to analyze
        let analysisRequestStr = "Analiza las siguientes métricas y sus números asociados:\n";
        for (const [key, num] of Object.entries(body)) {
            let readableType = typeTranslations[key] || key;
            if (key.startsWith('sistema_familiar_linaje_')) {
                readableType = 'Sistema Familiar - Linaje (buscar en el Desglose por casas/habitantes)';
            }
            analysisRequestStr += `- ${key} (${readableType}): Número ${num}\n`;
        }

        // 2. Ask Gemini to process ALL of them in batch and return JSON
        const promptText = `Eres un experto en Numerología Pitagórica de alto nivel. 
Tu única fuente de verdad bibliográfica son los documentos adjuntos. Mantente muy estricto al tono y a la información contenida en estos libros, sin inventar atribuciones numéricas.

=== TU TAREA ===
${analysisRequestStr}

Para CADA métrica en esta lista:
1. Sé EXTREMADAMENTE CONCISO pero PROFUNDO. Evita textos y resúmenes largos. Ve directo al poder, reto o significado esencial, sin rodeos, asegurando que se explique bien.
2. TEN EN CUENTA que algunos valores incluyen DESGLOSES DETALLADOS. Explica breve y directamente cada sub-componente por separado, y luego el total.
3. Extraé de la bibliografía de arriba una explicación profunda, y resumila fuertemente para que el cliente la pueda leer rápido en pantalla.
4. Si un número es "Número Maestro" (ej. 11, 22, 33) o "Deuda Kármica" (ej. 13, 14, 16, 19), DEBÉS mencionarlo explícitamente y dedicar una breve oración a su impacto o lección.
5. Si hay una fórmula o alternativa, explicá cómo los componentes se combinan.

FORMATO DE CADA EXPLICACIÓN:
- Si hay sub-componentes (nombres, vocales por palabra, fórmulas, etc.), USÁS ESTE FORMATO ESTRUCTURADO Y BREVE:
  * Una línea por cada sub-componente que empiece con el nombre/componente y su número en MAYÚSCULAS, seguido de dos puntos, y luego la explicación corta.
  * Ejemplo para alma: "NANCY (vocales = 8): Vocales con energía de poder material." nueva línea "TOTAL = 31/4: ... "
- Si es un valor simple sin desglose: 1 solo párrafo directo e impactante explicando el número.
- CADA VALOR del JSON debe ser un STRING DE TEXTO PLANO (nunca un objeto ni un array).
- Ve directo al grano místico. NO uses introducciones como "Aquí tienes" o "Estimada...".
- Hablá en segunda persona del singular, de forma elegante y empoderante.

ADEMÁS, CREÁ una clave extra "resumen_general" con una SÍNTESIS GLOBAL de 1 o 2 párrafos (MUY BREVE) integrando los números más fuertes.

DEVUELVE ÚNICAMENTE UN OBJETO JSON VÁLIDO.
Las claves del JSON deben ser EXACTAMENTE LAS MISMAS CLAVES en minúsculas que te pasé en la lista, MÁS "resumen_general". Los valores DEBEN SER STRINGS (texto plano). No agregues formatos de bloque \`\`\`json.`;

        const contents = await buildContentsWithDocs(promptText);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                temperature: 0.3, // Low temperature for high adherence to the provided document
                responseMimeType: "application/json"
            }
        });

        const reply = response.text || '{}';

        // Parse it to ensure validity, and then pass it as our JSON response.
        const parsedReply = JSON.parse(reply);

        return NextResponse.json({ explanations: parsedReply });

    } catch (error: any) {
        console.error('API Error with Gemini batch generation:', error);
        return NextResponse.json({ error: 'Hubo un error al generar la explicación con IA. Revisa los logs del servidor.' }, { status: 500 });
    }
}
