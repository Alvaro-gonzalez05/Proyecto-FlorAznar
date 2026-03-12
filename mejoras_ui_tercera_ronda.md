# MEJORAS DE UI Y CORRECCIONES — APP DE NUMEROLOGÍA
# (Tercera ronda)

---

## 1. CORRECCIÓN CRÍTICA — CAMINO DE VIDA

**Problema:** El Camino de Vida muestra **20/2** como valor principal y "Alternativa: 29/11/2 MAESTRO" como secundario. Está invertido.

**Regla:** Siempre mostrar primero el número más grande y la versión que contenga maestro o kármico como el valor PRINCIPAL, no como alternativa.

**Corrección:**
- Valor principal: **29/11/2 MAESTRO**
- Alternativa (opcional, más chica): 20/2

Esto aplica en TODOS los lugares donde aparece el Camino de Vida:
- Card principal (pantalla 1)
- Cuadro de Fecha de Nacimiento
- Ciclos de Realización
- Cualquier otro lugar

---

## 2. DESGLOSE DE VIBRACIÓN INTERNA

**Problema:** La card de Vibración Interna solo muestra el total (51/6) sin desglosar cada nombre.

**Corrección:** La card debe mostrar el desglose completo:

```
VIBRACIÓN INTERNA
┌─────────────────────────────────┐
│  NANCY    ADRIANA               │
│  21/3  +  30/3  =  51/6        │
│                                 │
│  Solo nombres de pila           │
└─────────────────────────────────┘
```

Mostrar cada nombre con su resultado individual, el símbolo + entre ellos, y el total final. Si hay un solo nombre, mostrar solo ese. Si hay más de dos nombres, mostrar todos en fila.

---

## 3. CUADRO DEL NOMBRE COMPLETO — UNIFICAR Y DETALLAR

**Problema:** El cuadro de letras (NANCY / ADRIANA / TAPIA) está muy separado de los totales de Alma, Personalidad y Misión. Se ven como secciones desconectadas.

**Corrección:** Unificar en un solo bloque visual cohesivo con esta estructura:

```
CUADRO DEL NOMBRE COMPLETO
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  N  A  N  C  Y    A  D  R  I  A  N  A    [APELLIDO] T  A  P  I  A  │
│  5  1  5  3  7    1  4  9  9  1  5  1              2  1  7  9  1  │
│     21/3               30/3                           20/2        │
│                                                              │
│  ALMA (vocales)                                              │
│  A=1 Y=7 | A=1 I=9 A=1 A=1 | A=1 I=9 A=1               │
│    8    +      12/3       +     11/2    =  31/4            │
│                              Alt: 13/4 KÁRMICO              │
│                                                              │
│  PERSONALIDAD (consonantes)                                  │
│  N=5 N=5 C=3 | D=4 R=9 N=5 | T=2 P=7                   │
│    13/4 KÁRM  +    18/9    +    9    =  40/4               │
│                              Alt: 22/4 MAESTRO              │
│                                                              │
│  MISIÓN = ALMA + PERSONALIDAD                                │
│  31 + 40 = 71/8                                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

Todo en un solo card, con secciones claramente separadas pero visualmente conectadas. Vocales en azul, consonantes en rosa, igual que ahora.

---

## 4. CUADRO DE FECHA DE NACIMIENTO — MÁS DETALLADO

**Problema:** Muestra los componentes pero no explica bien el proceso de reducción.

**Corrección:** Mostrar así:

```
CUADRO DE FECHA DE NACIMIENTO
┌────────────┬────────────┬────────────┬─────────────────────┐
│    DÍA     │    MES     │    AÑO     │   CAMINO DE VIDA    │
│     29     │     01     │    1961    │                     │
│  2+9=11/2  │     1      │ 1+9+6+1=  │   11 + 1 + 17 =    │
│  MAESTRO   │            │   17/8    │   29/11/2 MAESTRO   │
└────────────┴────────────┴────────────┴─────────────────────┘
Alternativa: 1+1+1+9+6+1 = 20/2
```

Mostrar la operación de suma dentro de cada celda, no solo el resultado. Que se vea el proceso.

---

## 5. BOTÓN DE IA EN CADA SECCIÓN — EXPLICACIÓN CONTEXTUAL

**Requerimiento:** Cada sección de resultados debe tener el ícono/botón de IA (el ✦ que ya existe en algunas cards). Al hacer clic, la IA debe explicar específicamente ESA sección usando los datos ya calculados.

**Implementar para estas secciones:**
- Vibración Interna
- Alma
- Personalidad
- Misión
- Camino de Vida
- Talento / Karma / Memoria
- Ciclos de Realización (ciclo actual)
- Subconsciente I y O
- Inconsciente
- Sombra
- Ser Interior
- Las 9 Casas (un botón global que explique todo el cuadro)
- Año Personal / Mes Personal

**Cómo debe funcionar:**

Al hacer clic en el ícono IA de una sección específica, llamar a la IA pasándole:
1. El tipo de sección (ej: "alma", "ciclo_actual", "casas")
2. El valor calculado de esa sección
3. El contexto mínimo necesario (nombre, fecha, camino de vida)

**Prompt base para cada sección (adaptar según el tipo):**

```
Actúa como especialista en numerología pitagórica.
Explica de forma clara, profunda y humana el siguiente número de la carta numerológica de [NOMBRE]:

