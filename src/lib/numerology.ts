/**
 * Numerología Pitagórica — Motor de cálculos
 * 
 * Recibe nombreCompleto y fechaNacimiento (YYYY-MM-DD)
 * y devuelve todos los cálculos numerológicos.
 */

// ─── Tabla de conversión Pitagórica ───────────────────────────
const LETTER_MAP: Record<string, number> = {
    A: 1, J: 1, S: 1,
    B: 2, K: 2, T: 2,
    C: 3, L: 3, U: 3,
    D: 4, M: 4, V: 4,
    E: 5, N: 5, W: 5,
    F: 6, O: 6, X: 6,
    G: 7, P: 7, Y: 7,
    H: 8, Q: 8, Z: 8,
    I: 9, R: 9,
};

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);
const MASTER_NUMBERS = new Set([11, 22, 33, 44]);
const KARMIC_NUMBERS = new Set([13, 14, 16, 19]);

// ─── Interfaces ───────────────────────────────────────────────

export interface NumerologyNumber {
    /** Número reducido final (1-9) */
    reduced: number;
    /** Si la suma intermedia fue un número maestro o kármico, se guarda aquí (ej: "13/4", "11/2") */
    special: string | null;
}

export interface PlanesExistenciales {
    mental: number;   // Cantidad de 1 y 8
    fisico: number;   // Cantidad de 4 y 5
    emotivo: number;  // Cantidad de 2, 3 y 6
    intuitivo: number; // Cantidad de 7 y 9
}

export interface Diamond {
    realizaciones: {
        r1: NumerologyNumber; // E = A + B
        r2: NumerologyNumber; // F = B + C
        r3: NumerologyNumber; // G = E + F
        r4: NumerologyNumber; // H = A + C
    };
    desafios: {
        d1: NumerologyNumber; // K = |A - B|
        d2: NumerologyNumber; // L = |B - C|
        mayor: NumerologyNumber; // M = |K - L|
        extra: NumerologyNumber; // N = |A - C|
    };
}

export interface NumerologyResult {
    // Datos del cliente
    nombreCompleto: string;
    fechaNacimiento: string;

    // Cálculos del nombre
    vibracionInterna: NumerologyNumber;
    alma: NumerologyNumber;
    personalidad: NumerologyNumber;
    mision: NumerologyNumber;
    planesExistenciales: PlanesExistenciales;

    // Cálculos de la fecha
    talento: NumerologyNumber;
    karma: NumerologyNumber;
    vidasPasadas: NumerologyNumber;
    caminoDeVida: NumerologyNumber;
    regaloDivino: NumerologyNumber;

    // Diamante
    diamante: Diamond;
}

// ─── Funciones de reducción ──────────────────────────────────

/**
 * Suma los dígitos de un número hasta obtener un solo dígito (1-9).
 * Antes de reducir, verifica si la suma es un Número Maestro o Kármico.
 */
export function reduceNumber(n: number): NumerologyNumber {
    // Trabajamos con el valor absoluto
    n = Math.abs(n);

    // Suma de dígitos iterativa  
    let sum = n;
    while (sum > 9) {
        // Antes de reducir, verificar maestro/kármico
        if (MASTER_NUMBERS.has(sum) || KARMIC_NUMBERS.has(sum)) {
            const reduced = sumDigits(sum);
            return { reduced, special: `${sum}/${reduced}` };
        }
        sum = sumDigits(sum);
    }

    return { reduced: sum, special: null };
}

function sumDigits(n: number): number {
    let result = 0;
    while (n > 0) {
        result += n % 10;
        n = Math.floor(n / 10);
    }
    return result;
}

// ─── Funciones de conversión de letras ───────────────────────

function letterToNumber(char: string): number {
    return LETTER_MAP[char.toUpperCase()] || 0;
}

function isVowel(char: string): boolean {
    return VOWELS.has(char.toUpperCase());
}

function isLetter(char: string): boolean {
    return /[a-záéíóúñü]/i.test(char);
}

// ─── Cálculos del Nombre ─────────────────────────────────────

function normalizeForCalculation(name: string): string {
    // Normalizar acentos: á→a, é→e, í→i, ó→o, ú→u, ñ→n, ü→u
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase();
}

