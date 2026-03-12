# CORRECCIÓN URGENTE — VIBRACIÓN INTERNA

## El problema

En el Cuadro del Nombre Completo, la Vibración Interna está mostrando TAPIA (el apellido) como si fuera un nombre más. Eso está mal.

**Regla correcta según la numeróloga:**
- Vibración Interna = se calcula SOLO con el/los nombre(s) de pila
- El apellido NO entra en la vibración interna
- El apellido se muestra en el cuadro pero su vibración es independiente

**Para NANCY ADRIANA TAPIA:**
- Vibración Interna: NANCY (21/3) + ADRIANA (30/3) → TAPIA queda FUERA
- TAPIA aparece en el cuadro visual con sus letras y valores, pero NO suma a la Vibración Interna

## Cómo detectar qué es nombre y qué es apellido

La app ya recibe el nombre completo separado en campos distintos (nombre(s) y apellido(s)).
Usar esa separación para el cálculo de Vibración Interna:
- Solo procesar las palabras que están en el campo "nombres"
- Las palabras del campo "apellidos" se muestran en el cuadro pero no se suman a la Vibración Interna

Si actualmente todo viene en un solo string, revisar cómo el formulario de entrada (`nueva-consulta`) separa nombres de apellidos y usar esa información.

## Resultado esperado para NANCY ADRIANA TAPIA

```
Vibración Interna:
- NANCY: 5+1+5+3+7 = 21/3
- ADRIANA: 1+4+9+9+1+5+1 = 30/3
(TAPIA no suma aquí)

TAPIA aparece en el cuadro visual con sus valores: 2 1 7 9 1 = 20/2
pero es el resultado del apellido, no de la vibración interna
```

## Lo que SÍ está bien en la imagen actual

- Los valores de cada letra están correctos ✅
- Los totales de Alma (31/4), Personalidad (40/4) y Misión (71/8) están correctos ✅
- Las alternativas kármicas/maestras están correctas ✅
- Solo hay que corregir qué palabras se incluyen en la Vibración Interna
