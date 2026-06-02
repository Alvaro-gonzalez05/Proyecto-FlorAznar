export interface LandingContent {
  hero: {
    badge: string;
    title: string;
    subtitle: string;
  };
  rap: {
    r_label: string;
    r_title: string;
    r_desc: string;
    a_label: string;
    a_title: string;
    a_desc: string;
    p_label: string;
    p_title: string;
    p_desc: string;
  };
  libro: {
    title: string;
    desc: string;
  };
  precio: {
    price: string;
    subtitle: string;
    note: string;
    quote: string;
  };
  cta: {
    title: string;
    subtitle: string;
  };
  about: {
    p1: string;
    p2: string;
    p3: string;
    p4: string;
  };
  mapa: {
    badge: string;
    title: string;
    title_bold: string;
    subtitle: string;
  };
  problema: {
    badge: string;
    heading: string;
    heading_bold: string;
    p1: string;
    p2: string;
    item1: string;
    item2: string;
    item3: string;
    item4: string;
    item5: string;
    quote: string;
    check_badge: string;
    check1: string;
    check2: string;
    check3: string;
    check4: string;
    check5: string;
    check6: string;
  };
  proceso: {
    badge: string;
    intro: string;
    p2: string;
    stat1_title: string;
    stat1_desc: string;
    stat2_title: string;
    stat2_desc: string;
  };
  incluye: {
    badge: string;
    title: string;
    title_accent: string;
    subtitle: string;
    c1_title: string;
    c1_desc: string;
    c2_title: string;
    c2_desc: string;
    c3_title: string;
    c3_desc: string;
    c4_title: string;
    c4_desc: string;
    c5_title: string;
    c5_desc: string;
    c6_title: string;
    c6_desc: string;
    c6_badge: string;
  };
  garantia: {
    badge: string;
    title: string;
    title_accent: string;
    p1: string;
    p2: string;
  };
  testimonios: {
    stat: string;
    stat_label: string;
    t1_text: string;
    t1_name: string;
    t1_role: string;
    t4_text: string;
    t4_name: string;
    t4_role: string;
    t5_text: string;
    t5_name: string;
    t5_role: string;
  };
}

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  hero: {
    badge: 'Evolución Consciente',
    title: 'Habita tu máximo potencial.',
    subtitle: 'Un espacio de autoconocimiento y dirección personal para quienes buscan entenderse, desbloquearse y avanzar con claridad.',
  },
  rap: {
    r_label: '✦ Revelar',
    r_title: 'Entendemos cómo estás funcionando hoy',
    r_desc: 'Miramos juntas qué patrones se repiten en tu vida, qué señales estás ignorando y qué te está frenando realmente. No la versión que contás — la que te pasa de verdad.',
    a_label: '✦ Avanzar',
    a_title: 'Entendemos por qué eso sigue pasando',
    a_desc: 'Profundizamos en el origen de esos bloqueos. Entendemos por qué se sostienen, qué función cumplen y cómo impactan en tu manera de decidir, relacionarte y moverte.',
    p_label: '✦ Potenciar',
    p_title: 'Trabajamos cómo salir de ese patrón',
    p_desc: 'Traducimos todo lo que entendiste en decisiones concretas y acciones reales. La idea es que no te quedes solo con el insight — sino que realmente puedas generar cambios.',
  },
  libro: {
    title: 'Volver al Origen',
    desc: 'Una guía práctica de autoconocimiento y transformación personal. Un libro para quienes quieren entenderse mejor, desbloquearse y empezar a construir una vida más alineada con quienes realmente son.',
  },
  precio: {
    price: '$100.000',
    subtitle: 'Proceso completo · 3 sesiones',
    note: 'Una vez que reserves, te escribo con todos los detalles.',
    quote: 'La idea no es solo hablar del problema.\nEs entenderte — y empezar a moverte.',
  },
  cta: {
    title: '¿Iniciamos la conversación?',
    subtitle: 'Toda evolución comienza con una sola pregunta. Contáctame para explorar cómo podemos trabajar juntos.',
  },
  about: {
    p1: 'Mi camino comenzó en el mundo del marketing. Soy Licenciada en Marketing y durante los años en los que ejercí mi profesión descubrí que lo que realmente me apasionaba era acompañar a las personas y ayudarlas a potenciarse para atravesar cualquier desafío.',
    p2: 'Ese descubrimiento me llevó a adentrarme en el mundo del coaching. Me formé en EDPyN Barcelona (España), institución avalada por la ICF – Level 2, realicé un Máster en Recursos Humanos y actualmente continúo mi formación estudiando Counseling (Consultoría Psicológica).',
    p3: 'A lo largo de este camino entendí algo fundamental: muchas veces las personas no avanzan en su vida no por falta de capacidad, sino porque no se conocen lo suficiente y terminan repitiendo patrones o creencias que las mantienen en el mismo lugar.',
    p4: 'Hoy mi trabajo está enfocado en ayudar a las personas a conocerse más profundamente, comprender qué les está pasando y encontrar claridad para avanzar en su vida.',
  },
  mapa: {
    badge: 'El Mapa',
    title: 'El Método RAP:',
    title_bold: 'Una Evolución Radical',
    subtitle: 'Un viaje estructurado desde la claridad interna hacia la manifestación externa, diseñado para líderes de alto impacto.',
  },
  problema: {
    badge: 'El problema',
    heading: 'Muchas veces el problema',
    heading_bold: 'no es la falta de capacidad.',
    p1: 'Es estar funcionando desde patrones mentales y emocionales que te hacen frenarte automáticamente cuando querés avanzar.',
    p2: 'Todos tenemos una manera de pensar, reaccionar y actuar. Y cuando no entendemos cómo funcionamos internamente, terminamos:',
    item1: 'procrastinando',
    item2: 'dudando constantemente de nosotros mismos',
    item3: 'perdiendo claridad',
    item4: 'dispersándonos',
    item5: 'o repitiendo las mismas situaciones una y otra vez',
    quote: 'No se trata de hacer más. Se trata de entender qué necesitás cambiar para empezar a avanzar de verdad.',
    check_badge: '¿Esto te pasa a vos?',
    check1: 'Sobrepensás tanto las decisiones que terminás paralizándote.',
    check2: 'Empezás motivado/a, pero después te cuesta sostener.',
    check3: 'Tenés muchas ideas, pero te dispersás fácilmente.',
    check4: 'Sentís que repetís siempre los mismos patrones.',
    check5: 'Probaste distintas formas de avanzar, pero seguís sintiéndote trabado/a.',
    check6: 'Hacés mucho, pero sentís que no avanzás realmente.',
  },
  proceso: {
    badge: '¿Cómo es el proceso?',
    intro: 'Un proceso de tres etapas diseñado para ayudarte a entender qué te frena y empezar a avanzar de verdad.',
    p2: 'No es un curso ni una lista de consejos. Es un acompañamiento personalizado donde trabajás directamente con lo que está pasando en tu vida hoy.',
    stat1_title: '30 días de proceso',
    stat1_desc: 'Con acompañamiento personalizado en cada etapa',
    stat2_title: '100% personalizado',
    stat2_desc: 'Adaptado a lo que hoy te está pasando a vos',
  },
  incluye: {
    badge: 'Qué incluye',
    title: 'Todo lo que necesitás para que el cambio',
    title_accent: 'se traduzca en tu vida real.',
    subtitle: 'El proceso está armado para que no te quedes solo en entenderte: trabajás, integrás y salís con herramientas concretas.',
    c1_title: '3 sesiones 1:1 personalizadas',
    c1_desc: 'Cada sesión está enfocada en una etapa específica del proceso y adaptada a lo que hoy te está pasando.',
    c2_title: 'Ejercicios entre sesiones',
    c2_desc: 'Después de cada encuentro recibís ejercicios concretos para integrar lo trabajado. Porque el cambio pasa en lo que hacés después.',
    c3_title: 'Acompañamiento directo',
    c3_desc: 'Canal de consultas personalizado de lunes a viernes de 9 a 17hs. Si algo surge o necesitás orientación, estoy disponible.',
    c4_title: 'Guía práctica con acciones concretas',
    c4_desc: 'Al finalizar recibís un análisis personalizado con anclajes para reconocer tus patrones y actuar diferente cuando aparezcan.',
    c5_title: 'Libro de acompañamiento',
    c5_desc: 'Un recurso con herramientas y ejercicios para que puedas seguir integrando el proceso de manera autónoma.',
    c6_title: 'Análisis previo a la primera sesión',
    c6_desc: 'Antes de arrancar hacemos un análisis inicial para que la primera sesión arranque con foco y sin tiempo perdido.',
    c6_badge: 'Incluido sin costo adicional',
  },
  garantia: {
    badge: 'Garantía',
    title: 'Tu inversión',
    title_accent: 'está protegida.',
    p1: 'Si al terminar el proceso sentís que seguís exactamente en el mismo punto y no lograste identificar con claridad qué patrones te estaban frenando, vas a tener 15 días extra de acompañamiento sin costo adicional.',
    p2: 'Porque si vos estás dispuesto/a a hacer el proceso, yo también estoy dispuesta a acompañarte hasta que algo real cambie.',
  },
  testimonios: {
    stat: '150+',
    stat_label: 'Historias transformadas',
    t1_text: 'Trabajar con Flor fue el catalizador que no sabía que necesitaba. El Método RAP me dio una estructura para entender mi propia ambición sin perder mi esencia.',
    t1_name: 'Elena Rodríguez',
    t1_role: 'CEO & Directora Creativa',
    t4_text: '[Testimonio escrito — agregá el texto real de esta persona]',
    t4_name: 'Nombre Apellido',
    t4_role: 'Descripción breve',
    t5_text: '[Testimonio escrito — agregá el texto real de esta persona]',
    t5_name: 'Nombre Apellido',
    t5_role: 'Descripción breve',
  },
};