export function calculateNameNumbers(nombreCompleto: string) {
    const normalized = normalizeForCalculation(nombreCompleto);

    let totalSum = 0;
    let vowelSum = 0;
    let consonantSum = 0;
    const rawNumbers: number[] = [];

    for (const char of normalized) {
        if (!isLetter(char)) continue;

        const num = letterToNumber(char);
        if (num === 0) continue;

        totalSum += num;
        rawNumbers.push(num);

        if (isVowel(char)) {
            vowelSum += num;
        } else {
            consonantSum += num;
        }
    }

    const vibracionInterna = reduceNumber(totalSum);
    const alma = reduceNumber(vowelSum);
    const personalidad = reduceNumber(consonantSum);
    const mision = reduceNumber(alma.reduced + personalidad.reduced);

    return { vibracionInterna, alma, personalidad, mision, rawNumbers };
}

// ─── Planes Existenciales ────────────────────────────────────

export function calculatePlanes(rawNumbers: number[]): PlanesExistenciales {
    let mental = 0;
    let fisico = 0;
    let emotivo = 0;
    let intuitivo = 0;

    for (const num of rawNumbers) {
        if (num === 1 || num === 8) mental++;
        else if (num === 4 || num === 5) fisico++;
        else if (num === 2 || num === 3 || num === 6) emotivo++;
        else if (num === 7 || num === 9) intuitivo++;
    }

    return { mental, fisico, emotivo, intuitivo };
}

// ─── Cálculos de la Fecha ────────────────────────────────────

export function calculateDateNumbers(fechaNacimiento: string) {
    // Formato esperado: YYYY-MM-DD
    const [yearStr, monthStr, dayStr] = fechaNacimiento.split('-');
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    const talento = reduceNumber(day);
    const karma = reduceNumber(month);

    // Vidas Pasadas: suma reducida del año completo
    const yearDigitSum = yearStr.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    const vidasPasadas = reduceNumber(yearDigitSum);

    // Camino de Vida: suma de Talento + Karma + Vidas Pasadas
    const caminoDeVida = reduceNumber(talento.reduced + karma.reduced + vidasPasadas.reduced);

    // Regalo Divino: suma de los últimos 2 dígitos del año
    const lastTwoDigits = year % 100;
    const regaloDivino = reduceNumber(Math.floor(lastTwoDigits / 10) + (lastTwoDigits % 10));

    return { talento, karma, vidasPasadas, caminoDeVida, regaloDivino };
}

// ─── Diamante (Pináculos y Desafíos) ─────────────────────────

export function calculateDiamond(fechaNacimiento: string): Diamond {
    const [yearStr, monthStr, dayStr] = fechaNacimiento.split('-');
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);

    // Variables base reducidas
    const A = reduceNumber(month).reduced;  // Mes
    const B = reduceNumber(day).reduced;    // Día
    const yearDigitSum = yearStr.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    const C = reduceNumber(yearDigitSum).reduced; // Año

    // Realizaciones (sumas)
    const E = reduceNumber(A + B);       // Realización 1
    const F = reduceNumber(B + C);       // Realización 2
    const G = reduceNumber(E.reduced + F.reduced); // Realización 3
    const H = reduceNumber(A + C);       // Realización 4

    // Desafíos (restas absolutas)
    const K = reduceNumber(Math.abs(A - B));       // Desafío 1
    const L = reduceNumber(Math.abs(B - C));       // Desafío 2
    const M = reduceNumber(Math.abs(K.reduced - L.reduced)); // Desafío Mayor
    const N = reduceNumber(Math.abs(A - C));       // Desafío Extra

    return {
        realizaciones: { r1: E, r2: F, r3: G, r4: H },
        desafios: { d1: K, d2: L, mayor: M, extra: N },
    };
}

// ─── Función Principal ───────────────────────────────────────

export function calculateNumerology(nombreCompleto: string, fechaNacimiento: string): NumerologyResult {
    const { vibracionInterna, alma, personalidad, mision, rawNumbers } = calculateNameNumbers(nombreCompleto);
    const planesExistenciales = calculatePlanes(rawNumbers);
    const { talento, karma, vidasPasadas, caminoDeVida, regaloDivino } = calculateDateNumbers(fechaNacimiento);
    const diamante = calculateDiamond(fechaNacimiento);

    return {
        nombreCompleto,
        fechaNacimiento,
        vibracionInterna,
        alma,
        personalidad,
        mision,
        planesExistenciales,
        talento,
        karma,
        vidasPasadas,
        caminoDeVida,
        regaloDivino,
        diamante,
    };
}
