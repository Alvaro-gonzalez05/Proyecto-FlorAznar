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
};
