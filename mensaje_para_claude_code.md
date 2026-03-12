# MENSAJE PARA CLAUDE CODE — CORRECCIONES Y MEJORAS APP DE NUMEROLOGÍA

---

## CONTEXTO GENERAL

Estoy desarrollando una app de numerología pitagórica. Ya tenés una versión funcionando que calcula y muestra resultados. Este mensaje detalla **todas las correcciones y mejoras** que necesitan aplicarse según las indicaciones de la numeróloga.

La app toma: **nombre completo + fecha de nacimiento** y genera una carta numerológica completa.

---

## TABLA DE CONVERSIÓN LETRA → NÚMERO (Usar siempre esta)

```
1=A,J,S
2=B,K,T
3=C,L,U
4=D,M,V
5=E,N/Ñ,W
6=F,O,X
7=G,P,Y
8=H,Q,Z
9=I,R
```

---

## PARTE 1 — CORRECCIONES A LOS CÁLCULOS EXISTENTES

### REGLA GENERAL (aplicar a TODOS los cálculos)
Antes de mostrar cualquier resultado numérico, **siempre verificar si hay número maestro o kármico** en el camino de reducción.

- **Números Maestros**: 11, 22, 33, 44 → NO reducir automáticamente, mostrar como "22/4" o "11/2"
- **Números Kármicos**: 13, 14, 16, 19 → Marcar explícitamente como kármico, mostrar como "13/4 (KÁRMICO)"
- **Siempre mostrar la cadena completa**: del número más grande al más chico. Ejemplo: `44/8`, `31/4`, `13/4 KÁRMICO`, `29/11/2`

---

### 1.1 VIBRACIÓN INTERNA — CORRECCIÓN IMPORTANTE

**Cómo calcularlo correctamente:**
- Si la persona tiene **un solo nombre**: sumar todas las letras de ese nombre
- Si tiene **dos o más nombres**: calcular **cada nombre POR SEPARADO** y mostrar cada resultado individualmente
- El apellido va separado del nombre

**Ejemplo correcto para NANCY ADRIANA TAPIA:**
```
NANCY       → 5+1+5+3+7 = 21/3
ADRIANA     → 1+4+9+9+1+5+1 = 30/3
TAPIA       → 2+1+7+9+1 = 20/2
```
La vibración interna es la del/los nombre(s), NO incluye el apellido en este cálculo separado.

**Mostrar en un cuadro/tabla** con cada nombre en una columna, sus valores debajo de cada letra, y el resultado al final.

---

### 1.2 NÚMERO DE ALMA — CORRECCIÓN

**Solo vocales del nombre completo** (nombre + apellido juntos).

**Regla especial para la Y:**
- Y es **VOCAL** cuando: está al final de un nombre (NANCY → la Y suena como vocal) o cuando suena como vocal dentro del nombre
- Y es **CONSONANTE** cuando: está al principio y cambia el sonido

**Agregar en el código un módulo/prompt que analice caso a caso si la Y funciona como vocal en ese nombre específico.**

**Mostrar el cuadro así:**
```
NANCY         ADRIANA        TAPIA
A=1  Y=7      A=1 I=9 A=1 A=1    A=1 I=9 A=1
Suma: 8       Suma: 12/3          Suma: 11/2

Total Alma: 8 + 12 + 11 = 31/4
Reducción: 31/4  → también viene de 13/4 (KÁRMICO)
Mostrar ambos: "31/4 — también 8+3+2=13/4 KÁRMICO"
```

**IMPORTANTE:** Mostrar el número más grande primero. Si da 31/4 pero también puede leerse como 13/4 kármico, mostrar los dos y aclarar cuál es kármico.

---

### 1.3 NÚMERO DE PERSONALIDAD — CORRECCIÓN

**Solo consonantes del nombre completo.**

**Mostrar cuadro:**
```
NANCY            ADRIANA         TAPIA
N=5 N=5 C=3      D=4 R=9 N=5     T=2 P=7
Suma: 13/4 KÁRMICO   Suma: 18/9      Suma: 9

Total: 13+18+9 = 40/4
Reducción alternativa: 4+9+9 = 22/4 MAESTRO
Mostrar: "40/4 — también 22/4 MAESTRO"
```

