import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

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

        // 2. Read the local text files
        const file1Path = path.join(process.cwd(), 'informacionParte1.txt');
        const file2Path = path.join(process.cwd(), 'informacionParte2.txt');

        const file1Text = await fs.readFile(file1Path, 'utf8');
        const file2Text = await fs.readFile(file2Path, 'utf8');

        // 3. Ask Gemini to process ALL of them in batch and return JSON
        const promptText = `Eres un experto en Numerología Pitagórica de alto nivel. 
Tu única fuente de verdad bibliográfica son estos dos documentos adjuntos. Mantente muy estricto al tono y a la información contenida en estos libros, sin inventar atribuciones numéricas.

=== DOCUMENTO 1 ===
${file1Text}

=== DOCUMENTO 2 ===
${file2Text}

=== TU TAREA ===
${analysisRequestStr}

Para CADA métrica en esta lista, extrae de la bibliografía de arriba una explicación profunda, evolutiva y mística.
SI ALGUNA MÉTRICA NO APARECE EN LOS DOCUMENTOS (ej: Lecciones Kármicas, Talento, Karma de Nacimiento o Números Maestros/Kármicos específicos), DEBES usar tus amplios conocimientos en Numerología Pitagórica para proveer una explicación igual de rica y profunda, adoptando el mismo tono. ¡Jamás omitas una clave solicitada!
Adicionalmente, si el texto indica que un número es "Número Maestro" o "Deuda Kármica", DEBES mencionarlo explícitamente y explicar su gran poder o desafío (por ejemplo, hablar del potencial luminoso del 11, o la reestructuración kármica del 13).

IMPORTANTE: Debe ser un texto BASTANTE RESUMIDO, bien completo e impactante, idealmente 1 solo párrafo fuerte (máximo 2 párrafos cortos). Ve directo al grano místico, eliminando presentaciones corporativas tontas como "Aquí tienes la explicación".
Escribe respondiendo al usuario de frente (hablándole en segunda persona del singular, de forma súper elegante, empoderante y profesional).

ADEMÁS DE EXPLICAR CADA MÉTRICA, DEBES AGREGAR UNA CLAVE EXTRA LLAMADA "resumen_general".
En "resumen_general", debes escribir una SÍNTESIS GLOBAL MAGISTRAL de 2 o 3 párrafos integrando los números más fuertes que detectaste en la lista y dando un panorama general de la persona como individuo.

DEVUELVE ÚNICAMENTE UN OBJETO JSON VÁLIDO.
Las claves del JSON deben ser EXÁCTAMENTE LAS MISMAS CLAVES en minúsculas que te pasé en la lista, MÁS la nueva clave "resumen_general". Los valores deben ser los textos interpretativos que redactaste. No agregues formatos de bloque \`\`\`json.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptText,
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
