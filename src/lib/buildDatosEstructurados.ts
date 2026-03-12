/**
 * Construye el string de datos estructurados (formato 6C) para pasar a los prompts de IA
 */
export function buildDatosEstructurados(data: any): string {
    if (!data) return '';

    const p = data.primeraParte;
    const s = data.segundaParte;
    const dn = (n: any): string => {
        if (!n) return '-';
        if (n.label) return n.label;
        if (n.sequence && n.sequence.length > 1) {
            let lbl = n.sequence.join('/');
            if (n.isMaster) lbl += ' MAESTRO';
            if (n.isKarmic) lbl += ' KÁRMICO';
            return lbl;
        }
        return String(n.digit ?? '-');
    };

    let text = `DATOS PARA EL ANÁLISIS:

NOMBRE: ${data.nombreCompleto}
FECHA: ${data.fechaNacimiento}

VIBRACIÓN INTERNA:
`;
    if (p?.vibracionInterna) {
        p.vibracionInterna.forEach((v: any) => {
            text += `- ${v.word}: ${dn(v.reduction)}\n`;
        });
    }

    text += `
NÚMERO DE ALMA: ${dn(p?.calculoAlma)}`;
    if (p?.almaAlternative?.isKarmic || p?.almaAlternative?.isMaster) {
        text += ` (alternativa: ${dn(p?.almaAlternative)})`;
    }

    text += `
NÚMERO DE PERSONALIDAD: ${dn(p?.calculoPersonalidad)}`;
    if (p?.personalidadAlternative?.isKarmic || p?.personalidadAlternative?.isMaster) {
        text += ` (alternativa: ${dn(p?.personalidadAlternative)})`;
    }

    text += `
NÚMERO DE MISIÓN: ${dn(p?.calculoMision)}`;
    if (p?.misionEspeciales && p.misionEspeciales.length > 0) {
        p.misionEspeciales.forEach((m: any) => {
            text += ` (también se detecta: ${dn(m)})`;
        });
    }

    text += `

CAMINO DE VIDA: ${dn(p?.fechaNacimiento?.caminoDeVida)}`;
    if (p?.fechaNacimiento?.caminoDeVidaAlternative) {
        text += ` (alternativa: ${dn(p?.fechaNacimiento?.caminoDeVidaAlternative)})`;
    }

    text += `
TALENTO (día): ${dn(p?.fechaNacimiento?.talento)}
KARMA (mes): ${dn(p?.fechaNacimiento?.karmaMes)}
MEMORIA VIDA PASADA (año): ${dn(p?.fechaNacimiento?.memoriaVidaPasada)}
`;

    // Ciclos
    if (p?.ciclos) {
        const c = p.ciclos;
        text += `
CICLOS DE REALIZACIÓN:
1er Ciclo: ${dn(c.ciclosReduction?.[0])} (hasta los ${c.edadesCiclos?.[0]} años)
2do Ciclo: ${dn(c.ciclosReduction?.[1])} (entre ${c.edadesCiclos?.[0]} y ${c.edadesCiclos?.[1]} años)
3er Ciclo: ${dn(c.ciclosReduction?.[2])} (entre ${c.edadesCiclos?.[1]} y ${c.edadesCiclos?.[2]} años)
4to Ciclo: ${dn(c.ciclosReduction?.[3])} (desde los ${c.edadesCiclos?.[2]} años)
CICLO ACTUAL: ${c.cicloActual}

DESAFÍOS:
1er: ${dn(c.desafiosReduction?.[0])}, 2do: ${dn(c.desafiosReduction?.[1])}, 3er: ${dn(c.desafiosReduction?.[2])}, 4to: ${dn(c.desafiosReduction?.[3])}

SUBCONSCIENTE I: ${dn(c.subconscienteI)}
SUBCONSCIENTE O: ${dn(c.subconscienteO)}
INCONSCIENTE: ${dn(c.inconsciente)}
SOMBRA: ${dn(c.sombra)}
SER INTERIOR: Q=${c.serInterior?.Q?.digit}, R=${c.serInterior?.R?.digit}, S=${c.serInterior?.S?.digit}
`;
    }

    // Potenciadores
    text += `
POTENCIADORES:
Regalo Divino: ${dn(p?.potenciadores?.regaloDivino)}
Número de Fuerza: ${dn(p?.potenciadores?.numeroDeFuerza)}
Número de Equilibrio: ${dn(p?.potenciadores?.numeroDeEquilibrio)}

SITUACIÓN ACTUAL:
Año Personal: ${dn(p?.potenciadores?.anioPersonal)}
Mes Personal: ${dn(p?.potenciadores?.mesPersonal)}
`;

    // Deudas kármicas
    const dk = p?.deudasKarmicasNombre;
    if (dk) {
        text += `
DEUDAS KÁRMICAS:
`;
        for (let i = 1; i <= 9; i++) {
            text += `Nº${i}: ${dk[i] || 0}  `;
        }
        const faltantes = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => (dk[n] || 0) === 0);
        text += `\nNúmeros faltantes: ${faltantes.length > 0 ? faltantes.join(', ') : 'Ninguno'}`;
    }

    // Planos
    const pl = p?.planosExistenciales;
    if (pl) {
        text += `

PLANOS EXISTENCIALES:
Mental (1,8): ${pl.mental}
Físico (4,5): ${pl.fisico}
Emotivo (2,3,6): ${pl.emotivo}
Intuitivo (7,9): ${pl.intuitivo}
`;
    }

    // 9 Casas
    if (p?.casas) {
        const casas = p.casas;
        const casaNames: Record<number, string> = {
            1: 'El Rey - Ego/Identidad/Padre',
            2: 'La Reina - Emociones/Madre/Pareja',
            3: 'El Príncipe - Creatividad/Niño Interior/Relaciones',
            4: 'La Cocina - Trabajo/Cuerpo/Raíces Familiares',
            5: 'Sala de Guardia - Libertad/Cambio/Sexualidad/Yang',
            6: 'Habitación del Amor - Afectos/Femineidad/Maternidad-Paternidad',
            7: 'La Biblioteca - Espiritualidad/Conocimiento/Esquemas Mentales',
            8: 'Sala de Administración - Talentos/Poder/Realización Material',
            9: 'La Capilla - Conciencia Universal/Inconsciente/Servicio',
        };

        text += `
CUADRO DE LAS 9 CASAS:
`;
        for (let c = 1; c <= 9; c++) {
            const hab = casas.habitantes?.[c] ?? 0;
            const a30 = casas.anos30?.[c] ?? '-';
            const a58 = casas.anos58?.[c] ?? '-';
            const a87 = casas.anos87?.[c] ?? '-';
            const ind = casas.induccionInconsciente?.[c] ?? '-';
            const pte = casas.puenteIniciatico?.[c] ?? '-';
            text += `Casa ${c} (${casaNames[c]}): Habitante ${hab} | Año 30: ${a30} | Año 58: ${a58} | Año 87: ${a87} | Ind. Inconsciente: ${ind} | Puente Iniciático: ${pte}\n`;
        }
        text += `
Puente de Evolución: ${casas.puenteDeEvolucion?.label || casas.puenteDeEvolucion?.sequence?.join('/') || casas.puenteDeEvolucion?.digit || '-'}

Relaciones parentales:
`;
        const hab1 = casas.habitantes?.[1] ?? 0;
        const hab8 = casas.habitantes?.[8] ?? 0;
        const hab2 = casas.habitantes?.[2] ?? 0;
        const hab6 = casas.habitantes?.[6] ?? 0;
        text += `- Casa 1 (habitante ${hab1}) y Casa 8 (habitante ${hab8}): ${hab1 === hab8 ? 'IGUALES → repite modelo del padre' : 'distintos'} → modelo del padre\n`;
        text += `- Casa 2 (habitante ${hab2}) y Casa 6 (habitante ${hab6}): ${hab2 === hab6 ? 'IGUALES → repite modelo de la madre' : 'distintos'} → modelo de la madre\n`;
    }

    // Sistema familiar
    if (s) {
        text += `
SISTEMA FAMILIAR (3+ apellidos):
`;
        if (s.linajes) {
            s.linajes.forEach((l: any) => {
                text += `- Linaje ${l.nombre}: ${dn(l.reduccion)}\n`;
            });
        }
        text += `Herencia Familiar: ${dn(s.herenciaFamiliar)}
Evolución Familiar: ${dn(s.evolucionFamiliar)}
Campo de Expresión: ${dn(s.campoDeExpresion)}
Potencial Evolutivo: ${dn(s.potencialEvolutivo)}
`;
    }

    return text;
}