---

### 1.4 NÚMERO DE MISIÓN — CORRECCIÓN

Es la suma de Alma + Personalidad, **pero mostrando la cadena completa**:

```
Alma (número grande) + Personalidad (número grande) = Suma → Reducción
Ejemplo: 31 + 40 = 71/8
Alternativa: 22 + 13 = 35/8
Mostrar ambas versiones y aclarar si hay maestros o kármicos en el camino
```

---

### 1.5 PLANO INTUITIVO — CORRECCIÓN (ESTABA MAL)

**Cálculo correcto:** Es la suma del cuadro de **lecciones kármicas de los números 7 y 9** del nombre completo.

Es decir: contar cuántos 7 hay en el nombre completo + cuántos 9 hay, y sumar esas cantidades.

---

### 1.6 FECHA DE NACIMIENTO — CORRECCIONES

**Siempre reducir cada componente POR SEPARADO primero, luego sumar:**

Ejemplo para 29/01/1961:
```
Día:  29 → 2+9 = 11/2 (MAESTRO — no reducir más)
Mes:  01 → 1
Año:  1961 → 1+9+6+1 = 17/8
```

**Camino de Vida = Día + Mes + Año = 11 + 1 + 17 = 29/11/2**
- También verificar: 1+1+1+9+6+1 = 20/2 (mostrar esta versión también)
- **Siempre buscar la versión que dé número maestro o kármico**

**Mostrar TODAS las combinaciones posibles** para que aparezca si hay maestro o kármico.

---

## PARTE 2 — CICLOS DE REALIZACIÓN (ESTRUCTURA COMPLETA)

Mostrar como un diagrama/tabla visual con 4 ciclos + 4 desafíos.

**Componentes del diagrama:**
```
MES    DÍA    AÑO    CAMINO DE VIDA
```

**Cálculo de los 4 Ciclos de Realización (de arriba hacia abajo, se suman):**
- 1er Ciclo: MES + DÍA
- 2do Ciclo: DÍA + AÑO  
- 3er Ciclo: 1er + 2do Ciclo
- 4to Ciclo: MES + AÑO

**Cálculo de los 4 Desafíos (se restan — siempre positivo):**
- 1er Desafío: |MES - DÍA|
- 2do Desafío: |DÍA - AÑO|
- 3er Desafío: |2do - 1er Desafío|
- 4to Desafío: |MES - AÑO|

**Para calcular en qué ciclo está actualmente la persona:**
```
Fin del 1er Ciclo = 36 - Camino de Vida
Fin del 2do Ciclo = Fin 1er + 9
Fin del 3er Ciclo = Fin 2do + 9
Fin del 4to Ciclo = Fin 3er + 9
Comparar con la edad actual de la persona
```

**Números especiales a calcular a partir de los ciclos:**
- **Número de Subconsciente I** = 1er + 2do + 3er Ciclo
- **Número de Subconsciente O** = 1er + 2do + 3er Desafío
- **Número del Inconsciente** = 4to Ciclo + Camino de Vida
- **Número de Sombra** = Subconsciente O + Camino de Vida
- **Ser Interior:**
  - Q = 1er Desafío + 3er Desafío
  - R = 2do Desafío + 3er Desafío
  - S = Q + R

---

## PARTE 3 — VISUALIZACIÓN DE CUADROS (CAMBIO IMPORTANTE EN LA UI)

La numeróloga necesita ver los cuadros de cálculo como ella los hace a mano. Implementar esto en la sección de resultados:

### 3.1 Cuadro del Nombre Completo

Mostrar una tabla donde cada columna es un nombre/apellido, con:
- Fila 1: Las letras separadas con espacios (N A N C Y)
- Fila 2: Los valores numéricos de cada letra (5 1 5 3 7)
- Fila 3 (debajo): El resultado de la suma con su cadena de reducción

