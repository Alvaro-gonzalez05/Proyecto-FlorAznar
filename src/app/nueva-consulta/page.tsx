'use client';

import { useEffect, useRef, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import TransitionLink from '../components/TransitionLink';
import { supabase } from '@/lib/supabase';

export default function NuevaConsultaPage() {
    const formRef = useRef<HTMLDivElement>(null);
    const illustrationRef = useRef<HTMLDivElement>(null);
    const mandalaSvgRef = useRef<SVGSVGElement>(null);
    const headerRef = useRef<HTMLElement>(null);
    const footerRef = useRef<HTMLElement>(null);
    const loadingTextRef = useRef<HTMLDivElement>(null);
    const floatingEl1Ref = useRef<HTMLDivElement>(null);
    const floatingEl2Ref = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [prefill, setPrefill] = useState<{ nombre?: string, apellido?: string, fechaNacimiento?: string }>({});

    // Read pre-fill data from agenda
    useEffect(() => {
        const stored = sessionStorage.getItem('agendaPrefill');
        if (stored) {
            try {
                setPrefill(JSON.parse(stored));
            } catch { /* ignore */ }
            sessionStorage.removeItem('agendaPrefill');
        }
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Staggered entrance animations
            const timeline = gsap.timeline({ delay: 0.3 });

            timeline.fromTo(headerRef.current,
                { y: -20, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.6,
                    ease: 'power3.out',
                }
            );

            timeline.fromTo(formRef.current,
                { x: -30, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                }, '-=0.3'
            );

            timeline.fromTo(illustrationRef.current,
                { x: 30, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.8,
                    ease: 'power3.out',
                }, '-=0.6'
            );
        });

        return () => ctx.revert();
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Capture form data
        const formData = new FormData(e.target as HTMLFormElement);
        const nombre = (formData.get('nombre') as string).trim();
        const apellido = (formData.get('apellido') as string).trim();
        const nombreCompleto = `${nombre} ${apellido}`;
        const apellidosCompletos = apellido.split(/\s+/).filter(a => a.length > 0);
        const anioActual = new Date().getFullYear();
        const mesActual = new Date().getMonth() + 1;
        const fechaNacimiento = formData.get('fechaNacimiento') as string;

        const illustrationEl = illustrationRef.current;
        const svgEl = mandalaSvgRef.current;
        if (!illustrationEl || !svgEl) return;

        // Capture exact visual position of the mandala div
        const rect = illustrationEl.getBoundingClientRect();

        // Calculate how far the mandala center needs to move to reach viewport center
        const currentCenterX = rect.left + rect.width / 2;
        const currentCenterY = rect.top + rect.height / 2;
        const viewportCenterX = window.innerWidth / 2 + 40; // slightly to the right
        const viewportCenterY = window.innerHeight / 2 - 60; // offset up to leave room for text below

        // Delta = how much to translate from current position
        const deltaX = viewportCenterX - currentCenterX;
        const deltaY = viewportCenterY - currentCenterY;

        const tl = gsap.timeline();

        // 1. Fade out header (slides up)
        tl.to(headerRef.current, {
            opacity: 0,
            y: -30,
            duration: 0.5,
            ease: 'power2.inOut',
        }, 0);

        // 2. Fade out footer (slides down)
        tl.to(footerRef.current, {
            opacity: 0,
            y: 30,
            duration: 0.5,
            ease: 'power2.inOut',
        }, 0);

        // 3. Fade out form (slide left + fade)
        tl.to(formRef.current, {
            opacity: 0,
            x: -60,
            duration: 0.6,
            ease: 'power3.inOut',
        }, 0.05);

        // 4. Fade out floating icon elements
        tl.to([floatingEl1Ref.current, floatingEl2Ref.current], {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.inOut',
        }, 0.2);

        // 5. Move the ENTIRE mandala div to viewport center using x/y translation
        tl.to(illustrationEl, {
            x: deltaX,
            y: deltaY,
            duration: 1.2,
            ease: 'power3.inOut',
        }, 0.4);

        // 5. Start spinning ONLY the SVG (not the floating icons)
        tl.to(svgEl, {
            rotation: 360,
            duration: 15,
            repeat: -1,
            ease: 'none',
            transformOrigin: '50% 50%',
        }, 1.2);

        // 6. Show loading text centered below the mandala
        //    Calculate where the mandala ends up and place text below it
        const mandalaFinalBottom = viewportCenterY + rect.height / 2;
        tl.add(() => {
            if (loadingTextRef.current) {
                loadingTextRef.current.style.display = 'flex';
                loadingTextRef.current.style.top = `${mandalaFinalBottom + 24}px`;
            }
        }, 1.4);
        tl.fromTo(loadingTextRef.current, {
            opacity: 0,
            y: 15,
        }, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
        }, 1.5);

        // Helper para animar cambio de texto en el loading
        const changeLoadingText = (h3Text: string, pText: string) => {
            if (!loadingTextRef.current) return;
            const h3 = loadingTextRef.current.querySelector('h3');
            const p = loadingTextRef.current.querySelector('p');
            if (!h3 || !p) return;
            gsap.to([h3, p], {
                opacity: 0, y: -10, duration: 0.4, ease: 'power2.in',
                onComplete: () => {
                    h3.textContent = h3Text;
                    p.textContent = pText;
                    gsap.fromTo([h3, p], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
                },
            });
        };

        // 7a. Cambiar texto al terminar el cálculo numérico (~3.5s)
        tl.add(() => changeLoadingText('ANALIZANDO', 'La IA está interpretando tu mapa...'), 3.5);

        // 7b. Segundo mensaje mientras la IA trabaja (~8s)
        tl.add(() => changeLoadingText('CASI LISTO', 'Generando todas las explicaciones...'), 8);

        // 8. Call the API in parallel with the animation
        const apiCall = fetch('/api/numerology', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombreCompleto, nombresDePila: nombre, fechaNacimiento, apellidosCompletos, anioActual, mesActual }),
        }).then(async (res) => {
            if (!res.ok) throw new Error('Error en el cálculo numérico');
            const result = await res.json();

            // Formatter para advertir a la IA si es Maestro o Kármico
            const formatGeminiNumber = (r: any) => {
                if (!r || typeof r !== 'object') return '';
                if (r.label) return r.label;
                if (r.digit === undefined) return '';
                let val = String(r.digit);
                if (r.sequence && r.sequence.length > 1) val = r.sequence.join('/');
                if (r.isMaster && r.masterValue) val += ' (Número Maestro)';
                else if (r.isKarmic && r.karmicValue) val += ' (Número de Deuda Kármica)';
                return val;
            };


            // 8.1 Call the Gemini API to pre-calculate explanations based on the result
            // Build rich descriptors with breakdowns for detailed AI analysis
            const pp = result.primeraParte;

            // Vibración Interna with per-name breakdown (NUEVO: no hay total, solo desgloses)
            const viArray = pp?.vibracionInterna || [];
            const viDesgloseArr = viArray.map((v: any) => `${v.word} = ${formatGeminiNumber(v.reduction)}`);
            const viStr = `Se analizan los nombres de pila de forma individual: ${viDesgloseArr.join(' | ')}. Explica qué significa cada uno por separado como motor de vida interna. NO existe un total sumado.`;

            // Alma with per-word vowel breakdown
            const almaPerWord = pp?.almaPerWord?.map((a: any) => {
                const letras = a.vowelLetters?.map((l: any) => `${l.letter}=${l.value}`).join(', ') || '';
                return `${a.word}: vocales [${letras}] = ${formatGeminiNumber(a.vowelReduction)}`;
            }).join(' + ') || '';
            const almaStr = `${formatGeminiNumber(pp?.calculoAlma)}${pp?.almaAlternative ? ` (Alternativa: ${formatGeminiNumber(pp.almaAlternative)})` : ''}. Desglose: ${almaPerWord}. Explica el significado de las vocales de cada palabra y cómo forman el Alma total.`;

            // Personalidad with per-word consonant breakdown
            const persPerWord = pp?.personalidadPerWord?.map((p: any) => {
                const letras = p.consonantLetters?.map((l: any) => `${l.letter}=${l.value}`).join(', ') || '';
                return `${p.word}: consonantes [${letras}] = ${formatGeminiNumber(p.consonantReduction)}`;
            }).join(' + ') || '';
            const persStr = `${formatGeminiNumber(pp?.calculoPersonalidad)}${pp?.personalidadAlternative ? ` (Alternativa: ${formatGeminiNumber(pp.personalidadAlternative)})` : ''}. Desglose: ${persPerWord}. Explica las consonantes de cada palabra y cómo definen la Personalidad.`;

            // Misión with ALL combinations (NUEVO)
            const misionEspecialesStr = pp?.misionEspeciales?.length > 0
                ? `. Además, se detectan estas combinaciones especiales de maestros o kármicos: ${pp.misionEspeciales.map((m: any) => formatGeminiNumber(m)).join(', ')}`
                : '';
            const misionStr = `${formatGeminiNumber(pp?.calculoMision)}${misionEspecialesStr}. Explica el propósito central y las potencias o retos adicionales encontrados en las combinaciones horizontales.`;

            // Camino de Vida with date components
            const fn = pp?.fechaNacimiento;
            const cdvStr = `${formatGeminiNumber(fn?.caminoDeVida)}${fn?.caminoDeVidaAlternative ? ` (Alternativa: ${formatGeminiNumber(fn.caminoDeVidaAlternative)})` : ''}. Componentes: Día ${fn?.dia} (=${formatGeminiNumber(fn?.diaReduction)}), Mes ${fn?.mes} (=${formatGeminiNumber(fn?.mesReduction)}), Año ${fn?.anio} (=${formatGeminiNumber(fn?.anioReduction)}). Explica cada componente de la fecha y cómo forman el Camino de Vida.`;

            const karmicLettersObj = result.primeraParte?.deudasKarmicasNombre || {};
            const conteoStr = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `Nº${n}=${karmicLettersObj[n] || 0}`).join(', ');
            const faltantes = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => (karmicLettersObj[n] || 0) === 0).join(', ') || 'Ninguna';
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
                ...(result.segundaParte && {
                    sistema_familiar_herencia: formatGeminiNumber(result.segundaParte.herenciaFamiliar),
                    sistema_familiar_evolucion: formatGeminiNumber(result.segundaParte.evolucionFamiliar),
                    sistema_familiar_expresion: formatGeminiNumber(result.segundaParte.campoDeExpresion),
                    sistema_familiar_potencial: formatGeminiNumber(result.segundaParte.potencialEvolutivo),
                }),
                ...(pp?.casas && {
                    casas_9: `Habitantes principales por casa: C1=${pp.casas.habitantes[1] || 0}, C2=${pp.casas.habitantes[2] || 0}, C3=${pp.casas.habitantes[3] || 0}, C4=${pp.casas.habitantes[4] || 0}, C5=${pp.casas.habitantes[5] || 0}, C6=${pp.casas.habitantes[6] || 0}, C7=${pp.casas.habitantes[7] || 0}, C8=${pp.casas.habitantes[8] || 0}, C9=${pp.casas.habitantes[9] || 0}. Puente de Evolución Global = ${formatGeminiNumber(pp.casas.puenteDeEvolucion)}. Explica brevemente el panorama general de esta distribución de habitantes en su vida y el potencial o lección de su puente de evolución global.`,
                }),
            };

            // Iterar sobre los linajes dinámicamente y agregarlos al payload JSON
            if (result.segundaParte?.linajes && Array.isArray(result.segundaParte.linajes)) {
                result.segundaParte.linajes.forEach((linaje: any, idx: number) => {
                    if (linaje.reduccion) {
                        metricsPayload[`sistema_familiar_linaje_${idx}`] = formatGeminiNumber(linaje.reduccion);
                    }
                });
            }

            // Remove any empty metrics
            const cleanPayload = Object.fromEntries(Object.entries(metricsPayload).filter(([_, v]) => v !== ''));

            // Guardar el payload de métricas antes de llamar a la IA
            sessionStorage.setItem('aiMetricsPayload', JSON.stringify(cleanPayload));

            // Llamar a analysis-complete AQUÍ, en paralelo con la animación de carga
            let aiDataResult: any = {};
            try {
                const analysisRes = await fetch('/api/analysis-complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        dataStr: JSON.stringify(result),
                        metricsPayload: cleanPayload,
                    }),
                });
                if (analysisRes.ok) {
                    const analysisData = await analysisRes.json();
                    aiDataResult = analysisData.explanations || {};
                }
            } catch (err) {
                console.error("Error en analysis-complete:", err);
            }

            sessionStorage.setItem('geminiExplanations', JSON.stringify(aiDataResult));
            sessionStorage.setItem('resumenAnalista', '');
            sessionStorage.setItem('clientReportEdited', '');

            // --- SUPABASE STORAGE ---
            // Guardar silenciosamente el registro en la base de datos PostgreSQL
            try {
                const { error: sbError } = await supabase.from('consultas').insert([{
                    nombre_completo: nombre, // Save just the given name to DB
                    fecha_nacimiento: fechaNacimiento,
                    apellidos_completos: apellido, // Save just the given apellidos piece to DB
                    numerologia_data: result,
                    explicaciones_ia: aiDataResult
                }]);

                if (sbError) console.error("Error saving to Supabase:", sbError);
            } catch (err) {
                console.error("Network error saving to Supabase", err);
            }

            return result;
        });

        // 9. Navigate after BOTH animation + API complete
        tl.add(() => {
            apiCall.then((result) => {
                // Limpiar el flag para que se muestren las tarjetas en presentación
                sessionStorage.removeItem('cardsViewedOnce');
                sessionStorage.removeItem('technicalAnalysis');
                // Limpiar caches de IA on-demand de sesiones anteriores
                const keysToRemove: string[] = [];
                for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    if (key && key.startsWith('ai_section_')) keysToRemove.push(key);
                }
                keysToRemove.forEach(k => sessionStorage.removeItem(k));
                sessionStorage.setItem('numerologyResult', JSON.stringify(result));

                router.push('/resultados');
            }).catch(() => {
                alert('Hubo un error al calcular. Intenta de nuevo.');
                setIsLoading(false);
                window.location.reload();
            });
        }, 5.5);
    };

    return (
        <main className="flex-1 flex flex-col relative overflow-hidden">
            {/* Background Shapes */}
            <div className="absolute rounded-full blur-3xl opacity-40 bg-mint w-96 h-96 -top-20 -right-20"></div>
            <div className="absolute rounded-full blur-3xl opacity-40 bg-lavender w-80 h-80 top-1/2 -right-10"></div>
            <div className="absolute rounded-full blur-3xl opacity-40 bg-peach w-64 h-64 bottom-0 left-1/4"></div>

            {/* Header */}
            <header ref={headerRef} className="flex justify-between items-center px-6 md:px-12 py-6 md:py-10 relative z-10">
                <TransitionLink className="flex items-center gap-2 text-slate-400 hover:text-black-accent transition-colors group" href="/">
                    <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span className="text-xs md:text-sm font-semibold uppercase tracking-widest">Volver</span>
                </TransitionLink>
                <div className="flex items-center gap-3 md:gap-6">
                    <button className="material-symbols-outlined p-2 rounded-full hover:bg-slate-100 transition-colors text-xl md:text-2xl">notifications</button>
                    <button className="material-symbols-outlined p-2 rounded-full hover:bg-slate-100 transition-colors text-xl md:text-2xl">help_outline</button>
                </div>
            </header>

            {/* Main Content */}
            <section className="flex-1 flex items-center justify-center px-4 md:px-8 py-6 md:py-0 relative z-10 overflow-y-auto">
                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-20 items-center my-auto">
                    <div ref={formRef} className="space-y-8 md:space-y-12">
                        <div className="space-y-2">
                            <h2 className="text-xs uppercase tracking-[0.4em] font-semibold text-slate-400">Paso 01</h2>
                            <h1 className="text-4xl md:text-6xl font-light tracking-tight">Nueva <span className="font-bold">Consulta</span></h1>
                        </div>

                        <form className="space-y-4 md:space-y-8" onSubmit={handleSubmit}>
                            <div className="space-y-3 md:space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                                    <div className="group">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1 group-focus-within:text-black-accent transition-colors">
                                            Nombre
                                        </label>
                                        <input
                                            name="nombre"
                                            required
                                            defaultValue={prefill.nombre || ''}
                                            className="w-full bg-white border-none rounded-2xl p-3 md:p-5 soft-shadow focus:ring-2 focus:ring-lavender transition-all text-base md:text-lg font-light placeholder:text-slate-300"
                                            placeholder="Ej. Sofía"
                                            type="text"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1 group-focus-within:text-black-accent transition-colors">
                                            Apellido
                                        </label>
                                        <input
                                            name="apellido"
                                            required
                                            defaultValue={prefill.apellido || ''}
                                            className="w-full bg-white border-none rounded-2xl p-3 md:p-5 soft-shadow focus:ring-2 focus:ring-lavender transition-all text-base md:text-lg font-light placeholder:text-slate-300"
                                            placeholder="Ej. Martínez"
                                            type="text"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 ml-1 group-focus-within:text-black-accent transition-colors">
                                        Fecha de Nacimiento
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="fechaNacimiento"
                                            required
                                            defaultValue={prefill.fechaNacimiento || ''}
                                            className="w-full bg-white border-none rounded-2xl p-3 md:p-5 soft-shadow focus:ring-2 focus:ring-lavender transition-all text-base md:text-lg font-light placeholder:text-slate-300 appearance-none"
                                            type="date"
                                        />
                                        <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none">
                                            calendar_today
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3 md:pt-6">
                                <button
                                    className={`w-full bg-black-accent text-white py-3 md:py-6 rounded-2xl font-bold text-sm tracking-[0.2em] uppercase flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-xl shadow-black/10 active:scale-[0.99] ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
                                    type="submit"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Procesando...' : 'Comenzar Análisis'}
                                    {!isLoading && <span className="material-symbols-outlined text-lg">auto_awesome</span>}
                                </button>
                                <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest mt-3 md:mt-6 leading-relaxed">
                                    El análisis tomará aproximadamente 15 segundos en ser procesado.
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* Illustration - Mandala (entire div moves to center on submit) */}
                    <div ref={illustrationRef} className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden">
                            <svg ref={mandalaSvgRef} className="w-full max-w-md drop-shadow-xl opacity-90 transition-transform duration-1000 ease-out hover:rotate-12" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                                <desc>Geometría Sagrada Minimalista</desc>

                                {/* Group centered at 200,200 for easier rotation/symmetries */}
                                <g transform="translate(200, 200)">

                                    {/* Delicate outer orbits */}
                                    <circle cx="0" cy="0" r="140" fill="none" stroke="#1a1a1a" strokeWidth="0.5" strokeOpacity="0.3" />
                                    <circle cx="0" cy="0" r="160" fill="none" stroke="#1a1a1a" strokeWidth="0.3" strokeOpacity="0.2" />

                                    {/* Seed of Life Pattern - Pure Strokes */}
                                    <g stroke="#1a1a1a" strokeWidth="0.8" fill="none" strokeOpacity="0.7">
                                        <circle cx="0" cy="0" r="50" />
                                        <circle cx="0" cy="-50" r="50" />
                                        <circle cx="43.3" cy="-25" r="50" />
                                        <circle cx="43.3" cy="25" r="50" />
                                        <circle cx="0" cy="50" r="50" />
                                        <circle cx="-43.3" cy="25" r="50" />
                                        <circle cx="-43.3" cy="-25" r="50" />
                                    </g>

                                    {/* Intersecting Geometry */}
                                    <g stroke="#1a1a1a" strokeWidth="0.5" fill="none" strokeOpacity="0.4" transform="rotate(30)">
                                        <path d="M0 -140 L0 140" />
                                        <path d="M-121.2 -70 L121.2 70" />
                                        <path d="M-121.2 70 L121.2 -70" />
                                    </g>

                                    {/* Tiny Accents - Minimalist dots */}
                                    <circle cx="0" cy="-140" r="2" fill="#1a1a1a" opacity="0.6" />
                                    <circle cx="121.2" cy="-70" r="2" fill="#1a1a1a" opacity="0.6" />
                                    <circle cx="121.2" cy="70" r="2" fill="#1a1a1a" opacity="0.6" />
                                    <circle cx="0" cy="140" r="2" fill="#1a1a1a" opacity="0.6" />
                                    <circle cx="-121.2" cy="70" r="2" fill="#1a1a1a" opacity="0.6" />
                                    <circle cx="-121.2" cy="-70" r="2" fill="#1a1a1a" opacity="0.6" />

                                    {/* Center point */}
                                    <circle cx="0" cy="0" r="3" fill="#1a1a1a" />
                                </g>
                            </svg>

                            {/* Floating UI Elements for depth */}
                            <div ref={floatingEl1Ref} className="absolute top-10 right-10 bg-white p-3 rounded-2xl shadow-xl animate-[bounce_3s_infinite]">
                                <span className="material-symbols-outlined text-black-accent">magic_button</span>
                            </div>
                            <div ref={floatingEl2Ref} className="absolute bottom-20 left-0 bg-white p-3 rounded-2xl shadow-xl animate-[bounce_4s_infinite]" style={{ animationDelay: '1s' }}>
                                <span className="material-symbols-outlined text-black-accent">all_inclusive</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Loading text - fixed centered below mandala, shown during loading */}
            <div ref={loadingTextRef} className="fixed z-[60] left-1/2 -translate-x-1/2 flex-col items-center gap-3 text-center" style={{ display: 'none' }}>
                <h3 className="text-2xl font-light tracking-[0.2em] text-black-accent animate-pulse">CONECTANDO</h3>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Interpretando vibraciones
                </p>
            </div>

            {/* Footer */}
            <footer ref={footerRef} className="px-6 md:px-12 py-4 md:py-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 relative z-10">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">© 2024 Numerología Moderna</p>
                <div className="flex gap-6 md:gap-8">
                    <a className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] hover:text-black-accent transition-colors" href="#">Privacidad</a>
                    <a className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] hover:text-black-accent transition-colors" href="#">Términos</a>
                </div>
            </footer>
        </main>
    );
}