SECCIÓN: [nombre de la sección]
VALOR: [número con cadena completa, ej: 31/4 o 13/4 KÁRMICO]
CONTEXTO: Camino de Vida [X], Alma [X], Misión [X]

Explica:
1. Qué significa este número en el contexto de [la sección]
2. Si tiene número raíz relevante, qué aporta antes de reducirse
3. Si es kármico o maestro, qué implica específicamente
4. Cómo puede manifestarse en la vida de esta persona
5. Qué fortalezas y qué desafíos trae

Usa lenguaje profundo pero accesible. Máximo 200 palabras.
No menciones tecnicismos como "número raíz" o "reducción".
```

**Para las 9 Casas específicamente**, el prompt debe pedir análisis de cada casa individualmente con su habitante (ya implementado en 6A, reutilizar ese fragmento pero de forma más corta y visual).

**UX del botón:**
- El ícono ✦ ya existe en algunas cards — extenderlo a todas
- Al hacer clic: mostrar un pequeño panel/modal debajo de la card con el texto de la IA
- Mostrar spinner mientras carga
- Cachear la respuesta para no regenerar si ya fue consultada

---

## 6. ORDEN GENERAL DE LAS SECCIONES

Reorganizar la página de resultados en este orden lógico:

```
1. Cards principales (Vibración Interna, Alma, Personalidad, Misión, Camino de Vida)
2. Cuadro del Nombre Completo (con desglose unificado)
3. Cuadro de Fecha de Nacimiento
4. Atributos de la Fecha (Talento, Karma, Memoria)
5. Ciclos de Realización y Desafíos
6. Frecuencias Potenciadoras (Subconsciente I/O, Inconsciente, Sombra, Ser Interior)
7. Planos Existenciales
8. Tránsito Actual (Año Personal, Mes Personal)
9. Cuadro de las 9 Casas
10. Conteo de Letras / Deudas Kármicas
11. Botón "Resumen IA" (análisis técnico completo para la numeróloga)
12. Botón "Generar PDF del Cliente"
```

---

## 7. CORRECCIONES PENDIENTES DE CONFIRMAR CON LA NUMERÓLOGA

Estos valores siguen en discusión — NO cambiar hasta tener confirmación:

| Valor | App muestra | Esperado según doc | Pendiente |
|-------|------------|-------------------|-----------|
| Subconsciente I | 8 | 6 | ⏳ Confirmar cómo reduce el año para ciclos |
| Subconsciente O | 11/2 | 8 | ⏳ Ídem |
| Sombra | 4 | 8 | ⏳ Ídem |
| Mes Personal | 7 | 8 | ⏳ Confirmar fórmula mes personal |

La hipótesis es que para los ciclos el año se reduce usando solo los últimos 2 dígitos (61→7) en lugar de todos los dígitos (1961→8). Confirmar con la numeróloga.