**Formato visual de referencia:**
```
┌─────────────────┬─────────────────┬─────────────────┐
│ N  A  N  C  Y  │ A  D  R  I  A  N  A │ T  A  P  I  A │
│ 5  1  5  3  7  │ 1  4  9  9  1  5  1 │ 2  1  7  9  1 │
│     21/3        │      30/3           │     20/2       │
├─────────────────┼─────────────────┼─────────────────┤
│ ALMA: A=1, Y=7  │ A=1,I=9,A=1,A=1 │ A=1,I=9,A=1    │
│       8         │      12/3        │    11/2         │
├─────────────────┼─────────────────┼─────────────────┤
│ CONS: N=5,N=5,C=3│ D=4,R=9,N=5   │ T=2,P=7         │
│       13/4 KÁRM │      18/9        │    9            │
└─────────────────┴─────────────────┴─────────────────┘
```

### 3.2 Cuadro de Fecha de Nacimiento

```
┌──────┬──────┬──────┬───────────────┐
│ DÍA  │ MES  │ AÑO  │ CAMINO DE VIDA│
│  29  │  01  │ 1961 │    29/11/2    │
│ 11/2 │   1  │  17/8│               │
└──────┴──────┴──────┴───────────────┘
```

### 3.3 Cuadro de Ciclos y Desafíos (diagrama tipo pirámide)

```
MES    DÍA    AÑO    C.VIDA
 1     11      7       1
    ↓      ↓      ↓
  12/3   18/9   12/3    ← Ciclos (arriba)
      ↘  ↙  ↘  ↙
       1    4    3       ← Desafíos (abajo)
           ↘↙
            3
```

(Este diagrama puede adaptarse a HTML/CSS para que se vea limpio.)

---

## PARTE 4 — SISTEMA FAMILIAR (Segunda Parte - solo si hay 3+ apellidos)

**Trigger:** Si el sistema detecta 3 o más apellidos en el nombre completo, automáticamente mostrar el "Mapa del Sistema Familiar" en lugar del análisis estándar.

Ejemplo: FLORENCIA AZNAR MARTINEZ LOIACONO ROBERTI → tiene 4 apellidos → activa Segunda Parte.
Ejemplo: NANCY ADRIANA TAPIA → solo 2 apellidos → análisis normal.

### Cálculo del Sistema Familiar:

**Paso 1:** Convertir todas las letras del nombre completo a números (igual que siempre)

**Paso 2:** Calcular las 9 Casas
- Las casas son del 1 al 9
- El habitante de cada casa = cantidad de veces que ese número aparece en el nombre completo
- Ejemplo: si el número 1 aparece 5 veces en el nombre → Casa 1 tiene habitante 5

**Paso 3:** Calcular los años (30, 58, 87)
- Para el año 30: mirar el habitante de la casa 1, ir a esa casa y ver qué habitante tiene → ese es el valor en 30
- Para el año 58: tomar el resultado del año 30, ir a esa casa → ese es el valor en 58
- Para el año 87: ídem con el resultado de 58

**Paso 4:** Inducción del Inconsciente
- Para cada casa: tomar su habitante (ej: casa 1 tiene habitante 5), contar 5 letras del nombre completo en orden, ver el número de esa letra

**Paso 5:** Puente Iniciático
- Para cada casa: |habitante - número de casa| (siempre positivo)

**Paso 6:** Puente de Evolución
- Contar cuántas veces se repite un mismo habitante en todas las casas, sumarlos

### Datos de Herencias del Clan:
- **Linajes**: resultado de cada nombre/apellido individual (ej: MARTINEZ = 4+1+9+2+9+5+5+8 = 43/7 → linaje 7)
- **Herencia Familiar**: suma de las casas 1+2+3+4
- **Evolución Familiar**: cantidad de letras del nombre completo → buscar el habitante de esa casa → sumar ambos
- **Campo de Expresión Profesional**: cantidad de letras + suma de casas 6+7+8+9
- **Potencial Evolutivo**: Evolución Familiar + Campo de Expresión Profesional

---

## PARTE 5 — RESULTADOS: SECCIÓN MÁS EXPLICATIVA

La sección de resultados que ya existe está bien estructuralmente, pero necesita ser **más explicativa**. Para cada número calculado mostrar:

