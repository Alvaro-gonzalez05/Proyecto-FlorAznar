import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const PROMPT_ANALISTA = `Actúa como un especialista avanzado en numerología pitagórica aplicada al autoconocimiento, al desarrollo personal y al análisis profundo de patrones.

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
[DATOS_PERSONA]

MUY IMPORTANTE SOBRE LOS CÁLCULOS:
Quiero que analices cada resultado en profundidad siguiendo este orden:

1. Antes de reducir un número, analiza primero el NÚMERO RAÍZ o NÚMERO COMPUESTO.
   Ejemplo: 29 → 11 → 2. Debes explicar qué significado tiene el 29 en sí mismo, qué aprendizaje o información aporta, cómo se transforma al dar 11, y qué implica su reducción final a 2.
2. Si aparece un NÚMERO MAESTRO (11, 22, 33), NO lo reduzcas automáticamente. Analiza el potencial elevado, su desafío interno, cómo puede manifestarse, y la diferencia entre vivirlo en equilibrio y en desequilibrio.
3. Si aparece un NÚMERO KÁRMICO (13, 14, 16, 19), analízalo en profundidad. Explica el aprendizaje, el patrón, el desafío y qué necesita desarrollar para integrarlo.
4. Si un número raíz, maestro o kármico aparece repetido en distintas partes del mapa, explícalo. Señala qué se refuerza, qué patrón se repite y qué tema parece central.

ESTRUCTURA DEL ANÁLISIS (Sigue estrictamente estos puntos):
1. VISIÓN GENERAL DEL MAPA: Lectura global. Qué energías predominan, números repetidos, tipo de personalidad, temas importantes, eje evolutivo central.
2. VIBRACIÓN MÁS INTERNA: Su energía profunda, mundo interno, motivación esencial, desequilibrios posibles.
3. ANÁLISIS DEL NÚMERO RAÍZ DE LA VIBRACIÓN INTERNA: Qué aporta el compuesto antes de reducir.
4. PROPÓSITO O MISIÓN: Qué vino a desarrollar y expresar, aprendizajes centrales, posibles bloqueos.
5. ANÁLISIS DEL NÚMERO RAÍZ DEL PROPÓSITO: De dónde nace el propósito, el compuesto.
6. CAMINO DE VIDA: Recorrido evolutivo, experiencias que tienden a repetirse.
7. ANÁLISIS DEL NÚMERO RAÍZ DEL CAMINO DE VIDA: Número compuesto del camino.
8. TALENTOS NATURALES EN LA FECHA DE NACIMIENTO: Capacidades naturales y afines.
9. MES DE NACIMIENTO COMO ENERGÍA DE INFANCIA: Herida o impronta temprana y su influencia actual.
10. DEUDAS KÁRMICAS: Números faltantes (lecciones), qué cuesta, cómo se relacionan con los desafíos.
11. NÚMEROS MAESTROS: Potencial elevado, carga interna, madurez que requieren.
12. NÚMEROS KÁRMICOS: Patrón que marcan y lección que traen.
13. CICLO DE REALIZACIÓN: Primer, segundo, tercer/cuarto ciclos y sus distintas etapas/heridas.
14. DESAFÍOS: Cuáles son y qué piden desarrollar, qué pasa si no los integra.
15. NÚMERO DE SUBCONSCIENTE: Recursos internos cuando enfrenta dificultades.
16. NÚMERO DE INCONSCIENTE: Patrones automáticos/profundos, vínculos repetitivos.
17. NÚMERO DE SOMBRA: Posible bloqueo, cuándo se activa, qué necesita comprender.
18. POSIBLES BLOQUEOS PRINCIPALES: Dónde está trabada (rigidez, control, miedo, dependencia, etc).
19. CÓMO NECESITA EQUILIBRARSE: Área personal, Vincular/Relacional, Profesional/Material.
20. AÑO PERSONAL ACTUAL: Qué energía marca esta etapa, oportunidades y revisiones.
21. INTEGRACIÓN GENERAL DEL MAPA: Síntesis profunda del conjunto.
22. PREGUNTAS DE REFLEXIÓN PARA EL ANALISTA: Preguntas para seguir conectando el mapa.

ESTILO: profundo, técnico, claro, evolutivo, conectado entre sí, no fatalista, no genérico. NO CORTES LA RESPUESTA, COMPLETA TODO EL FORMATO.
`;

