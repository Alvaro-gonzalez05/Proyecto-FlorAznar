function formatGeminiNumber(result: any): string {
    if (!result || typeof result !== 'object') return '';
    if (result.label) return result.label;
    if (result.digit === undefined) return '';

    let value = String(result.digit);
    if (result.sequence && result.sequence.length > 1) value = result.sequence.join('/');
    if (result.isMaster && result.masterValue) value += ' (Número Maestro)';
    else if (result.isKarmic && result.karmicValue) value += ' (Número de Deuda Kármica)';

    return value;
}

export function buildAiMetricsPayload(result: any): Record<string, string | number> {
    const pp = result?.primeraParte;
    const fn = pp?.fechaNacimiento;

    const viArray = pp?.vibracionInterna || [];
    const viDesgloseArr = viArray.map((value: any) => `${value.word} = ${formatGeminiNumber(value.reduction)}`);
    const viStr = `Se analizan los nombres de pila de forma individual: ${viDesgloseArr.join(' | ')}. Explica qué significa cada uno por separado como motor de vida interna. NO existe un total sumado.`;

    const almaPerWord = pp?.almaPerWord?.map((value: any) => {
        const letras = value.vowelLetters?.map((letter: any) => `${letter.letter}=${letter.value}`).join(', ') || '';
        return `${value.word}: vocales [${letras}] = ${formatGeminiNumber(value.vowelReduction)}`;
    }).join(' + ') || '';
    const almaStr = `${formatGeminiNumber(pp?.calculoAlma)}${pp?.almaAlternative ? ` (Alternativa: ${formatGeminiNumber(pp.almaAlternative)})` : ''}. Desglose: ${almaPerWord}. Explica el significado de las vocales de cada palabra y cómo forman el Alma total.`;

    const persPerWord = pp?.personalidadPerWord?.map((value: any) => {
        const letras = value.consonantLetters?.map((letter: any) => `${letter.letter}=${letter.value}`).join(', ') || '';
        return `${value.word}: consonantes [${letras}] = ${formatGeminiNumber(value.consonantReduction)}`;
    }).join(' + ') || '';
    const persStr = `${formatGeminiNumber(pp?.calculoPersonalidad)}${pp?.personalidadAlternative ? ` (Alternativa: ${formatGeminiNumber(pp.personalidadAlternative)})` : ''}. Desglose: ${persPerWord}. Explica las consonantes de cada palabra y cómo definen la Personalidad.`;

    const misionEspecialesStr = pp?.misionEspeciales?.length > 0
        ? `. Además, se detectan estas combinaciones especiales de maestros o kármicos: ${pp.misionEspeciales.map((value: any) => formatGeminiNumber(value)).join(', ')}`
        : '';
    const misionStr = `${formatGeminiNumber(pp?.calculoMision)}${misionEspecialesStr}. Explica el propósito central y las potencias o retos adicionales encontrados en las combinaciones horizontales.`;

    const cdvStr = `${formatGeminiNumber(fn?.caminoDeVida)}${fn?.caminoDeVidaAlternative ? ` (Alternativa: ${formatGeminiNumber(fn.caminoDeVidaAlternative)})` : ''}. Componentes: Día ${fn?.dia} (=${formatGeminiNumber(fn?.diaReduction)}), Mes ${fn?.mes} (=${formatGeminiNumber(fn?.mesReduction)}), Año ${fn?.anio} (=${formatGeminiNumber(fn?.anioReduction)}). Explica cada componente de la fecha y cómo forman el Camino de Vida.`;

    const karmicLettersObj = result?.primeraParte?.deudasKarmicasNombre || {};
    const conteoStr = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => `Nº${value}=${karmicLettersObj[value] || 0}`).join(', ');
    const faltantes = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((value) => (karmicLettersObj[value] || 0) === 0).join(', ') || 'Ninguna';
    const faltantesStr = `Números faltantes: ${faltantes}. Conteo completo: ${conteoStr}. Explica qué significa la ausencia de CADA número faltante como lección kármica.`;

    const metricsPayload: Record<string, string | number> = {
        vibracion_interna: viStr,
        alma: almaStr,
        mision: misionStr,
        camino_de_vida: cdvStr,
        personalidad: persStr,
        fuerza: formatGeminiNumber(pp?.potenciadores?.numeroDeFuerza),
        equilibrio: formatGeminiNumber(pp?.potenciadores?.numeroDeEquilibrio),
        regalo_divino: formatGeminiNumber(pp?.potenciadores?.regaloDivino),
        planos_existenciales: `Mental=${pp?.planosExistenciales?.mental ?? 0}, Físico=${pp?.planosExistenciales?.fisico ?? 0}, Emotivo=${pp?.planosExistenciales?.emotivo ?? 0}, Intuitivo=${pp?.planosExistenciales?.intuitivo ?? 0}.`,
        sombra: formatGeminiNumber(pp?.ciclos?.sombra || pp?.potenciadores?.numeroDeSombra),
        anio_personal: formatGeminiNumber(pp?.potenciadores?.anioPersonal),
        mes_personal: formatGeminiNumber(pp?.potenciadores?.mesPersonal),
        talento: `${formatGeminiNumber(fn?.talento)}. Es el Don que trae del día de nacimiento (día ${fn?.dia}).`,
        karma_mes: `${formatGeminiNumber(fn?.karmaMes)}. Es el Karma que viene del mes de nacimiento (mes ${fn?.mes}).`,
        pasado: `${formatGeminiNumber(fn?.memoriaVidaPasada)}. Es la Memoria de Vida Pasada del año de nacimiento (${fn?.anio}).`,
        letras_faltantes: faltantesStr,
        ...(pp?.ciclos && {
            subconsciente_i: formatGeminiNumber(pp.ciclos.subconscienteI),
            subconsciente_o: formatGeminiNumber(pp.ciclos.subconscienteO),
            inconsciente: formatGeminiNumber(pp.ciclos.inconsciente),
            ciclos_desafios: `Ciclos: C1=${formatGeminiNumber(pp.ciclos.ciclosReduction[0])}, C2=${formatGeminiNumber(pp.ciclos.ciclosReduction[1])}, C3=${formatGeminiNumber(pp.ciclos.ciclosReduction[2])}, C4=${formatGeminiNumber(pp.ciclos.ciclosReduction[3])}. Desafíos: D1=${formatGeminiNumber(pp.ciclos.desafiosReduction[0])}, D2=${formatGeminiNumber(pp.ciclos.desafiosReduction[1])}, D3=${formatGeminiNumber(pp.ciclos.desafiosReduction[2])}, D4=${formatGeminiNumber(pp.ciclos.desafiosReduction[3])}. Por favor, da una breve explicación estructurada de esta etapa de crecimiento a través del tiempo.`,
            ciclo_actual: `Ciclo ${pp.ciclos.cicloActual}: ${formatGeminiNumber(pp.ciclos.ciclosReduction?.[pp.ciclos.cicloActual - 1])}`,
            ciclo_1: `Valor: ${formatGeminiNumber(pp.ciclos.ciclosReduction[0])}. Edades: 0 a ${pp.ciclos.edadesCiclos?.[0] || '?'} años.`,
            ciclo_2: `Valor: ${formatGeminiNumber(pp.ciclos.ciclosReduction[1])}. Edades: ${pp.ciclos.edadesCiclos?.[0] || '?'} a ${pp.ciclos.edadesCiclos?.[1] || '?'} años.`,
            ciclo_3: `Valor: ${formatGeminiNumber(pp.ciclos.ciclosReduction[2])}. Edades: ${pp.ciclos.edadesCiclos?.[1] || '?'} a ${pp.ciclos.edadesCiclos?.[2] || '?'} años.`,
            ciclo_4: `Valor: ${formatGeminiNumber(pp.ciclos.ciclosReduction[3])}. Desde los ${pp.ciclos.edadesCiclos?.[2] || '?'} años en adelante.`,
            desafio_1: `Valor: ${formatGeminiNumber(pp.ciclos.desafiosReduction[0])}.`,
            desafio_2: `Valor: ${formatGeminiNumber(pp.ciclos.desafiosReduction[1])}.`,
            desafio_3: `Valor: ${formatGeminiNumber(pp.ciclos.desafiosReduction[2])}. (Desafío Mayor / Central)`,
            desafio_4: `Valor: ${formatGeminiNumber(pp.ciclos.desafiosReduction[3])}.`,
        }),
        ...(result?.segundaParte && {
            herencia_familiar: formatGeminiNumber(result.segundaParte.herenciaFamiliar),
            evolucion_familiar: formatGeminiNumber(result.segundaParte.evolucionFamiliar),
            expresion_profesional: formatGeminiNumber(result.segundaParte.campoDeExpresion),
            potencial_evolutivo: formatGeminiNumber(result.segundaParte.potencialEvolutivo),
        }),
        ...(pp?.casas && {
            casas_9: `Habitantes principales por casa: C1=${pp.casas.habitantes[1] || 0}, C2=${pp.casas.habitantes[2] || 0}, C3=${pp.casas.habitantes[3] || 0}, C4=${pp.casas.habitantes[4] || 0}, C5=${pp.casas.habitantes[5] || 0}, C6=${pp.casas.habitantes[6] || 0}, C7=${pp.casas.habitantes[7] || 0}, C8=${pp.casas.habitantes[8] || 0}, C9=${pp.casas.habitantes[9] || 0}. Puente de Evolución Global = ${formatGeminiNumber(pp.casas.puenteDeEvolucion)}. Explica brevemente el panorama general de esta distribución de habitantes en su vida y el potencial o lección de su puente de evolución global.`,
        }),
    };

    if (result?.segundaParte?.linajes && Array.isArray(result.segundaParte.linajes)) {
        result.segundaParte.linajes.forEach((linaje: any, index: number) => {
            if (linaje.reduccion) {
                metricsPayload[`sistema_familiar_linaje_${index}`] = formatGeminiNumber(linaje.reduccion);
            }
        });
    }

    return Object.fromEntries(Object.entries(metricsPayload).filter(([, value]) => value !== ''));
}