1. **El número con su cadena de reducción** (ej: 31/4, o 13/4 KÁRMICO, o 22/4 MAESTRO)
2. **Descripción del número raíz** (el número grande antes de reducir)
3. **Si es kármico**: qué aprendizaje representa (13=disciplina, 14=equilibrio, 16=humildad, 19=independencia)
4. **Si es maestro**: qué potencial elevado representa (11=intuición, 22=gran constructor, 33=maestro)
5. **El número final reducido**: su significado en ese contexto (alma, personalidad, misión, etc.)

### Ejemplo de cómo mostrar el Número de Alma:
```
NÚMERO DE ALMA: 31/4 (también como 13/4 KÁRMICO)

📌 Raíz 31: [descripción del 31]
⚠️  Raíz 13 (KÁRMICO): Aprendizaje a través del esfuerzo y la disciplina.
    Desafío: evitar la pereza, el desorden o querer resultados rápidos.
✨ Número 4: Necesidad de seguridad emocional y estabilidad interna.
    Búsqueda de orden y control para sentirse protegido.
```

---

## PARTE 6 — PROMPTS DE IA (implementación completa)

Hay **dos flujos de IA distintos** que deben implementarse:

---

### 6A — BOTÓN "RESUMEN IA" (para uso de la numeróloga, en la sección de resultados)

Este botón ya existe. Al hacer clic, debe llamar a la IA con el **Prompt Técnico (Opción 2)** que se detalla abajo, pasándole todos los datos calculados.

**El resultado se muestra en pantalla solo para la numeróloga, NO va en el PDF.**

#### PROMPT TÉCNICO PARA LA NUMERÓLOGA (usar este exacto):

```
Actúa como un especialista avanzado en numerología pitagórica aplicada al autoconocimiento, al desarrollo personal y al análisis profundo de patrones.
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
[INSERTAR AQUÍ TODOS LOS DATOS CALCULADOS - ver estructura abajo]

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
21. INTEGRACIÓN GENERAL DEL MAPA
22. PREGUNTAS DE REFLEXIÓN PARA EL ANALISTA

ESTILO: profundo, técnico, claro, evolutivo, conectado entre sí, no fatalista, no genérico.
```

---

### 6B — PROMPT PARA EL PDF DEL CLIENTE

El PDF que se genera como resultado **debe incluir el texto producido por la IA** usando los siguientes prompts. La IA genera el texto y ese texto se inserta en el PDF automáticamente.

**FLUJO:**
1. Al generar el PDF, la app primero llama a la IA con el prompt técnico (6A) para obtener el análisis interno
2. Luego llama a la IA una segunda vez con el análisis interno como base + el prompt del cliente
3. El texto del cliente generado en el paso 2 se inserta en el PDF

---

#### PROMPT PARA EL CLIENTE — PRIMERA PARTE (carta normal, 1 o 2 apellidos):

```
Actúa como especialista en autoconocimiento y desarrollo personal.
Tu tarea es transformar el análisis numerológico completo de esta persona en un TEXTO PROFUNDO, NATURAL, HUMANO Y FÁCIL DE LEER, como si fuera un capítulo de un libro personal.

IMPORTANTE:
- No uses tecnicismos numerológicos.
- No menciones términos como: número de alma, número de personalidad, misión, propósito, camino de vida, número raíz, número maestro, número kármico, subconsciente, inconsciente, sombra, ciclo de realización, cálculos, reducciones.
- No expliques números.
- No digas "tu número es..."
- Quiero que se lea natural, profundo y fluido.

BASE PARA EL INFORME:
[INSERTAR AQUÍ EL ANÁLISIS TÉCNICO GENERADO POR EL PROMPT INTERNO]

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
MUY IMPORTANTE: Todo lo del análisis técnico debe estar traducido. No omitas aprendizajes, talentos, bloqueos ni claves de equilibrio.
```

---

#### PROMPT PARA EL CLIENTE — SEGUNDA PARTE (solo cuando hay sistema familiar, 3+ apellidos):

Este texto se agrega **después** del texto de la primera parte en el mismo PDF.

