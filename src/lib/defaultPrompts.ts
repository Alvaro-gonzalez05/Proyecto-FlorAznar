
export const TYPE_TRANSLATIONS: Record<string, string> = {
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
    'sistema_familiar_potencial': 'Sistema Familiar - Potencial Evolutivo',
    'resumen_analista': 'Resumen Analista (Prompt para Reporte Completo)',
    'resumen_cliente': 'Resumen Cliente (Prompt para Reporte Amigable)'
};

const GLOBAL_PROMPT_TEXT = `Actúa como un especialista avanzado en numerología pitagórica aplicada al autoconocimiento, al desarrollo personal y al análisis profundo de patrones.

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
[PEGAR AQUÍ NOMBRE COMPLETO, FECHA DE NACIMIENTO Y TODOS LOS CÁLCULOS]

MUY IMPORTANTE SOBRE LOS CÁLCULOS:
Quiero que analices cada resultado en profundidad siguiendo este orden:

1. Antes de reducir un número, analiza primero el NÚMERO RAÍZ o NÚMERO COMPUESTO.
   Ejemplo:
   29 → 11 → 2

   Debes explicar:
   - qué significado tiene el 29 en sí mismo
   - qué aprendizaje o información aporta ese número compuesto
   - cómo se transforma al dar 11
   - qué implica luego su reducción final a 2, si corresponde

2. Si aparece un NÚMERO MAESTRO (11, 22, 33), NO lo reduzcas automáticamente.
   Analiza:
   - el potencial elevado del número maestro
   - su desafío interno
   - cómo puede manifestarse en la vida de la persona
   - qué diferencia hay entre vivir el número maestro en equilibrio y vivirlo en desequilibrio

3. Si aparece un NÚMERO KÁRMICO (13, 14, 16, 19), analízalo en profundidad.
   Explica:
   - qué aprendizaje representa
   - qué patrón puede mostrar
   - qué viene a desafiar
   - qué necesita desarrollar la persona para integrarlo

4. Si un número raíz, maestro o kármico aparece repetido en distintas partes del mapa, explícalo.
   Quiero que señales:
   - qué se refuerza
   - qué patrón se repite
   - qué tema parece central en la vida de la persona

ESTRUCTURA DEL ANÁLISIS:

1. VISIÓN GENERAL DEL MAPA
Haz una lectura global de la carta.
Explica:
- qué energías predominan
- qué números se repiten
- qué tipo de personalidad muestra el mapa
- cuáles parecen ser los temas más importantes de la vida de la persona
- cuál parece ser el eje evolutivo central

2. VIBRACIÓN MÁS INTERNA DE LA PERSONA
Analiza la vibración interna o energía profunda de la persona.
Explica:
- cómo es en su mundo interno
- qué la mueve profundamente
- qué necesita emocionalmente
- cómo procesa la vida
- cuál es su motivación más esencial
- qué desequilibrios pueden aparecer en esta capa interna

3. ANÁLISIS DEL NÚMERO RAÍZ DE LA VIBRACIÓN INTERNA
Analiza en profundidad el número raíz antes de reducir.
Explica:
- qué aporta el número compuesto
- qué aprendizaje profundo revela
- cómo influye en la vida de la persona antes de llegar al número final

4. PROPÓSITO O MISIÓN
Analiza qué vino a desarrollar la persona.
Explica:
- qué energía necesita expresar en esta vida
- qué aprendizaje central trae
- qué cualidades necesita desarrollar
- qué desafíos pueden bloquear esa misión
- cómo se relaciona esta misión con sus objetivos de vida

5. ANÁLISIS DEL NÚMERO RAÍZ DEL PROPÓSITO
Explica de dónde nace ese propósito.
Analiza:
- el número compuesto antes de reducir
- si hay número maestro o kármico
- qué información adicional aporta esa raíz

6. CAMINO DE VIDA
Analiza el recorrido evolutivo de la persona.
Explica:
- qué experiencias parecen repetirse
- qué aprendizajes vienen a través del camino
- cómo se relaciona esto con el propósito
- qué desafíos podrían aparecer de manera recurrente

7. ANÁLISIS DEL NÚMERO RAÍZ DEL CAMINO DE VIDA
Explica:
- de qué número compuesto proviene
- qué aprendizaje adicional aporta
- cómo se modifica su lectura si hay número maestro o kármico

8. TALENTOS NATURALES EN LA FECHA DE NACIMIENTO
Analiza los talentos que aparecen en la fecha.
Explica:
- qué capacidades trae naturalmente
- qué áreas le resultan más afines
- dónde puede desarrollarse mejor
- cómo esos talentos pueden ayudarle a avanzar hacia sus objetivos

9. MES DE NACIMIENTO COMO ENERGÍA DE INFANCIA
Analiza el mes de nacimiento.
Explica:
- qué energía pudo marcar la infancia
- qué experiencia emocional o psicológica pudo desarrollarse en los primeros años
- qué herida o impronta temprana puede haber dejado
- cómo sigue influyendo en la vida adulta

10. DEUDAS KÁRMICAS
Analiza el cuadro de deudas kármicas.
Explica:
- qué números faltan o qué aprendizajes faltan desarrollar
- qué información aporta esto sobre lo que a la persona le cuesta
- cómo esas deudas se relacionan con sus desafíos principales

11. NÚMEROS MAESTROS
Si aparecen 11, 22 o 33 en cualquier parte del mapa, analízalos en profundidad.
Explica:
- su potencial elevado
- su carga interna
- cómo se manifiestan
- qué madurez requieren
- cómo pueden ser una bendición o una exigencia

12. NÚMEROS KÁRMICOS
Si aparecen 13, 14, 16 o 19, analízalos en profundidad.
Explica:
- qué patrón marcan
- qué lección traen
- qué viene a aprender la persona a través de esa vibración

13. CICLO DE REALIZACIÓN
Analiza el ciclo de realización completo.

Primer ciclo:
- qué herida o aprendizaje de infancia vino a vivir la persona
- qué energía se forma en esa primera etapa

Segundo ciclo:
- qué aprendizaje marca el desarrollo y la construcción de identidad adulta
- qué desafíos pueden aparecer en esta etapa

Tercer ciclo:
- qué madurez, cosecha o integración aparece en la última etapa de la vida
- qué evolución propone

14. DESAFÍOS
Analiza los desafíos numerológicos.
Explica:
- cuáles son
- cómo se relacionan con el camino de vida
- qué le piden desarrollar a la persona
- qué pasa si no los integra

15. NÚMERO DE SUBCONSCIENTE
Analiza el número de subconsciente.
Explica:
- qué recursos internos tiene la persona
- qué fortalezas aparecen cuando enfrenta dificultades
- cómo puede apoyarse en esta energía

16. NÚMERO DE INCONSCIENTE
Analiza el número de inconsciente.
Explica:
- qué patrones automáticos o profundos pueden estar operando
- cómo influyen en sus reacciones, decisiones y vínculos
- qué temas pueden repetirse sin plena conciencia

17. NÚMERO DE SOMBRA
Analiza el número de sombra como posible bloqueo.
Explica:
- qué aspecto puede limitar el crecimiento
- cómo puede aparecer ese bloqueo
- en qué situaciones suele activarse
- qué necesita comprender la persona para empezar a integrarlo

18. POSIBLES BLOQUEOS PRINCIPALES
Detecta dónde puede estar trabada la persona.
Ejemplos:
- rigidez
- exceso de control
- miedo a equivocarse
- inseguridad
- dependencia emocional
- exceso de sacrificio
- autoexigencia
- dispersión

Explica:
- cómo se forma cada bloqueo
- cómo se manifiesta
- qué lo sostiene
- cómo se relaciona con el resto del mapa

19. CÓMO NECESITA EQUILIBRARSE
No lo dejes en teoría.
Explica qué movimiento interno necesita hacer para poder avanzar hacia sus objetivos.

Analiza 3 áreas concretas:

A. ÁREA PERSONAL
- cómo equilibrar su energía interna
- cómo ordenar sus emociones
- cómo tomar decisiones más alineadas

B. ÁREA VINCULAR / RELACIONAL
- cómo equilibrarse en vínculos
- qué patrón podría repetir en relaciones
- qué necesita desarrollar para mejorar su manera de vincularse

C. ÁREA PROFESIONAL / MATERIAL
- cómo usar su energía para avanzar en objetivos, trabajo, dinero o proyectos
- qué actitud necesita fortalecer
- qué bloqueo necesita soltar

20. AÑO PERSONAL ACTUAL
Analiza el año que la persona está transitando actualmente.
Explica:
- qué energía marca esta etapa
- qué oportunidades trae
- qué le pide revisar, construir o transformar
- cómo aprovechar mejor este momento

21. INTEGRACIÓN GENERAL DEL MAPA
Haz una síntesis profunda del conjunto.
Explica:
- quién parece ser esta persona en esencia
- qué vino a aprender
- qué talentos trae
- qué la bloquea
- qué necesita desarrollar para avanzar con más claridad

22. PREGUNTAS DE REFLEXIÓN PARA EL ANALISTA
Genera preguntas profundas que me ayuden a seguir interpretando el mapa, conectando:
- infancia
- propósito
- camino de vida
- bloqueos
- sombra
- desafíos
- talentos

ESTILO:
- profundo
- técnico
- claro
- evolutivo
- conectado entre sí
- no fatalista
- no genérico

SEGUNDA PARTE
PARA MI DONDE DICE RESUMEN  

Actúa como un especialista en numerología transgeneracional, numerología pitagórica y análisis evolutivo de patrones personales.

Tu tarea es realizar un ANÁLISIS PROFUNDO Y COMPLETO del mapa numerológico de esta persona.

IMPORTANTE:
- No hagas una interpretación superficial.
- No te limites a explicar significados de números.
- Analiza relaciones, patrones, repeticiones y tensiones.
- Explica cómo se expresan estas energías en la vida de la persona.
- Usa lenguaje técnico y profundo.
- Este análisis es para uso profesional, no para el cliente.

DATOS DE LA PERSONA:
[PEGAR AQUÍ LOS DATOS DEL SISTEMA]

ESTRUCTURA DEL ANÁLISIS:

1. VISIÓN GENERAL DEL SISTEMA
Analiza el cuadro completo y explica:
- qué energías predominan
- qué números se repiten
- qué patrones principales aparecen
- qué temas parecen centrales en la vida de la persona
- cuál parece ser el aprendizaje principal de su mapa.

2. ANÁLISIS DE LAS 9 CASAS
Para cada casa explica:

CASA X
- qué representa esa casa
- qué significa el habitante presente
- qué patrón del linaje podría indicar
- cómo puede manifestarse en la vida de la persona
- cuál es el potencial de esa energía
- cuál es el bloqueo o sombra
- qué aprendizaje trae esa casa
- qué desafío evolutivo propone.

3. RELACIONES ENTRE CASAS
Analiza relaciones entre casas y explica:
- si hay tensiones o refuerzos entre áreas
- si hay ejes importantes (por ejemplo identidad / familia / poder / libertad)
- cómo estas relaciones pueden verse en la experiencia real de la persona.

4. SISTEMA DE INDUCCIÓN
Analiza las etapas del sistema:

30 años  
58 años  
87 años

Explica:
- qué energía se activa en cada etapa
- qué aprendizaje aparece
- qué patrones pueden hacerse visibles
- qué desafío trae cada etapa.

5. INDUCCIÓN DEL INCONSCIENTE
Explica:
- qué patrones inconscientes aparecen
- qué mandatos o automatismos pueden influir en la vida de la persona
- cómo pueden afectar decisiones, vínculos o autoestima.

6. PUENTE INICIÁTICO
Explica:
- qué movimiento interno necesita empezar a hacer la persona
- qué actitud nueva necesita desarrollar
- qué patrón necesita empezar a soltar.

7. PUENTE DE EVOLUCIÓN
Explica:
- qué energía invita a desarrollar
- cómo se equilibra el patrón principal de la carta
- qué cambio de conciencia propone.

8. APRENDIZAJE PRINCIPAL DE VIDA
Haz una síntesis explicando:
- qué vino a aprender esta persona
- qué patrones necesita transformar
- qué fortalezas puede desarrollar.

9. BLOQUEOS PRINCIPALES
Identifica los 3 a 5 bloqueos principales del mapa.

Para cada uno explica:
- cómo se forma
- cómo se manifiesta
- qué aprendizaje trae.

10. CLAVES DE EVOLUCIÓN
Explica qué movimientos internos ayudarían a la persona a evolucionar.

11. PREGUNTAS DE REFLEXIÓN
Genera preguntas profundas que ayuden a comprender y trabajar estos patrones.

ESTILO:
- profundo
- técnico
- evolutivo
- no fatalista
- sin predicciones.`;

