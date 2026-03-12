import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * API Route: Análisis Técnico Completo (Prompt 6A)
 * Para uso interno de la numeróloga — NO va en el PDF del cliente
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { datosEstructurados } = body;

        if (!datosEstructurados || !process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'Datos o API key faltantes' }, { status: 400 });
        }

        const promptText = `Actúa como un especialista avanzado en numerología pitagórica aplicada al autoconocimiento, al desarrollo personal y al análisis profundo de patrones.
Tu tarea es realizar un ANÁLISIS TÉCNICO, COMPLETO, PROFUNDO Y DETALLADO de la carta numerológica pitagórica de esta persona.
IMPORTANTE:
- Este análisis es para uso interno del analista, no para el cliente.
- No hagas una interpretación superficial.
- No te limites a definir números sueltos.
- Analiza la lógica completa del mapa.
- Relaciona números entre sí.
- Explica cómo estas energías pueden manifestarse en la vida real de la persona.
- Identifica talentos, desafíos, bloqueos, aprendizajes y direcciones de equilibrio.
- No hables de destino fijo: habla de potenciales, tendencias, aprendizajes y evolución.

DATOS DE LA PERSONA:
${datosEstructurados}

MUY IMPORTANTE SOBRE LOS CÁLCULOS:
Quiero que analices cada resultado en profundidad siguiendo este orden:
1. Antes de reducir un número, analiza primero el NÚMERO RAÍZ o NÚMERO COMPUESTO.
2. Si aparece un NÚMERO MAESTRO (11, 22, 33), NO lo reduzcas automáticamente.
3. Si aparece un NÚMERO KÁRMICO (13, 14, 16, 19), analízalo en profundidad.
4. Si un número raíz, maestro o kármico aparece repetido en distintas partes del mapa, señálalo.

ESTRUCTURA DEL ANÁLISIS:
1. VISIÓN GENERAL DEL MAPA
2. VIBRACIÓN MÁS INTERNA DE LA PERSONA
3. ANÁLISIS DEL NÚMERO RAÍZ DE LA VIBRACIÓN INTERNA
4. PROPÓSITO O MISIÓN
5. ANÁLISIS DEL NÚMERO RAÍZ DEL PROPÓSITO
6. CAMINO DE VIDA
7. ANÁLISIS DEL NÚMERO RAÍZ DEL CAMINO DE VIDA
8. TALENTOS NATURALES EN LA FECHA DE NACIMIENTO
9. MES DE NACIMIENTO COMO ENERGÍA DE INFANCIA
10. DEUDAS KÁRMICAS
11. NÚMEROS MAESTROS
12. NÚMEROS KÁRMICOS
13. CICLO DE REALIZACIÓN (primer, segundo y tercer ciclo)
14. DESAFÍOS
15. NÚMERO DE SUBCONSCIENTE
16. NÚMERO DE INCONSCIENTE
17. NÚMERO DE SOMBRA
18. POSIBLES BLOQUEOS PRINCIPALES
19. CÓMO NECESITA EQUILIBRARSE (área personal / vincular / profesional)
20. AÑO PERSONAL ACTUAL
21. ANÁLISIS DE LAS 9 CASAS
Para cada una de las 9 casas, analizar en profundidad:
- Qué representa esa casa en la vida de la persona
- Qué significa tener ese habitante específico en esa casa (tanto en su aspecto positivo/luz como en su sombra/dificultad)
- Qué patrón del linaje o la infancia puede indicar
- Cómo puede manifestarse en la vida cotidiana
- Qué aprendizaje o desafío evolutivo propone

Luego analizar:
- Las etapas de los años 30, 58 y 87: qué energía se activa en cada etapa de vida
- La inducción del inconsciente: qué patrones automáticos operan
- El puente iniciático: primer paso de transformación para cada casa
- El puente de evolución: hacia dónde evolucionar globalmente
- La relación entre casas 1 y 8 (modelo del padre / energía masculina en pareja)
- La relación entre casas 2 y 6 (modelo de la madre / energía femenina en pareja)
- Si habitante casa 1 = habitante casa 8 → señalar que repite modelo del padre
- Si habitante casa 2 = habitante casa 6 → señalar que repite modelo de la madre

22. INTEGRACIÓN GENERAL DEL MAPA
23. PREGUNTAS DE REFLEXIÓN PARA EL ANALISTA

ESTILO: profundo, técnico, claro, evolutivo, conectado entre sí, no fatalista, no genérico.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptText,
            config: {
                temperature: 0.4,
            }
        });

        const analysisText = response.text || 'No se pudo generar el análisis.';

        return NextResponse.json({ analysis: analysisText });

    } catch (error: any) {
        console.error('Error en análisis técnico:', error);
        return NextResponse.json({ error: 'Error al generar el análisis técnico.' }, { status: 500 });
    }
}
