import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
    try {
        const { section, value, context, nombre, sectionData } = await request.json();

        if (!section || !value) {
            return NextResponse.json({ error: 'Faltan parámetros requeridos' }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not defined.");
        }

        // Read the reference documents for grounding
        const file1Path = path.join(process.cwd(), 'informacionParte1.txt');
        const file2Path = path.join(process.cwd(), 'informacionParte2.txt');

        let referenceText = '';
        try {
            const file1Text = await fs.readFile(file1Path, 'utf8');
            const file2Text = await fs.readFile(file2Path, 'utf8');
            referenceText = `=== DOCUMENTO REFERENCIA 1 ===\n${file1Text}\n\n=== DOCUMENTO REFERENCIA 2 ===\n${file2Text}`;
        } catch {
            referenceText = '';
        }

        // Build section-specific detailed data block
        const dataBlock = sectionData ? `\nDATOS COMPLETOS DE ESTA SECCIÓN:\n${JSON.stringify(sectionData, null, 2)}\n` : '';

        const promptText = `Eres un experto en Numerología Pitagórica de alto nivel.
${referenceText ? `Tu fuente bibliográfica principal:\n${referenceText}\n\n` : ''}

TAREA: Analiza la sección "${section}" de la carta numerológica de ${nombre || 'esta persona'}.

VALOR PRINCIPAL: ${value}
${context ? `CONTEXTO GENERAL: ${context}` : ''}
${dataBlock}

INSTRUCCIONES ESTRICTAS:
1. DESGLOSE DETALLADO: Si hay sub-componentes (nombres, casas, ciclos), DEBES listar CADA UNO con este formato:
   COMPONENTE = NÚMERO: explicación de este componente.
   Por ejemplo: "CASA 1 (El Rey) - Habitante 6: El número 6 en la casa del ego..."
   O: "NANCY = 21/3: Tu nombre Nancy vibra con la energía del 3..."
   O: "CICLO 1 = 12/3: Tu primer ciclo de vida..."
2. Después de listar cada sub-componente, escribí un párrafo final de SÍNTESIS TOTAL.
3. Para cada número, explica su vibración, su energía y cómo influye en la vida de la persona.
4. Si un número es MAESTRO (11, 22, 33, 44) o KÁRMICO (13, 14, 16, 19), explica su significado especial.
5. Si hay un número alternativo, explica ambas interpretaciones.
6. Habla en segunda persona del singular, de forma elegante, empoderante y profunda.
7. Ve directo al grano — NUNCA uses "Aquí tienes", "Estimada...", "Para ofrecerte..." ni "necesito que me indiques". 
8. NUNCA pidas más datos. Ya tenés TODA la información en los DATOS de arriba. Analizá TODO directamente.
9. Usa párrafos claros y separados con líneas vacías entre ellos.

FORMATO:
- Cada sub-componente en su propia línea/párrafo con el formato NOMBRE = NÚMERO: explicación.
- Un párrafo de síntesis al final.
- Máximo 500 palabras total.
- Solo texto plano. Sin JSON, sin markdown, sin asteriscos, sin encabezados.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptText,
            config: {
                temperature: 0.4,
            }
        });

        const explanation = response.text || '';

        return NextResponse.json({ explanation });

    } catch (error: any) {
        console.error('API Error with section explanation:', error);
        return NextResponse.json({ error: 'Error al generar la explicación.' }, { status: 500 });
    }
}