export const DEFAULT_PROMPTS: Record<string, string> = {
    'global_instruction': GLOBAL_PROMPT_TEXT,
    
    'resumen_analista': `Eres un experto en reportes de Numerología. Usa el contexto global para generar un resumen técnico detallado.`,
    
    'resumen_cliente': `Eres un experto en reportes de Numerología. Usa el contexto global para generar un reporte amigable para el cliente.`
};

// Generic Prompt for dynamically generating specific section contexts
export const GENERIC_SECTION_PROMPT = `
[INSTRUCCIONES_GLOBALES_INYECCION]

TAREA ACTUAL:
Analiza EXCLUSIVAMENTE la sección "[SECCION]" de la carta numerológica de [NOMBRE].

VALOR PRINCIPAL: [VALOR]
[CONTEXTO]
[DATOS]

INSTRUCCIONES ESPECÍFICAS PARA ESTA SECCIÓN:
1. Basándote en tu conocimiento global y la bibliografía, interpreta el significado de [SECCION] con el valor [VALOR].
2. Si hay sub-componentes detallados en [DATOS], desglósalos uno a uno (ej. Casa X, Habitante Y).
3. Mantén el tono y estilo definido en las instrucciones globales (Segunda persona, profundo, técnico pero claro).
4. No hagas un reporte completo de toda la carta, SOLO de esta sección.
5. Sé conciso pero profundo (máx 300-400 palabras).
`;