const PROMPT_CLIENTE = `Actúa como especialista en autoconocimiento y desarrollo personal.

Tu tarea es transformar el perfil numerológico completo de esta persona en un TEXTO PROFUNDO, NATURAL, HUMANO Y FÁCIL DE LEER, como si fuera un capítulo de un libro personal.

IMPORTANTE:
- No uses tecnicismos numerológicos en absoluto.
- No menciones términos como: número de alma, número de personalidad, misión, propósito, camino de vida, número raíz, número maestro, número kármico, subconsciente, inconsciente, sombra, ciclo de realización, cálculos, reducciones.
- No expliques números ni digas "tu número es...".
- No redactes como una carta tradicional. Quiero que se lea natural, profundo y fluido.

OBJETIVO:
La persona debe sentir que el texto le ayuda a comprender cómo es internamente, qué la mueve, sus talentos, aprendizajes, posibles frenos, cómo equilibrarse y qué etapa transita.

DATOS DE LA PERSONA:
[DATOS_PERSONA]

ESTRUCTURA DEL TEXTO (Sigue este orden):
1. INTRODUCCIÓN: Breve, cálida y clara. No busca etiquetar un destino sino ofrecer autoconocimiento.
2. SU MUNDO INTERNO: Cómo vive internamente, qué la mueve, qué necesita para sentirse en paz, qué pasa al desequilibrarse.
3. SU FORMA DE ESTAR EN EL MUNDO: Cómo actúa, cómo es percibida, qué energía proyecta y cómo se relaciona con el entorno.
4. LO QUE VINO A DESARROLLAR: Qué clase de aprendizajes son centrales sin mencionar propósito/misión.
5. EL TIPO DE CAMINO QUE VA HACIENDO: Qué experiencias tienden a repetirse y lecciones de la vida, sin decir "camino de vida".
6. SUS TALENTOS NATURALES: Capacidades innatas, áreas afines.
7. HUELLAS TEMPRANAS DE SU HISTORIA: Qué energía marcó los primeros años y su influencia, sin decir mes o ciclo.
8. APRENDIZAJES IMPORTANTES: Temas desafiantes, patrones incómodos pero necesarios.
9. TENDENCIAS QUE PODRÍAN BLOQUEARLA: Dónde podría frenarse, patrones si sigue funcionando igual. No etiquetes, usa "puede aparecer una tendencia a...", "cuando se exagera...".
10. CÓMO PUEDE EQUILIBRARSE:
   A. EN SU VIDA PERSONAL (órden, decisiones)
   B. EN SUS VÍNCULOS (actitud, aprendizajes)
   C. EN SUS OBJETIVOS Y VIDA MATERIAL (dinero, trabajo, dirección, cualidad a fortalecer)
11. LA ETAPA QUE ESTÁ VIVIENDO HOY: Energía de su momento actual (año/ciclo), sin hablar de "año personal". Oportunidades y lo que pide la etapa.
12. INTEGRACIÓN FINAL: Síntesis profunda donde la persona sienta que entiende mejor su historia y patrones con claridad.
13. PREGUNTAS DE REFLEXIÓN: Preguntas profundas y simples para autobservación.

FORMA DE REDACTAR: Natural, fluida, humana, como un libro personal, sin tono frío ni fatalismo. Todo el análisis técnico debe estar traducido a humano. NO recortes la respuesta.`;

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
            promptText = PROMPT_ANALISTA.replace('[DATOS_PERSONA]', dataStr);
            if (hasSegundaParte) {
                promptText += `\n\nSEGUNDA PARTE: ANÁLISIS DEL SISTEMA FAMILIAR
Actúa como un especialista en numerología transgeneracional, numerología pitagórica y análisis evolutivo de patrones personales.
Analiza el cuadro completo y explica: qué energías predominan, qué números se repiten, qué patrones aparecen.
Para cada una de las 9 CASAS explica: qué representa, qué significa su habitante, el potencial, el bloqueo y el desafío evolutivo.
Analiza las RELACIONES ENTRE CASAS (tensiones, refuerzos).
Analiza el SISTEMA DE INDUCCIÓN (30, 58, 87 años).
Analiza la INDUCCIÓN DEL INCONSCIENTE, PUENTE INICIÁTICO y PUENTE DE EVOLUCIÓN.
Determina los BLOQUEOS PRINCIPALES y CLAVES DE EVOLUCIÓN.
Agrega PREGUNTAS DE REFLEXIÓN al final.
`;
            }
        } else if (type === 'cliente') {
            promptText = PROMPT_CLIENTE.replace('[DATOS_PERSONA]', dataStr);
            if (hasSegundaParte) {
                promptText += `\n\nSEGUNDA PARTE: EL SISTEMA FAMILIAR Y TRANSGENERACIONAL
Actúa como especialista en autoconocimiento, numerología evolutiva y desarrollo personal.
Tu tarea es transformar el análisis del sistema familiar en un INFORME CLARO, PROFUNDO Y ACCIONABLE.
IMPORTANTE: No etiquetes. Explica energías como potenciales y aprendizajes con lenguaje humano y claro.
ESTRUCTURA DEL INFORME FAMILIAR:
1. VISIÓN GENERAL DEL MAPA: Temas que se repiten en el árbol, eje principal.
2. LOS PATRONES MÁS IMPORTANTES: Cómo se manifiestan en su vida y aprendizaje.
3. QUÉ VINO A APRENDER: Qué necesita desarrollar o sanar.
4. ETAPAS DEL PROCESO PERSONAL: Cómo se siente la inducción según su edad.
5. PATRONES INCONSCIENTES: Tendencias automáticas del linaje.
6. PRIMER MOVIMIENTO DE TRANSFORMACIÓN: Puente iniciático.
7. DIRECCIÓN DE EVOLUCIÓN: Puente de evolución.
8. FORTALEZAS DEL LINAJE: Talentos heredados.
9. PREGUNTAS DE REFLEXIÓN para observar sus patrones familiares.
`;
            }
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