```
Actúa como especialista en autoconocimiento, numerología evolutiva y desarrollo personal.
Tu tarea es transformar el análisis del sistema familiar de esta persona en un INFORME CLARO, PROFUNDO Y ACCIONABLE.

IMPORTANTE:
- No etiquetes a la persona.
- No digas "sos así".
- Explica energías como potenciales y aprendizajes.
- Usa lenguaje humano, claro y transformador.

DATOS O ANÁLISIS BASE:
[INSERTAR AQUÍ EL ANÁLISIS DEL SISTEMA FAMILIAR GENERADO POR EL PROMPT INTERNO]

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

ESTILO: claro, humano, profundo, sin juicio, orientado a claridad y crecimiento.
```

---

### 6C — ESTRUCTURA DE DATOS QUE SE PASA A TODOS LOS PROMPTS

Al llamar a cualquier prompt de IA, pasar TODOS los datos calculados en este formato:

Pasar TODOS los datos calculados en formato estructurado:

```
DATOS PARA EL ANÁLISIS:

NOMBRE: [nombre completo]
FECHA: [fecha]

VIBRACIÓN INTERNA:
- [nombre1]: [número] (raíz: [cadena])
- [nombre2]: [número] (raíz: [cadena])

NÚMERO DE ALMA: [número grande]/[reducción] [si kármico o maestro]
NÚMERO DE PERSONALIDAD: [número grande]/[reducción] [si kármico o maestro]
NÚMERO DE MISIÓN: [número grande]/[reducción] [si kármico o maestro]

CAMINO DE VIDA: [número] [si maestro o kármico]
TALENTO (día): [número]
KARMA (mes): [número]
MEMORIA VIDA PASADA (año): [número]

CICLOS DE REALIZACIÓN:
1er Ciclo: [número] (hasta los [X] años)
2do Ciclo: [número] (entre [X] y [Y] años)
3er Ciclo: [número] (entre [Y] y [Z] años)
4to Ciclo: [número] (desde los [Z] años)
CICLO ACTUAL: [número del ciclo actual]

DESAFÍOS:
1er: [número], 2do: [número], 3er: [número], 4to: [número]

SUBCONSCIENTE I: [número]
SUBCONSCIENTE O: [número]
INCONSCIENTE: [número]
SOMBRA: [número]
SER INTERIOR: Q=[número], R=[número], S=[número]

POTENCIADORES:
Regalo Divino: [número]
Número de Fuerza: [número]
Número de Equilibrio: [número]

SITUACIÓN ACTUAL:
Año Personal: [número]
Mes Personal: [número]

DEUDAS KÁRMICAS:
[tabla con cantidad de cada número del 1 al 9]
Números faltantes o con poca presencia: [lista]

PLANOS EXISTENCIALES:
Mental (1,8): [valores]
Físico (4,5): [valores]
Emotivo (2,3,6): [valores]
Intuitivo (7,9): [valores]
```

---

## PARTE 7 — CHECKLIST DE VALIDACIONES

Implementar estas validaciones en el código:

- [ ] ¿La Y fue evaluada correctamente como vocal o consonante según el nombre?
- [ ] ¿Todos los números muestran su cadena completa (grande → pequeño)?
- [ ] ¿Se marcaron correctamente todos los kármicos (13, 14, 16, 19)?
- [ ] ¿Se marcaron correctamente todos los maestros (11, 22, 33, 44)?
- [ ] ¿Los ciclos de realización calculan correctamente el ciclo actual según la edad?
- [ ] ¿El Plano Intuitivo usa la suma de lecciones kármicas de 7 y 9 (no otro cálculo)?
- [ ] ¿El Sistema Familiar se activa solo con 3+ apellidos?
- [ ] ¿Los cuadros visuales muestran letras y valores debajo de cada una?

---

## EJEMPLO DE CASO DE PRUEBA

Usar este caso para validar todos los cálculos:

**Nombre:** NANCY ADRIANA TAPIA  
**Fecha:** 29/01/1961

