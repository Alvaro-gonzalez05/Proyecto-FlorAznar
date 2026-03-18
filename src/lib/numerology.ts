/**
 * Numerología Pitagórica — Motor de cálculos completo (CORREGIDO)
 * Correcciones aplicadas según mensaje_para_claude_code.md
 */

// ─── Tabla de conversión Pitagórica ───────────────────────────
const LETTER_MAP: Record<string, number> = {
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

export interface ReductionResult {
    sequence: number[];  // Full chain from biggest to smallest
    digit: number;       // Final single digit
    isMaster: boolean;
    isKarmic: boolean;
    masterValue?: number;
    karmicValue?: number;
    label: string;       // Human-readable label like "29/11/2" or "13/4 KÁRMICO"
}

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

export const HABITANTES: Record<number, string> = {
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

export function reducirANumeros(num: number): ReductionResult {
    let n = Math.abs(num);
    const sequence: number[] = [n];
    let isMaster = false;
    let isKarmic = false;
    let masterValue: number | undefined;
    let karmicValue: number | undefined;

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

/**
 * Reduce un número a un solo dígito (1-9), sin mantener números maestros.
 * Usado específicamente para los Desafíos.
 */
export function reducirSinMaestros(num: number): number {
    let n = Math.abs(num);
    if (n === 0) return 0;
    while (n > 9) {
        let sum = 0;
        let temp = n;
        while (temp > 0) {
            sum += temp % 10;
            temp = Math.floor(temp / 10);
        }
        n = sum;
    }
    return n;
}

// ─── Interfaces ───────────────────────────────────────────────

export interface LetterDetail {
    letter: string;
    value: number;
    isVowel: boolean;
}

export interface WordBreakdown {
    word: string;
    letters: LetterDetail[];
    totalValue: number;
    reduction: ReductionResult;
    vowelSum: number;
    vowelReduction: ReductionResult;
    consonantSum: number;
    consonantReduction: ReductionResult;
}

export interface NombreTotales {
    rawLetters: number[];
    letterDetails: LetterDetail[];
    letrasConteo: Record<number, number>;
    totalLetras: number;
    totalVocales: number;
    totalConsonantes: number;
    letterCount: number; // total count of letters (not sum)
}

function normalizeChar(char: string): string {
    // Handle Ñ specially before NFD decomposition
    if (char === 'Ñ' || char === 'ñ') return 'Ñ';
    return char.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

/**
 * Determines if Y functions as a vowel in a given word at a specific position.
 * Rules:
 * - Y at the end of a name is vocal (e.g., NANCY → Y sounds as vowel)
 * - Y at the beginning followed by vowel is consonant (e.g., YOLANDA)
 * - Y between consonants is vocal
 */
function isYVowel(word: string, position: number): boolean {
    const normalized = word.split('').map(c => normalizeChar(c)).join('');

    // Y at the end of a word → vocal
    if (position === normalized.length - 1) return true;

    // Y at the beginning → consonant
    if (position === 0) return false;

    // Y between two consonants → vocal
    const prevChar = normalized[position - 1];
    const nextChar = position + 1 < normalized.length ? normalized[position + 1] : null;

    const prevIsConsonant = prevChar && !VOWELS.has(prevChar) && prevChar !== 'Y';
    const nextIsConsonant = nextChar && !VOWELS.has(nextChar) && nextChar !== 'Y';

    if (prevIsConsonant && (nextIsConsonant || nextChar === null)) return true;

    // Default: consonant
    return false;
}

function analyzeWord(word: string): WordBreakdown {
    const letters: LetterDetail[] = [];
    let totalValue = 0;
    let vowelSum = 0;
    let consonantSum = 0;

    const chars = word.split('');

    for (let i = 0; i < chars.length; i++) {
        const raw = chars[i];
        const normalized = normalizeChar(raw);
        const num = LETTER_MAP[normalized];
        if (!num) continue;

        let vowel = false;
        if (normalized === 'Y') {
            vowel = isYVowel(word, i);
        } else {
            vowel = VOWELS.has(normalized);
        }

        letters.push({ letter: normalized, value: num, isVowel: vowel });
        totalValue += num;
        if (vowel) {
            vowelSum += num;
        } else {
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

export function nombreATotales(nombre: string): NombreTotales {
    let totalLetras = 0;
    let totalVocales = 0;
    let totalConsonantes = 0;
    let letterCount = 0;
    const letrasConteo: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    const rawLetters: number[] = [];
    const letterDetails: LetterDetail[] = [];

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
            } else {
                totalConsonantes += ld.value;
            }
        }
    }

    return { rawLetters, letterDetails, letrasConteo, totalLetras, totalVocales, totalConsonantes, letterCount };
}

// ─── Cuadro de 9 Casas ──────────────────────────────────────

export interface CasasData {
    habitantes: Record<number, number>;
    anos30: Record<number, number>;
    anos58: Record<number, number>;
    anos87: Record<number, number>;
    induccionInconsciente: Record<number, number | null>;
    puenteIniciatico: Record<number, number>;
    puenteDeEvolucion: ReductionResult;
    propuestaEvolucion: Record<number, ReductionResult>;
}

function calcularCasas(totalesNombre: NombreTotales): CasasData {
    const habitantes = totalesNombre.letrasConteo;
    const rawLetters = totalesNombre.rawLetters;

    // Cálculo Año 30: para CADA casa, habitante de casa → ir a esa casa → ver su habitante
    const anos30: Record<number, number> = {};
    for (let casa = 1; casa <= 9; casa++) {
        const hab = habitantes[casa] || 0;
        const casaSiguiente = reducirANumeros(hab).digit;
        if (casaSiguiente >= 1 && casaSiguiente <= 9) {
            anos30[casa] = habitantes[casaSiguiente] || 0;
        } else {
            anos30[casa] = 0;
        }
    }

    // Cálculo Año 58: tomar resultado del año 30 → ir a esa casa → ver su habitante
    const anos58: Record<number, number> = {};
    for (let casa = 1; casa <= 9; casa++) {
        const val30 = anos30[casa] || 0;
        const casaSiguiente = reducirANumeros(val30).digit;
        if (casaSiguiente >= 1 && casaSiguiente <= 9) {
            anos58[casa] = habitantes[casaSiguiente] || 0;
        } else {
            anos58[casa] = 0;
        }
    }

    // Cálculo Año 87: tomar resultado del año 58 → ir a esa casa → ver su habitante
    const anos87: Record<number, number> = {};
    for (let casa = 1; casa <= 9; casa++) {
        const val58 = anos58[casa] || 0;
        const casaSiguiente = reducirANumeros(val58).digit;
        if (casaSiguiente >= 1 && casaSiguiente <= 9) {
            anos87[casa] = habitantes[casaSiguiente] || 0;
        } else {
            anos87[casa] = 0;
        }
    }

    // Inducción del Inconsciente
    const induccionInconsciente: Record<number, number | null> = {};
    for (let casa = 1; casa <= 9; casa++) {
        const hab = habitantes[casa] || 0;
        if (hab > 0 && hab <= rawLetters.length) {
            induccionInconsciente[casa] = rawLetters[hab - 1];
        } else {
            induccionInconsciente[casa] = null;
        }
    }

    // Puente Iniciático: |habitante - número de casa|
    const puenteIniciatico: Record<number, number> = {};
    for (let casa = 1; casa <= 9; casa++) {
        puenteIniciatico[casa] = Math.abs((habitantes[casa] || 0) - casa);
    }

    // Puente de Evolución: habitante más frecuente + (frecuencia - 1), 0 cuenta como 1
    const frecuenciasEvolucion: Record<number, number> = {};
    for (let casa = 1; casa <= 9; casa++) {
        let hab = habitantes[casa] || 0;
        if (hab === 0) hab = 1; // 0 siempre vale 1 para esta regla
        frecuenciasEvolucion[hab] = (frecuenciasEvolucion[hab] || 0) + 1;
    }

    let maxFreq = 0;
    let maxHabitante = 0;
    for (const [habStr, freq] of Object.entries(frecuenciasEvolucion)) {
        const habVal = parseInt(habStr, 10);
        if (freq > maxFreq) {
            maxFreq = freq;
            maxHabitante = habVal;
        }
    }

    const resultadoEvolucion = maxHabitante + (maxFreq > 0 ? maxFreq - 1 : 0);
    const puenteDeEvolucion = reducirANumeros(resultadoEvolucion);

    // Propuesta de Evolución (por casa)
    const frecuenciasPropuesta: Record<number, number> = {};
    for (let casa = 1; casa <= 9; casa++) {
        let habOriginal = habitantes[casa] || 0;
        // Para conteo de frecuencias de propuesta, mapeamos 0 y 10 como 1 también,
        // o los contamos como están. Según el ejemplo de Flor (0 y 1 sumaron frecuencia junta o no).
        // Usamos la frecuencia del original para coincidir con el ejemplo:
        frecuenciasPropuesta[habOriginal] = (frecuenciasPropuesta[habOriginal] || 0) + 1;
    }

    const propuestaEvolucion: Record<number, ReductionResult> = {};
    for (let casa = 1; casa <= 9; casa++) {
        const habOriginal = habitantes[casa] || 0;
        let habValor = habOriginal;
        if (habValor === 0 || habValor === 10) habValor = 1;

        const frecuencia = frecuenciasPropuesta[habOriginal] || 1;
        const resultado = habValor + (frecuencia - 1);
        propuestaEvolucion[casa] = reducirANumeros(resultado);
    }

    return {
        habitantes,
        anos30,
        anos58,
        anos87,
        induccionInconsciente,
        puenteIniciatico,
        puenteDeEvolucion,
        propuestaEvolucion,
    };
}

// ─── Ciclos de Realización ───────────────────────────────────

export interface CiclosData {
    ciclos: number[];         // 4 cycles
    ciclosReduction: ReductionResult[];
    desafios: number[];       // 4 challenges
    desafiosReduction: ReductionResult[];
    edadesCiclos: number[];   // end age of each cycle
    cicloActual: number;      // which cycle (1-4) the person is in
    subconscienteI: ReductionResult;
    subconscienteO: ReductionResult;
    inconsciente: ReductionResult;
    sombra: ReductionResult;
    serInterior: {
        Q: ReductionResult;
        R: ReductionResult;
        S: ReductionResult;
    };
}

function calcularCiclos(
    mesVal: number,       // mes reducido (puede ser 11 si maestro)
    diaVal: number,       // día reducido (puede ser 11 si maestro)
    anioCiclos: number,   // año para ciclos (últimos 2 dígitos reducidos)
    anioDesafios: number, // año para desafíos (año completo reducido)
    caminoDeVida: ReductionResult,
    edadActual: number
): CiclosData {
    // 1. Ciclos de Realización (usan anioCiclos, maestros se mantienen)
    const ciclo1 = mesVal + diaVal;
    const ciclo2 = diaVal + anioCiclos;
    const ciclo3 = ciclo1 + ciclo2; // 1er + 2do Ciclo (usando sumas raw)
    const ciclo4 = mesVal + anioCiclos;

    const ciclosRaw = [ciclo1, ciclo2, ciclo3, ciclo4];
    const ciclosReduction = ciclosRaw.map(c => reducirANumeros(c));

    // 2. Desafíos (usan anioDesafios, maestros SE REDUCEN)
    // "El 10 -> 1, el 11 -> 2, etc. No hay maestros en los desafíos."
    const d1_digit = reducirSinMaestros(Math.abs(mesVal - diaVal));
    const d2_digit = reducirSinMaestros(Math.abs(diaVal - anioDesafios));
    const d3_digit = reducirSinMaestros(Math.abs(d1_digit - d2_digit));
    const d4_digit = reducirSinMaestros(Math.abs(mesVal - anioDesafios));

    const desafiosSingle = [d1_digit, d2_digit, d3_digit, d4_digit];
    const desafiosReduction = desafiosSingle.map(d => ({
        sequence: [d],
        digit: d,
        isMaster: false,
        isKarmic: false,
        label: d.toString()
    }));

    // Edades de los ciclos
    const cdv = caminoDeVida.digit;
    const fin1 = 36 - cdv;
    const fin2 = fin1 + 9;
    const fin3 = fin2 + 9;
    const fin4 = fin3 + 9;
    const edadesCiclos = [fin1, fin2, fin3, fin4];

    // Ciclo actual
    let cicloActual = 4;
    if (edadActual <= fin1) cicloActual = 1;
    else if (edadActual <= fin2) cicloActual = 2;
    else if (edadActual <= fin3) cicloActual = 3;
    else cicloActual = 4;

    // 3. Números Derivados
    // Subconsciente I = Sumar los números GRANDES de los 3 primeros ciclos
    const subI = ciclo1 + ciclo2 + ciclo3;
    const subconscienteI = reducirANumeros(subI);

    // Subconsciente O = Sumar los dígitos ya REDUCIDOS de los 3 primeros desafíos
    const subO = d1_digit + d2_digit + d3_digit;
    const subconscienteO = reducirANumeros(subO);

    // Inconsciente = 4to Ciclo (reducido) + Camino de Vida (reducido/maestro)
    const cdvVal = caminoDeVida.isMaster && caminoDeVida.masterValue
        ? caminoDeVida.masterValue
        : (caminoDeVida.isKarmic && caminoDeVida.karmicValue ? caminoDeVida.karmicValue : caminoDeVida.digit);

    const incVal = ciclosReduction[3].digit + cdvVal;
    const inconsciente = reducirANumeros(incVal);

    // Sombra = Subconsciente O + Camino de Vida
    // Nota: Usamos el valor con maestro de SubO si llegara a dar (Nancy: 6 + 11 = 17)
    const subOVal = subconscienteO.isMaster && subconscienteO.masterValue
        ? subconscienteO.masterValue
        : (subconscienteO.isKarmic && subconscienteO.karmicValue ? subconscienteO.karmicValue : subconscienteO.digit);

    const somVal = subOVal + cdvVal;
    const sombra = reducirANumeros(somVal);

    // Ser Interior: usa los dígitos ya reducidos de los desafíos
    const qVal = d1_digit + d3_digit;
    const rVal = d2_digit + d3_digit;
    const sVal = qVal + rVal;

    const serInterior = {
        Q: reducirANumeros(qVal),
        R: reducirANumeros(rVal),
        S: reducirANumeros(sVal),
    };

    return {
        ciclos: ciclosRaw,
        ciclosReduction,
        desafios: desafiosSingle,
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

/**
 * Genera todas las combinaciones posibles de sumas horizontales para la Misión.
 * Para cada palabra se toma (Alma raw o reducido) y (Personalidad raw o reducido).
 */
function calcularTodasLasMisiones(words: WordBreakdown[]): ReductionResult[] {
    const sets: number[][] = [];
    words.forEach(w => {
        // Opciones Alma para esta palabra
        const aOptions = new Set([w.vowelSum, w.vowelReduction.digit]);
        sets.push(Array.from(aOptions));

        // Opciones Personalidad para esta palabra
        const pOptions = new Set([w.consonantSum, w.consonantReduction.digit]);
        sets.push(Array.from(pOptions));
    });

    const results: number[] = [];

    function combine(index: number, currentSum: number) {
        if (index === sets.length) {
            results.push(currentSum);
            return;
        }
        for (const val of sets[index]) {
            combine(index + 1, currentSum + val);
        }
    }

    combine(0, 0);

    // Reducir cada resultado y filtrar únicos por label
    const seen = new Set<string>();
    const reductions: ReductionResult[] = [];

    results.forEach(res => {
        const red = reducirANumeros(res);
        if (!seen.has(red.label)) {
            seen.add(red.label);
            reductions.push(red);
        }
    });

    return reductions;
}

// ─── Estructura Completa ─────────────────────────────────────

export function calcularEstructura(
    nombreCompleto: string,
    fechaNacimiento: string,
    apellidosCompletos: string[],
    anioActual: number,
    mesActual: number,
    nombresDePila?: string
) {
    // Analyze complete name
    const totalesNombre = nombreATotales(nombreCompleto);

    // Per-word breakdown (CORREGIDO: separar cada nombre/apellido)
    const words = nombreCompleto.split(/\s+/).filter(w => w.length > 0);
    const wordsBreakdown: WordBreakdown[] = words.map(w => analyzeWord(w));

    // Determine which words are nombres de pila vs apellidos
    const apellidoWords = apellidosCompletos.flatMap(a => a.toUpperCase().split(/\s+/)).filter(w => w.length > 0);
    const nombreWords = nombresDePila
        ? nombresDePila.toUpperCase().split(/\s+/).filter(w => w.length > 0)
        : [];

    // Mark each word as isNombre or not
    const wordsWithType = wordsBreakdown.map(wb => {
        // Assume true unless proven otherwise (or if it explicitly matches apellido)
        return { ...wb, isNombre: true };
    });

    // 1. If we have explicit apellidos, mark them from the end of the full name
    // This is the most reliable way since 'nombreCompleto' ends with the surnames.
    if (apellidoWords.length > 0) {
        let apIdx = apellidoWords.length - 1;
        for (let i = wordsWithType.length - 1; i >= 0 && apIdx >= 0; i--) {
            // We compare normalized strings just in case
            if (wordsWithType[i].word.toUpperCase() === apellidoWords[apIdx]) {
                (wordsWithType[i] as any).isNombre = false;
                apIdx--;
            }
        }
    } else if (nombreWords.length > 0) {
        // 2. Fallback: If no surnames provided but we have first names, match first names
        const remaining = [...nombreWords];
        for (const wt of wordsWithType) {
            const idx = remaining.findIndex(nw => nw === wt.word.toUpperCase());
            if (idx >= 0) {
                (wt as any).isNombre = true;
                remaining.splice(idx, 1);
            } else {
                (wt as any).isNombre = false;
            }
        }
    }

    // Vibración Interna: SOLO nombres de pila (NUEVO: no se suma, se devuelve array)
    const vibracionInterna = wordsWithType
        .filter(wb => (wb as any).isNombre)
        .map(wb => ({
            word: wb.word,
            reduction: wb.reduction
        }));

    // Alma: vocales del nombre completo
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

    // Personalidad: consonantes del nombre completo
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

    // Misión: TODAS las combinaciones posibles (NUEVO)
    const misionCombinaciones = calcularTodasLasMisiones(wordsBreakdown);
    // El "resultado principal" es el que viene de la suma máxima ( almaTotal + personalidadTotal )
    const calculoMision = reducirANumeros(almaTotal + personalidadTotal);

    // Detectar maestros y kármicos en las combinaciones (excluyendo el principal si ya se mostró)
    const misionEspeciales = misionCombinaciones.filter(m =>
        (m.isMaster || m.isKarmic) && m.label !== calculoMision.label
    );

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

    // Camino de Vida = Día(reducido/maestro) + Mes(reducido) + Año(suma de dígitos SIN reducir a un dígito)
    // Regla de la numeróloga: preservar valores intermedios para detectar maestros/kármicos
    // Ej: 29/01/1961 → Día=11(maestro) + Mes=1 + Año=17 = 29 → 29/11/2 MAESTRO
    const diaParaCDV = diaReduction.isMaster && diaReduction.masterValue ? diaReduction.masterValue : diaReduction.digit;
    const mesParaCDV = mesReduction.isMaster && mesReduction.masterValue ? mesReduction.masterValue : mesReduction.digit;
    // Para el año, usar anioSum (ej: 1961→17) en vez de anioReduction.digit (ej: 8)
    // Esto permite que la suma total capture maestros/kármicos correctamente
    const anioParaCDV = anioSum;

    const caminoDeVidaSum = diaParaCDV + mesParaCDV + anioParaCDV;
    const caminoDeVida = reducirANumeros(caminoDeVidaSum);

    // Alternative CDV: sum all digits individually (ej: 2+9+0+1+1+9+6+1 = 29)
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
        if (n) sumaIniciales += n;
    });
    const numeroDeEquilibrio = reducirANumeros(sumaIniciales);

    // Año Personal: Día + Mes + reducción año actual
    const anioPersonal = reducirANumeros(diaReduction.digit + mesReduction.digit + reducirANumeros(anioActual).digit);

    // Mes Personal: Año Personal + mes actual
    const mesPersonal = reducirANumeros(anioPersonal.digit + mesActual);

    // ─── Ciclos de Realización (NUEVO - Parte 2) ─────────────────
    const edadActual = anioActual - year;

    // Año para ciclos (últimos 2 dígitos reducidos)
    const anioCiclos = reducirANumeros(year % 100).digit;

    // Año para desafíos (año completo reducido sin maestros)
    const anioDesafios = reducirSinMaestros(year);

    const ciclosData = calcularCiclos(
        mesReduction.digit,
        diaParaCDV,  // usa valor maestro si aplica (ej: 11)
        anioCiclos,
        anioDesafios,
        caminoDeVida,
        edadActual
    );

    // ─── Cuadro de 9 Casas (SIEMPRE se calcula - Parte 8) ───────
    const casasData = calcularCasas(totalesNombre);

    const primeraParte = {
        vibracionInterna,
        calculoAlma,
        almaPerWord,
        almaAlternative,
        almaTotal,
        calculoPersonalidad,
        personalidadPerWord,
        personalidadAlternative,
        personalidadTotal,
        calculoMision,
        misionEspeciales,
        misionCombinaciones,
        deudasKarmicasNombre,
        planosExistenciales,
        wordsBreakdown: wordsWithType.map(wb => ({ ...wb, isNombre: (wb as any).isNombre })),
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
        const linajes: Array<{ nombre: string, reduccion: ReductionResult }> = [];
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
        const cantLetras = nombreCompleto.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ]/g, '').length;
        const cantLetrasReduced = reducirANumeros(cantLetras).digit;
        const habitanteDeCasa = (cantLetrasReduced >= 1 && cantLetrasReduced <= 9) ? (hab[cantLetrasReduced] || 0) : 0;
        const evolFamRaw = cantLetras + habitanteDeCasa;
        const evolucionFamiliar = reducirANumeros(evolFamRaw);

        // Campo de Expresión Profesional: cantidad de letras + suma de casas 6+7+8+9
        const sumaCasas6a9 = (hab[6] || 0) + (hab[7] || 0) + (hab[8] || 0) + (hab[9] || 0);
        const campoExpRaw = cantLetras + sumaCasas6a9;
        const campoDeExpresion = reducirANumeros(campoExpRaw);

        // Potencial Evolutivo = Evolución Familiar + Campo de Expresión Profesional
        const potencialEvolutivo = reducirANumeros(evolFamRaw + campoExpRaw);

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
