/**
 * Numerología Pitagórica — Motor de cálculos completo
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
    sequence: number[]; // Sequence of reductions
    digit: number;      // Final single digit (except for Master numbers where we keep 11, etc. but actually we return the digit as well and mark master)
    isMaster: boolean;
    isKarmic: boolean;
    masterValue?: number;
    karmicValue?: number;
}

// ─── Funciones de ayuda (Core) ────────────────────────────────

export function reducirANumeros(num: number): ReductionResult {
    let n = Math.abs(num);
    const sequence: number[] = [n];
    let isMaster = false;
    let isKarmic = false;
    let masterValue: number | undefined;
    let karmicValue: number | undefined;

    // Check initially before any reduction
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

        // Check after reduction
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

    // Force exact special status from last checks
    return {
        sequence,
        digit: n,
        isMaster,
        isKarmic,
        masterValue,
        karmicValue
    };
}

export interface NombreTotales {
    rawLetters: number[];
    letrasConteo: Record<number, number>;
    totalLetras: number;
    totalVocales: number;
    totalConsonantes: number;
}

function normalizeChar(char: string): string {
    return char.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
}

export function nombreATotales(nombre: string): NombreTotales {
    let totalLetras = 0;
    let totalVocales = 0;
    let totalConsonantes = 0;
    const letrasConteo: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    const rawLetters: number[] = [];

    const norm = normalizeChar(nombre);
    for (const char of norm) {
        const c = char.toUpperCase();
        let num = LETTER_MAP[c];
        if (!num) num = LETTER_MAP[char]; // fallback
        if (!num) continue;

        totalLetras += num;
        rawLetters.push(num);
        letrasConteo[num] = (letrasConteo[num] || 0) + 1;

        if (VOWELS.has(c)) {
            totalVocales += num;
        } else {
            totalConsonantes += num;
        }
    }

    return { rawLetters, letrasConteo, totalLetras, totalVocales, totalConsonantes };
}


// ─── Estructura Completa ─────────────────────────────────────

export function calcularEstructura(
    nombreCompleto: string,
    fechaNacimiento: string,
    apellidosCompletos: string[],
    anioActual: number,
    mesActual: number
) {
    const totalesNombre = nombreATotales(nombreCompleto);

    const vibracionInterna = reducirANumeros(totalesNombre.totalLetras);
    const calculoAlma = reducirANumeros(totalesNombre.totalVocales);
    const calculoPersonalidad = reducirANumeros(totalesNombre.totalConsonantes);
    const calculoMision = reducirANumeros(calculoAlma.digit + calculoPersonalidad.digit);

    const deudasKarmicasNombre = totalesNombre.letrasConteo;
    const planosExistenciales = {
        mental: (deudasKarmicasNombre[1] || 0) + (deudasKarmicasNombre[8] || 0),
        fisico: (deudasKarmicasNombre[4] || 0) + (deudasKarmicasNombre[5] || 0),
        emotivo: (deudasKarmicasNombre[2] || 0) + (deudasKarmicasNombre[3] || 0) + (deudasKarmicasNombre[6] || 0),
        intuitivo: (deudasKarmicasNombre[7] || 0) + (deudasKarmicasNombre[9] || 0)
    };

    const [yearStr, monthStr, dayStr] = fechaNacimiento.split('-');
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    const diaReducido = reducirANumeros(day).digit;
    const mesReducido = reducirANumeros(month).digit;
    const anioReducidoStrA = yearStr.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
    const anioReducido = reducirANumeros(anioReducidoStrA).digit;

    const caminoDeVida = reducirANumeros(diaReducido + mesReducido + anioReducido);

    const talento = reducirANumeros(day);
    const karmaMes = reducirANumeros(month);
    const memoriaVidaPasada = reducirANumeros(anioReducidoStrA);

    const ultimosDosAnio = year % 100;
    const regaloDivino = reducirANumeros(Math.floor(ultimosDosAnio / 10) + (ultimosDosAnio % 10)); // Sum of digits of last two year numbers? Actually "suma de los últimos dos dígitos". If 1981 -> 8+1 = 9. So Math.floor(ultimosDosAnio / 10) + (ultimosDosAnio % 10). Let's use reducing of them directly.

    const numeroDeFuerza = reducirANumeros(calculoMision.digit + caminoDeVida.digit);

    const words = nombreCompleto.split(/\s+/).filter(w => w.length > 0);
    let sumaIniciales = 0;
    words.forEach(w => {
        const c = normalizeChar(w[0]);
        const n = LETTER_MAP[c];
        if (n) sumaIniciales += n;
    });
    const numeroDeEquilibrio = reducirANumeros(sumaIniciales);

    const anioPersonal = reducirANumeros(diaReducido + mesReducido + reducirANumeros(anioActual).digit); // Wait, "Día + Mes + anioActual" in digits? It says "Dígito final de (Día + Mes + anioActual). Aplicar reducirANumeros()"

    const mesPersonal = reducirANumeros(diaReducido + mesReducido + mesActual);

    const sombraVal = mesReducido + caminoDeVida.digit;
    const numeroDeSombra = { ...reducirANumeros(sombraVal), nota: "Asumido O = mes de nacimiento reducido" };

    const primeraParte = {
        vibracionInterna,
        calculoAlma,
        calculoPersonalidad,
        calculoMision,
        deudasKarmicasNombre,
        planosExistenciales,
        fechaNacimiento: {
            caminoDeVida,
            talento,
            karmaMes,
            memoriaVidaPasada
        },
        potenciadores: {
            regaloDivino,
            numeroDeFuerza,
            numeroDeEquilibrio,
            anioPersonal,
            mesPersonal,
            numeroDeSombra
        }
    };

    let segundaParte = null;

    if ((apellidosCompletos && apellidosCompletos.length >= 2) || words.length >= 3) {
        const fullNameForClan = nombreCompleto;
        const totalesClan = nombreATotales(fullNameForClan);
        const habitantes = totalesClan.letrasConteo;

        const linajes: Array<{ nombre: string, reduccion: ReductionResult }> = [];
        words.forEach(w => {
            linajes.push({
                nombre: w,
                reduccion: reducirANumeros(nombreATotales(w).totalLetras)
            });
        });

        const herenciaFamiliarSuma = (habitantes[1] || 0) + (habitantes[2] || 0) + (habitantes[3] || 0) + (habitantes[4] || 0);
        const herenciaFamiliar = reducirANumeros(herenciaFamiliarSuma);

        const totalDeLetrasNombreCompleto = totalesClan.totalLetras;
        const totalLetrasReducido = reducirANumeros(totalDeLetrasNombreCompleto).digit;
        const evolucionFamiliar = reducirANumeros(totalDeLetrasNombreCompleto + totalLetrasReducido);

        const sumaCasas6a9 = (habitantes[6] || 0) + (habitantes[7] || 0) + (habitantes[8] || 0) + (habitantes[9] || 0);
        const campoDeExpresion = reducirANumeros(totalDeLetrasNombreCompleto + sumaCasas6a9);

        const potencialEvolutivo = reducirANumeros(evolucionFamiliar.digit + campoDeExpresion.digit);

        const puenteIniciatico: Record<number, number> = {};
        for (let casa = 1; casa <= 9; casa++) {
            puenteIniciatico[casa] = Math.abs((habitantes[casa] || 0) - casa);
        }

        let puenteDeEvolucion = 0;
        for (let casa = 1; casa <= 9; casa++) {
            const h = habitantes[casa] || 0;
            if (h > 1) {
                puenteDeEvolucion += (h + 1);
            }
        }

        const anos_30_58_87 = (casa: number) => {
            const hOriginal = habitantes[casa] || 0;
            if (hOriginal >= 1 && hOriginal <= 9) return habitantes[hOriginal] || 0;
            return 0;
        };

        const res_anos: Record<number, number> = {};
        for (let c = 1; c <= 9; c++) {
            res_anos[c] = anos_30_58_87(c);
        }

        const sequenceName = totalesClan.rawLetters;
        const induccionInconsciente: Record<number, number | null> = {};
        for (let c = 1; c <= 9; c++) {
            const pos = habitantes[c] || 0;
            if (pos > 0 && pos <= sequenceName.length) {
                induccionInconsciente[c] = sequenceName[pos - 1];
            } else {
                induccionInconsciente[c] = null;
            }
        }

        segundaParte = {
            habitantes,
            linajes,
            herenciaFamiliar,
            evolucionFamiliar,
            campoDeExpresion,
            potencialEvolutivo,
            puentes: {
                iniciatico: puenteIniciatico,
                evolucion: puenteDeEvolucion
            },
            anos_30_58_87: res_anos,
            induccionInconsciente
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