**Resultados esperados:**
- Vibración Interna: NANCY=21/3, ADRIANA=30/3, TAPIA=20/2
- Alma: 31/4 (con alternativa 13/4 KÁRMICO)
- Personalidad: 40/4 (con alternativa 22/4 MAESTRO)
- Misión: 71/8 (con alternativa 35/8)
- Camino de Vida: 29/11/2 (Maestro)
- Talento (día 29): 11/2 (Maestro)
- Karma (mes 01): 1
- Memoria vida pasada (año 1961): 17/8
- Subconsciente I: 6 (suma de los 3 primeros ciclos)
- Subconsciente O: 8 (suma de los 3 primeros desafíos)  
- Inconsciente: 11/2
- Sombra: 8
- Año Personal (2025): 4
- Mes Personal: 8

---

## PARTE 8 — CUADRO DE LAS 9 CASAS (Sistema Familiar Y también Primera Parte)

### 8.1 — Mostrar siempre el cuadro de casas (en TODAS las cartas, no solo con 3+ apellidos)

El cuadro de las 9 casas se calcula a partir del nombre completo normal (nombre + apellidos habituales). Mostrarlo visualmente así:

```
┌───────┬───────────┬──────┬──────┬──────┬──────────────────────┐
│ CASA  │ HABITANTE │  30  │  58  │  87  │ INDUCC. INCONSCIENTE │
├───────┼───────────┼──────┼──────┼──────┼──────────────────────┤
│   1   │     5     │  ?   │  ?   │  ?   │          ?           │
│   2   │     1     │  ?   │  ?   │  ?   │          ?           │
│   3   │     1     │  ?   │  ?   │  ?   │          ?           │
│   4   │     1     │  ?   │  ?   │  ?   │          ?           │
│   5   │     3     │  ?   │  ?   │  ?   │          ?           │
│   6   │     0     │  ?   │  ?   │  ?   │          ?           │
│   7   │     2     │  ?   │  ?   │  ?   │          ?           │
│   8   │     0     │  ?   │  ?   │  ?   │          ?           │
│   9   │     3     │  ?   │  ?   │  ?   │          ?           │
└───────┴───────────┴──────┴──────┴──────┴──────────────────────┘
Puente Iniciático: [valor por casa]
Puente de Evolución: [valor global]
```

**Recordatorio de cómo calcular cada columna:**

- **Habitante**: cantidad de veces que aparece ese número (1-9) en el nombre completo
- **Año 30**: habitante de la casa 1 → ir a esa casa y ver su habitante
- **Año 58**: tomar resultado del año 30 → ir a esa casa → ver su habitante
- **Año 87**: tomar resultado del año 58 → ir a esa casa → ver su habitante
- **Inducción del Inconsciente**: tomar el habitante de la casa → contar esa cantidad de letras en el nombre completo en orden → ver el número de esa letra
- **Puente Iniciático por casa**: |habitante - número de casa| (siempre positivo, nunca negativo)
- **Puente de Evolución**: contar cuántas veces se repite el habitante más frecuente, sumar esas casas

---

### 8.2 — Interpretación por IA de cada casa

Después del cuadro visual, el módulo de IA debe interpretar **cada casa individualmente** con el siguiente nivel de detalle.

**Agregar al prompt de IA los datos del cuadro de casas:**

```
CUADRO DE LAS 9 CASAS:
Casa 1 (El Rey - Ego/Identidad/Padre): Habitante [X]
Casa 2 (La Reina - Emociones/Madre/Pareja): Habitante [X]
Casa 3 (El Príncipe - Creatividad/Niño Interior/Relaciones): Habitante [X]
Casa 4 (La Cocina - Trabajo/Cuerpo/Raíces Familiares): Habitante [X]
Casa 5 (Sala de Guardia - Libertad/Cambio/Sexualidad/Yang): Habitante [X]
Casa 6 (Habitación del Amor - Afectos/Femineidad/Maternidad-Paternidad): Habitante [X]
Casa 7 (La Biblioteca - Espiritualidad/Conocimiento/Esquemas Mentales): Habitante [X]
Casa 8 (Sala de Administración - Talentos/Poder/Realización Material): Habitante [X]
Casa 9 (La Capilla - Conciencia Universal/Inconsciente/Servicio): Habitante [X]

Año 30: [valor] | Año 58: [valor] | Año 87: [valor]
Inducción del Inconsciente por casa: [valores]
Puente Iniciático: [valores]
Puente de Evolución: [valor]

Relaciones importantes:
- Casas 1 y 8 (modelo del padre / energía masculina en pareja)
- Casas 2 y 6 (modelo de la madre / energía femenina en pareja)
- Si habitante casa 1 = habitante casa 8 → repite modelo del padre
- Si habitante casa 2 = habitante casa 6 → repite modelo de la madre
```

