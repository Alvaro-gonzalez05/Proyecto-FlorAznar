# CORRECCIONES PENDIENTES — APP DE NUMEROLOGÍA
# (Segunda ronda — lo que faltó en la primera implementación)

---

## 1. AGREGAR NÚMERO MAESTRO 44

En la función que detecta números maestros, falta el **44**.

La lista correcta es: `11, 22, 33, 44`

Revisar en `numerology.ts` y en cualquier lugar donde se valide si un número es maestro. Asegurarse de que el 44 también:
- No se reduzca automáticamente
- Se muestre como `44/8`
- Se marque visualmente como MAESTRO igual que el 11, 22 y 33

---

## 2. AGREGAR COLUMNA "PUENTE INICIÁTICO" EN LA TABLA DE LAS 9 CASAS (Card 14)

La tabla de las 9 casas actualmente muestra: Casa / Nombre / Habitante / Año 30 / Año 58 / Año 87 / Inducción del Inconsciente.

**Falta agregar una columna más: Puente Iniciático por casa.**

Fórmula: `|habitante - número de casa|` (siempre positivo, nunca negativo)

Ejemplo: Casa 3 con habitante 7 → |7 - 3| = 4

La tabla completa correcta debe tener estas columnas:
```
CASA | NOMBRE | HABITANTE | AÑO 30 | AÑO 58 | AÑO 87 | IND. INCONSCIENTE | PUENTE INICIÁTICO
```

El Puente de Evolución global ya existe debajo de la tabla — dejarlo como está.

---

## 3. AGREGAR ANÁLISIS DE LAS 9 CASAS AL PROMPT TÉCNICO (6A — botón "Resumen IA")

El prompt técnico que se usa para el botón "Resumen IA" necesita incluir el análisis de las 9 casas.

**En el archivo `src/app/api/analysis/route.ts`**, agregar al prompt esta sección después de "AÑO PERSONAL ACTUAL" y antes de "INTEGRACIÓN GENERAL DEL MAPA":

```
22. ANÁLISIS DE LAS 9 CASAS
Para cada una de las 9 casas, analizar en profundidad:
- Qué representa esa casa en la vida de la persona
- Qué significa tener ese habitante específico en esa casa (aspecto positivo/luz y sombra/dificultad)
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
```

Renumerar las secciones siguientes (la actual 22 pasa a ser 23, etc.).

---

## 4. CORREGIR FORMATO DE LAS 9 CASAS EN LOS DATOS QUE SE PASAN A LA IA (6C)

**En el archivo `src/lib/buildDatosEstructurados.ts`**, verificar que las 9 casas se pasen a la IA con este formato exacto (con nombre simbólico):

```
CUADRO DE LAS 9 CASAS:
Casa 1 (El Rey - Ego/Identidad/Padre): Habitante [X] | Año 30: [X] | Año 58: [X] | Año 87: [X] | Ind. Inconsciente: [X] | Puente Iniciático: [X]
Casa 2 (La Reina - Emociones/Madre/Pareja): Habitante [X] | Año 30: [X] | Año 58: [X] | Año 87: [X] | Ind. Inconsciente: [X] | Puente Iniciático: [X]
Casa 3 (El Príncipe - Creatividad/Niño Interior/Relaciones): Habitante [X] | ...
Casa 4 (La Cocina - Trabajo/Cuerpo/Raíces Familiares): Habitante [X] | ...
Casa 5 (Sala de Guardia - Libertad/Cambio/Sexualidad/Yang): Habitante [X] | ...
Casa 6 (Habitación del Amor - Afectos/Femineidad/Maternidad-Paternidad): Habitante [X] | ...
Casa 7 (La Biblioteca - Espiritualidad/Conocimiento/Esquemas Mentales): Habitante [X] | ...
Casa 8 (Sala de Administración - Talentos/Poder/Realización Material): Habitante [X] | ...
Casa 9 (La Capilla - Conciencia Universal/Inconsciente/Servicio): Habitante [X] | ...

Puente de Evolución: [X]

Relaciones parentales:
- Casa 1 (habitante [X]) y Casa 8 (habitante [X]): [igual o distinto] → modelo del padre
- Casa 2 (habitante [X]) y Casa 6 (habitante [X]): [igual o distinto] → modelo de la madre
```

Si actualmente el formato no incluye los nombres simbólicos ni las relaciones parentales, corregirlo.

---

## RESUMEN DE ARCHIVOS A TOCAR

| Archivo | Qué cambiar |
|---------|-------------|
| `src/lib/numerology.ts` | Agregar 44 a la lista de números maestros |
| `src/app/resultados/page.tsx` (Card 14) | Agregar columna "Puente Iniciático" en la tabla de casas |
| `src/app/api/analysis/route.ts` | Agregar sección 22 de análisis de las 9 casas al prompt técnico |
| `src/lib/buildDatosEstructurados.ts` | Corregir formato de casas con nombres simbólicos y relaciones parentales |

---

## CASO DE PRUEBA PARA VALIDAR

Usar **NANCY ADRIANA TAPIA, 29/01/1961** y verificar:
- [ ] El 44 se detecta y muestra como maestro si aparece en algún cálculo
- [ ] La tabla de las 9 casas tiene la columna Puente Iniciático con valores correctos
- [ ] El botón "Resumen IA" incluye en su respuesta el análisis de cada casa
- [ ] Los datos enviados a la IA incluyen los nombres simbólicos de cada casa y las relaciones parentales
