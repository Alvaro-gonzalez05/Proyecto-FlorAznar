/**
 * Numerología Pitagórica — Motor de cálculos completo (CORREGIDO)
 * Correcciones aplicadas según mensaje_para_claude_code.md
 */
// ─── Tabla de conversión Pitagórica ───────────────────────────
const LETTER_MAP = {
    A: 1, J: 1, S: 1,
    B: 2, K: 2, T: 2,
    C: 3, L: 3, U: 3,
    D: 4, M: 4, V: 4,
    E: 5, N: 5, 'Ñ': 5, W: 5,
    F: 6, O: 6, X: 6,
    G: 7, P: 7, Y: 7,
    H: 8, Q: 8, Z: 8,
    I: 9, R: 9,
};
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
const MASTER_NUMBERS = new Set([11, 22, 33, 44]);
const KARMIC_NUMBERS = new Set([13, 14, 16, 19]);
// ─── Significados de casas y habitantes (hardcodeados) ─────────
export const CASAS = {
    1: { nombre: "El Rey", temas: "Ego, identidad, figura paterna, liderazgo, afirmación" },
    2: { nombre: "La Reina", temas: "Emociones, figura materna, pareja, receptividad, feminidad" },
    3: { nombre: "El Príncipe", temas: "Creatividad, niño interior, relaciones sociales, expresión" },
    4: { nombre: "La Cocina", temas: "Trabajo, cuerpo, raíces familiares, mundo material" },
    5: { nombre: "Sala de Guardia", temas: "Libertad, cambio, energía vital, sexualidad, parte Yang" },
    6: { nombre: "Habitación del Amor", temas: "Afectos, maternidad/paternidad, femineidad, armonía" },
    7: { nombre: "La Biblioteca", temas: "Espiritualidad, conocimiento, esquemas mentales, introspección" },
    8: { nombre: "Sala de Administración", temas: "Talentos, poder, realización material, herencia familiar" },
    9: { nombre: "La Capilla", temas: "Conciencia universal, inconsciente, servicio humanitario" }
};
export const HABITANTES = {
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
};
// ─── Funciones de ayuda (Core) ────────────────────────────────
export function reducirANumeros(num) {
    let n = Math.abs(num);
    const sequence = [n];
    let isMaster = false;
    let isKarmic = false;
    let masterValue;
    let karmicValue;
    // Check initially
    if (MASTER_NUMBERS.has(n)) {
        isMaster = true;
        masterValue = n;
    }
    if (KARMIC_NUMBERS.has(n)) {
        isKarmic = true;
        karmicValue = n;
    }
    while (n > 9) {
        if (MASTER_NUMBERS.has(n)) {
            isMaster = true;
            masterValue = n;
        }
        if (KARMIC_NUMBERS.has(n)) {
            isKarmic = true;
            karmicValue = n;
        }
        let sum = 0;
        let temp = n;
        while (temp > 0) {
            sum += temp % 10;
            temp = Math.floor(temp / 10);
        }
        n = sum;
        sequence.push(n);
        if (n > 9) {
            if (MASTER_NUMBERS.has(n)) {
                isMaster = true;
                masterValue = n;
            }
            if (KARMIC_NUMBERS.has(n)) {
                isKarmic = true;
                karmicValue = n;
            }
        }
    }
    // Build human-readable label showing full chain
    let label = sequence.join('/');
    if (isMaster && masterValue) {
        label += ' MAESTRO';
    }
    if (isKarmic && karmicValue) {
        label += ' KÁRMICO';
    }
    return {
        sequence,
        digit: n,
        isMaster,
        isKarmic,
        masterValue,
        karmicValue,
        label
    };
}
function normalizeChar(char) {
    // Handle Ñ specially before NFD decomposition
    if (char === 'Ñ' || char === 'ñ')
        return 'Ñ';
    return char.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}
/**
 * Determines if Y functions as a vowel in a given word at a specific position.
 * Rules:
 * - Y at the end of a name is vocal (e.g., NANCY → Y sounds as vowel)
 * - Y at the beginning followed by vowel is consonant (e.g., YOLANDA)
 * - Y between consonants is vocal
 */