**El prompt de IA para las casas debe pedir:**

```
Para cada una de las 9 casas, analizar en profundidad:
1. Qué representa esa casa en la vida de la persona
2. Qué significa tener ese habitante específico en esa casa
   (tanto en su aspecto positivo/luz como en su sombra/dificultad)
3. Qué patrón del linaje o la infancia puede indicar
4. Cómo puede manifestarse en la vida cotidiana
5. Qué aprendizaje o desafío evolutivo propone

Luego analizar:
- Las etapas de los años 30, 58 y 87: qué energía se activa en cada etapa
- La inducción del inconsciente: qué patrones automáticos operan
- El puente iniciático: primer paso de transformación
- El puente de evolución: hacia dónde evolucionar
- La relación entre casas 1-8 y 2-6: modelos parentales y proyecciones en pareja
```

---

### 8.3 — Significados de referencia hardcodeados (para mostrar tooltips o ayuda en la UI)

El código puede tener hardcodeado un objeto con los significados básicos de cada casa para mostrar como tooltip o etiqueta, sin depender de la IA:

```javascript
const CASAS = {
  1: { nombre: "El Rey", temas: "Ego, identidad, figura paterna, liderazgo, afirmación" },
  2: { nombre: "La Reina", temas: "Emociones, figura materna, pareja, receptividad, feminidad" },
  3: { nombre: "El Príncipe", temas: "Creatividad, niño interior, relaciones sociales, expresión" },
  4: { nombre: "La Cocina", temas: "Trabajo, cuerpo, raíces familiares, mundo material" },
  5: { nombre: "Sala de Guardia", temas: "Libertad, cambio, energía vital, sexualidad, parte Yang" },
  6: { nombre: "Habitación del Amor", temas: "Afectos, maternidad/paternidad, femineidad, armonía" },
  7: { nombre: "La Biblioteca", temas: "Espiritualidad, conocimiento, esquemas mentales, introspección" },
  8: { nombre: "Sala de Administración", temas: "Talentos, poder, realización material, herencia familiar" },
  9: { nombre: "La Capilla", temas: "Conciencia universal, inconsciente, servicio humanitario" }
}

const HABITANTES = {
  0: "Aspecto kármico a desarrollar — gran potencial latente",
  1: "Autonomía, liderazgo, dinamismo, impaciencia, orgullo",
  2: "Sensibilidad, ternura, intuición, duda, inseguridad",
  3: "Creatividad, alegría, comunicación, dispersión, necesidad de aprobación",
  4: "Estructura, responsabilidad, disciplina, rigidez, miedos",
  5: "Libertad, aventura, cambio, inestabilidad, rebeldía",
  6: "Amor, servicio, armonía, vulnerabilidad, sacrificio",
  7: "Sabiduría, perfección, introspección, aislamiento, soberbia",
  8: "Poder, estrategia, realización, dominación, materialismo",
  9: "Idealismo, humanismo, compasión, ilusión, desánimo"
}
```

---



1. **No usar IA para los cálculos** — todo debe ser código determinista
2. **La IA solo se usa** para las secciones de "Resumen/Interpretación" al final
3. **Prioridad de correcciones:**
   1. Primero: corregir el Plano Intuitivo (estaba mal)
   2. Segundo: mostrar los cuadros visuales con letras y valores
   3. Tercero: mostrar siempre la cadena completa de reducción con maestros/kármicos
   4. Cuarto: corregir el cálculo de ciclos y los números derivados
   5. Quinto: activar el Sistema Familiar con 3+ apellidos