function isYVowel(word, position) {
    const normalized = word.split('').map(c => normalizeChar(c)).join('');
    // Y at the end of a word → vocal
    if (position === normalized.length - 1)
        return true;
    // Y at the beginning → consonant
    if (position === 0)
        return false;
    // Y between two consonants → vocal
    const prevChar = normalized[position - 1];
    const nextChar = position + 1 < normalized.length ? normalized[position + 1] : null;
    const prevIsConsonant = prevChar && !VOWELS.has(prevChar) && prevChar !== 'Y';
    const nextIsConsonant = nextChar && !VOWELS.has(nextChar) && nextChar !== 'Y';
    if (prevIsConsonant && (nextIsConsonant || nextChar === null))
        return true;
    // Default: consonant
    return false;
}
function analyzeWord(word) {
    const letters = [];
    let totalValue = 0;
    let vowelSum = 0;
    let consonantSum = 0;
    const chars = word.split('');
    for (let i = 0; i < chars.length; i++) {
        const raw = chars[i];
        const normalized = normalizeChar(raw);
        const num = LETTER_MAP[normalized];
        if (!num)
            continue;
        let vowel = false;
        if (normalized === 'Y') {
            vowel = isYVowel(word, i);
        }
        else {
            vowel = VOWELS.has(normalized);
        }
        letters.push({ letter: normalized, value: num, isVowel: vowel });
        totalValue += num;
        if (vowel) {
            vowelSum += num;
        }
        else {
            consonantSum += num;
        }
    }
    return {
        word: word.toUpperCase(),
        letters,
        totalValue,
        reduction: reducirANumeros(totalValue),
        vowelSum,
        vowelReduction: reducirANumeros(vowelSum),
        consonantSum,
        consonantReduction: reducirANumeros(consonantSum),
    };
}
export function nombreATotales(nombre) {
    let totalLetras = 0;
    let totalVocales = 0;
    let totalConsonantes = 0;
    let letterCount = 0;
    const letrasConteo = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    const rawLetters = [];
    const letterDetails = [];
    const words = nombre.split(/\s+/).filter(w => w.length > 0);
    for (const word of words) {
        const wd = analyzeWord(word);
        for (const ld of wd.letters) {
            totalLetras += ld.value;
            rawLetters.push(ld.value);
            letterDetails.push(ld);
            letrasConteo[ld.value] = (letrasConteo[ld.value] || 0) + 1;
            letterCount++;
            if (ld.isVowel) {
                totalVocales += ld.value;
            }
            else {
                totalConsonantes += ld.value;
            }
        }
    }
    return { rawLetters, letterDetails, letrasConteo, totalLetras, totalVocales, totalConsonantes, letterCount };
}
function calcularCasas(totalesNombre) {
    const habitantes = totalesNombre.letrasConteo;
    const rawLetters = totalesNombre.rawLetters;
    // Cálculo Año 30: para CADA casa, habitante de casa → ir a esa casa → ver su habitante
    const anos30 = {};
    for (let casa = 1; casa <= 9; casa++) {
        const hab = habitantes[casa] || 0;
        if (hab >= 1 && hab <= 9) {
            anos30[casa] = habitantes[hab] || 0;
        }
        else {
            anos30[casa] = 0;
        }
    }
    // Cálculo Año 58: tomar resultado del año 30 → ir a esa casa → ver su habitante
    const anos58 = {};
    for (let casa = 1; casa <= 9; casa++) {
        const val30 = anos30[casa] || 0;
        if (val30 >= 1 && val30 <= 9) {
            anos58[casa] = habitantes[val30] || 0;
        }
        else {
            anos58[casa] = 0;
        }
    }
    // Cálculo Año 87: tomar resultado del año 58 → ir a esa casa → ver su habitante
    const anos87 = {};
    for (let casa = 1; casa <= 9; casa++) {
        const val58 = anos58[casa] || 0;
        if (val58 >= 1 && val58 <= 9) {
            anos87[casa] = habitantes[val58] || 0;
        }
        else {
            anos87[casa] = 0;
        }
    }
    // Inducción del Inconsciente
    const induccionInconsciente = {};
    for (let casa = 1; casa <= 9; casa++) {
        const hab = habitantes[casa] || 0;
        if (hab > 0 && hab <= rawLetters.length) {
            induccionInconsciente[casa] = rawLetters[hab - 1];
        }
        else {
            induccionInconsciente[casa] = null;
        }
    }
    // Puente Iniciático: |habitante - número de casa|
    const puenteIniciatico = {};
    for (let casa = 1; casa <= 9; casa++) {
        puenteIniciatico[casa] = Math.abs((habitantes[casa] || 0) - casa);
    }
    // Puente de Evolución: contar cuántas veces se repite el habitante más frecuente, sumar esas casas
    const habitanteFrequency = {};
    for (let casa = 1; casa <= 9; casa++) {
        const h = habitantes[casa] || 0;
        if (!habitanteFrequency[h])
            habitanteFrequency[h] = [];
        habitanteFrequency[h].push(casa);
    }
    let maxFreq = 0;
    let puenteDeEvolucion = 0;
    for (const [hab, casas] of Object.entries(habitanteFrequency)) {
        if (casas.length > maxFreq) {
            maxFreq = casas.length;
            puenteDeEvolucion = casas.reduce((sum, c) => sum + c, 0);
        }
    }
    return {
        habitantes,
        anos30,
        anos58,
        anos87,
        induccionInconsciente,
        puenteIniciatico,
        puenteDeEvolucion,
    };
}
function calcularCiclos(mesReduced, // mes reducido (puede ser 11 si maestro)
diaReduced, // día reducido (puede ser 11 si maestro)
anioReduced, // año reducido (puede ser 17, 11, etc.)
caminoDeVida, edadActual) {
    // Usar los dígitos reducidos para ciclos
    const mesVal = mesReduced;
    const diaVal = diaReduced;
    const anioVal = anioReduced;
    // 4 Ciclos de Realización (se suman)
    const ciclo1 = mesVal + diaVal;
    const ciclo2 = diaVal + anioVal;
    const ciclo3 = ciclo1 + ciclo2; // 1er + 2do Ciclo (using raw sums)
    const ciclo4 = mesVal + anioVal;
    const ciclosRaw = [ciclo1, ciclo2, ciclo3, ciclo4];
    const ciclosReduction = ciclosRaw.map(c => reducirANumeros(c));
    // 4 Desafíos (se restan — siempre positivo)
    const desafio1 = Math.abs(mesVal - diaVal);
    const desafio2 = Math.abs(diaVal - anioVal);
    const desafio3 = Math.abs(desafio2 - desafio1); // |2do - 1er Desafío|
    const desafio4 = Math.abs(mesVal - anioVal);
    const desafiosRaw = [desafio1, desafio2, desafio3, desafio4];
    const desafiosReduction = desafiosRaw.map(d => reducirANumeros(d));
    // Edades de los ciclos
    const cdv = caminoDeVida.digit;
    const fin1 = 36 - cdv;
    const fin2 = fin1 + 9;
    const fin3 = fin2 + 9;
    const fin4 = fin3 + 9;
    const edadesCiclos = [fin1, fin2, fin3, fin4];
    // Ciclo actual
    let cicloActual = 4;
    if (edadActual <= fin1)
        cicloActual = 1;
    else if (edadActual <= fin2)
        cicloActual = 2;
    else if (edadActual <= fin3)
        cicloActual = 3;
    else
        cicloActual = 4;
    // Números especiales derivados
    // Subconsciente I = 1er + 2do + 3er Ciclo (reducidos)
    const subI = ciclosReduction[0].digit + ciclosReduction[1].digit + ciclosReduction[2].digit;
    const subconscienteI = reducirANumeros(subI);
    // Subconsciente O = 1er + 2do + 3er Desafío (reducidos)
    const subO = desafiosReduction[0].digit + desafiosReduction[1].digit + desafiosReduction[2].digit;
    const subconscienteO = reducirANumeros(subO);
    // Inconsciente = 4to Ciclo + Camino de Vida
    const incVal = ciclosReduction[3].digit + caminoDeVida.digit;
    const inconsciente = reducirANumeros(incVal);
    // Sombra = Subconsciente O + Camino de Vida
    const somVal = subconscienteO.digit + caminoDeVida.digit;
    const sombra = reducirANumeros(somVal);
    // Ser Interior
    const qVal = desafiosReduction[0].digit + desafiosReduction[2].digit;
    const rVal = desafiosReduction[1].digit + desafiosReduction[2].digit;
    const sVal = qVal + rVal;
    const serInterior = {
        Q: reducirANumeros(qVal),
        R: reducirANumeros(rVal),
        S: reducirANumeros(sVal),
    };
    return {
        ciclos: ciclosRaw,
        ciclosReduction,
        desafios: desafiosRaw,
        desafiosReduction,
        edadesCiclos,
        cicloActual,
        subconscienteI,
        subconscienteO,
        inconsciente,
        sombra,
        serInterior,
    };
}
// ─── Estructura Completa ─────────────────────────────────────
export function calcularEstructura(nombreCompleto, fechaNacimiento, apellidosCompletos, anioActual, mesActual, nombresDePila) {
    // Analyze complete name
    const totalesNombre = nombreATotales(nombreCompleto);
    // Per-word breakdown (CORREGIDO: separar cada nombre/apellido)
    const words = nombreCompleto.split(/\s+/).filter(w => w.length > 0);
    const wordsBreakdown = words.map(w => analyzeWord(w));
    // Determine which words are nombres de pila vs apellidos
    const nombreWords = nombresDePila
        ? nombresDePila.toUpperCase().split(/\s+/).filter(w => w.length > 0)
        : [];
    // Mark each word as isNombre or not
    const wordsWithType = wordsBreakdown.map(wb => {
        const wordUpper = wb.word.toUpperCase();
        const isNombre = nombreWords.length > 0
            ? nombreWords.some(nw => nw === wordUpper)
            : true; // fallback: treat all as nombre if no separation provided
        return Object.assign(Object.assign({}, wb), { isNombre });
    });
    // If nombresDePila was provided, consume matches in order to handle duplicate words
    if (nombreWords.length > 0) {
        const remaining = [...nombreWords];
        for (const wt of wordsWithType) {
            const idx = remaining.findIndex(nw => nw === wt.word.toUpperCase());
            if (idx >= 0) {
                wt.isNombre = true;
                remaining.splice(idx, 1);
            }
            else {
                wt.isNombre = false;
            }
        }
    }
    // Vibración Interna: SOLO nombres de pila (CORREGIDO — apellido NO suma)
    const vibracionInternaPerWord = wordsWithType.map(wb => ({
        word: wb.word,
        totalValue: wb.totalValue,
        reduction: wb.reduction,
        letters: wb.letters,
        isNombre: wb.isNombre,
    }));
    // Total vibración interna = sum of ONLY nombre de pila words
    const nombreOnlySum = wordsWithType
        .filter(wb => wb.isNombre)
        .reduce((sum, wb) => sum + wb.totalValue, 0);
    const vibracionInterna = reducirANumeros(nombreOnlySum || totalesNombre.totalLetras);
    // Alma: vocales del nombre completo (CORREGIDO 1.2 — uses Y logic)
    const almaPerWord = wordsBreakdown.map(wb => ({
        word: wb.word,
        vowelSum: wb.vowelSum,
        vowelReduction: wb.vowelReduction,
        vowelLetters: wb.letters.filter(l => l.isVowel),
    }));
    const almaTotal = totalesNombre.totalVocales;
    const calculoAlma = reducirANumeros(almaTotal);
    // Check alternative chain for alma
    const almaPerWordDigits = almaPerWord.map(a => a.vowelReduction.digit);
    const almaAlternativeSum = almaPerWordDigits.reduce((sum, d) => sum + d, 0);
    const almaAlternative = reducirANumeros(almaAlternativeSum);
    // Personalidad: consonantes del nombre completo (CORREGIDO 1.3)
    const personalidadPerWord = wordsBreakdown.map(wb => ({
        word: wb.word,
        consonantSum: wb.consonantSum,
        consonantReduction: wb.consonantReduction,
        consonantLetters: wb.letters.filter(l => !l.isVowel),
    }));
    const personalidadTotal = totalesNombre.totalConsonantes;
    const calculoPersonalidad = reducirANumeros(personalidadTotal);
    // Check alternative chain for personalidad
    const persPerWordDigits = personalidadPerWord.map(p => p.consonantReduction.digit);
    const persAlternativeSum = persPerWordDigits.reduce((sum, d) => sum + d, 0);
    const personalidadAlternative = reducirANumeros(persAlternativeSum);
    // Misión = Alma (número grande) + Personalidad (número grande) (CORREGIDO 1.4)
    const misionTotal = almaTotal + personalidadTotal;
    const calculoMision = reducirANumeros(misionTotal);
    // Alternative
    const misionAlternativeSum = almaAlternativeSum + persAlternativeSum;
    const misionAlternative = reducirANumeros(misionAlternativeSum);
    // Deudas kármicas / conteo de letras
    const deudasKarmicasNombre = totalesNombre.letrasConteo;
    // Planos Existenciales (CORREGIDO 1.5 — Intuitivo usa CONTEO de 7s y 9s)
    const planosExistenciales = {
        mental: (deudasKarmicasNombre[1] || 0) + (deudasKarmicasNombre[8] || 0),
        fisico: (deudasKarmicasNombre[4] || 0) + (deudasKarmicasNombre[5] || 0),
        emotivo: (deudasKarmicasNombre[2] || 0) + (deudasKarmicasNombre[3] || 0) + (deudasKarmicasNombre[6] || 0),
        intuitivo: (deudasKarmicasNombre[7] || 0) + (deudasKarmicasNombre[9] || 0)
    };
    // ─── Fecha de Nacimiento (CORREGIDO 1.6) ─────────────────────
    const [yearStr, monthStr, dayStr] = fechaNacimiento.split('-');
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);
    // Reducir cada componente POR SEPARADO
    const diaReduction = reducirANumeros(day);
    const mesReduction = reducirANumeros(month);
    const anioSum = yearStr.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    const anioReduction = reducirANumeros(anioSum);
    // Camino de Vida = Día(reducido) + Mes(reducido) + Año(reducido)
    // BUT for master numbers: use the master value (e.g., 11 not 2)
    const diaParaCDV = diaReduction.isMaster && diaReduction.masterValue ? diaReduction.masterValue : diaReduction.digit;
    const mesParaCDV = mesReduction.isMaster && mesReduction.masterValue ? mesReduction.masterValue : mesReduction.digit;
    const anioParaCDV = anioReduction.isMaster && anioReduction.masterValue ? anioReduction.masterValue : anioReduction.digit;
    const caminoDeVidaSum = diaParaCDV + mesParaCDV + anioParaCDV;
    const caminoDeVida = reducirANumeros(caminoDeVidaSum);
    // Alternative CDV: sum all digits individually
    const altCDVSum = (dayStr + monthStr + yearStr).split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    const caminoDeVidaAlternative = reducirANumeros(altCDVSum);
    const talento = reducirANumeros(day);
    const karmaMes = reducirANumeros(month);
    const memoriaVidaPasada = reducirANumeros(anioSum);
    // Potenciadores
    const ultimosDosAnio = year % 100;
    const regaloDivinoSum = Math.floor(ultimosDosAnio / 10) + (ultimosDosAnio % 10);
    const regaloDivino = reducirANumeros(regaloDivinoSum);
    const numeroDeFuerza = reducirANumeros(calculoMision.digit + caminoDeVida.digit);
    let sumaIniciales = 0;
    words.forEach(w => {
        const c = normalizeChar(w[0]);
        const n = LETTER_MAP[c];
        if (n)
            sumaIniciales += n;
    });
    const numeroDeEquilibrio = reducirANumeros(sumaIniciales);
    // Año Personal: Día + Mes + reducción año actual
    const anioPersonal = reducirANumeros(diaReduction.digit + mesReduction.digit + reducirANumeros(anioActual).digit);
    // Mes Personal: Año Personal + mes actual
    const mesPersonal = reducirANumeros(anioPersonal.digit + mesActual);
    // ─── Ciclos de Realización (NUEVO - Parte 2) ─────────────────
    const edadActual = anioActual - year;
    const ciclosData = calcularCiclos(mesReduction.digit, diaParaCDV, // use master value if applicable (e.g., 11)
    anioReduction.digit, caminoDeVida, edadActual);
    // ─── Cuadro de 9 Casas (SIEMPRE se calcula - Parte 8) ───────
    const casasData = calcularCasas(totalesNombre);
    const primeraParte = {
        vibracionInterna,
        vibracionInternaPerWord,
        calculoAlma,
        almaPerWord,
        almaAlternative,
        almaTotal,
        calculoPersonalidad,
        personalidadPerWord,
        personalidadAlternative,
        personalidadTotal,
        calculoMision,
        misionAlternative,
        misionTotal,
        deudasKarmicasNombre,
        planosExistenciales,
        wordsBreakdown: wordsWithType.map(wb => (Object.assign(Object.assign({}, wb), { isNombre: wb.isNombre }))),
        fechaNacimiento: {
            dia: day,
            mes: month,
            anio: year,
            diaReduction,
            mesReduction,
            anioReduction,
            caminoDeVida,
            caminoDeVidaAlternative,
            talento,
            karmaMes,
            memoriaVidaPasada,
        },
        potenciadores: {
            regaloDivino,
            numeroDeFuerza,
            numeroDeEquilibrio,
            anioPersonal,
            mesPersonal,
        },
        ciclos: ciclosData,
        casas: casasData,
    };
    // ─── Sistema Familiar (Solo con 3+ apellidos - CORREGIDO) ────
    let segundaParte = null;
    const apellidosCount = apellidosCompletos.length;
    if (apellidosCount >= 3) {
        const linajes = [];
        words.forEach(w => {
            linajes.push({
                nombre: w,
                reduccion: reducirANumeros(analyzeWord(w).totalValue)
            });
        });
        const hab = casasData.habitantes;
        const herenciaFamiliarSuma = (hab[1] || 0) + (hab[2] || 0) + (hab[3] || 0) + (hab[4] || 0);
        const herenciaFamiliar = reducirANumeros(herenciaFamiliarSuma);
        // Evolución Familiar: cantidad de letras del nombre completo → buscar habitante de esa casa → sumar ambos
        const cantLetras = totalesNombre.letterCount;
        const cantLetrasReduced = reducirANumeros(cantLetras).digit;
        const habitanteDeCasa = (cantLetrasReduced >= 1 && cantLetrasReduced <= 9) ? (hab[cantLetrasReduced] || 0) : 0;
        const evolucionFamiliar = reducirANumeros(cantLetras + habitanteDeCasa);
        // Campo de Expresión Profesional: cantidad de letras + suma de casas 6+7+8+9
        const sumaCasas6a9 = (hab[6] || 0) + (hab[7] || 0) + (hab[8] || 0) + (hab[9] || 0);
        const campoDeExpresion = reducirANumeros(cantLetras + sumaCasas6a9);
        // Potencial Evolutivo = Evolución Familiar + Campo de Expresión Profesional
        const potencialEvolutivo = reducirANumeros(evolucionFamiliar.digit + campoDeExpresion.digit);
        segundaParte = {
            habitantes: hab,
            linajes,
            herenciaFamiliar,
            evolucionFamiliar,
            campoDeExpresion,
            potencialEvolutivo,
            puentes: {
                iniciatico: casasData.puenteIniciatico,
                evolucion: casasData.puenteDeEvolucion,
            },
            anos30: casasData.anos30,
            anos58: casasData.anos58,
            anos87: casasData.anos87,
            induccionInconsciente: casasData.induccionInconsciente,
        };
    }
    return {
        nombreCompleto,
        fechaNacimiento,
        apellidosCompletos,
        anioActual,
        mesActual,
        primeraParte,
        segundaParte
    };
}
