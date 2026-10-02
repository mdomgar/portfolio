// Test count is a floor: pgTAP plan() totals in Seenat's supabase/tests/database were 164+ on 2026-10-02.
// The site uses '160+' to avoid stale exact numbers as Miguel adds tests.
export const seenat = {
  slug: 'seenat',
  name: 'Seenat',
  status: 'in-progress',
  label: { es: 'App móvil · En desarrollo', en: 'Mobile app · In development' },
  tagline: {
    es: 'Conecta con quien coincidiste esa noche, sin revelar nunca dónde estuviste.',
    en: 'Connect with the people you crossed paths with that night, without ever revealing where you were.',
  },
  highlight: null,
  stats: [
    { id: 'tests', value: '160+', label: { es: 'pruebas automáticas en el backend', en: 'automated backend tests' } },
    { id: 'coordinates', value: '0', label: { es: 'coordenadas guardadas', en: 'coordinates stored' } },
  ],
  stack: ['flutter', 'dart', 'supabase', 'postgresql'],
  links: {},
  preview: 'seenat',
  challenge: {
    es: 'Coincides con alguien en una fiesta o un evento y te gustaría seguirle en Instagram, pero no te atreves a pedírselo o ya se ha ido. El reto es conectar a esas personas sin exponer nunca dónde está nadie.',
    en: "You cross paths with someone at a party or an event and you'd like to follow them on Instagram, but you don't dare ask or they've already left. The challenge is connecting those people without ever exposing where anyone is.",
  },
  built: {
    es: [
      'Una app en Flutter con backend en Supabase (región UE).',
      'Presencia por evento o por "burbuja": una celda fija de unos 200 m a la que te unes cuando no hay evento.',
      'Verificación de edad con selfie e Instagram verificado con un código temporal en la bio.',
      'Eventos con un QR que sirve como prueba de que estás allí.',
    ],
    en: [
      'A Flutter app with a Supabase backend (EU region).',
      'Presence per event or per "bubble": a fixed cell of about 200 m you join when there is no event.',
      'Age verification with a selfie, and Instagram verified with a temporary code in the bio.',
      'Events with a QR code that proves you are there.',
    ],
  },
  flow: {
    title: { es: 'Qué pasa con tu ubicación', en: 'What happens to your location' },
    steps: [
      {
        title: { es: 'Tu móvil', en: 'Your phone' },
        text: {
          es: 'Envía tu ubicación solo para saber a qué evento o burbuja perteneces.',
          en: 'Sends your location only to work out which event or bubble you belong to.',
        },
      },
      {
        title: { es: 'El servidor', en: 'The server' },
        text: {
          es: 'Decide el evento o la celda de unos 200 m y no guarda las coordenadas.',
          en: 'Picks the event or the ~200 m cell and does not store the coordinates.',
        },
      },
      {
        title: { es: 'Lo que ven los demás', en: 'What others see' },
        text: {
          es: 'Que coincidisteis en el mismo sitio. Nunca dónde, a qué distancia ni a qué hora exacta.',
          en: 'That you were at the same place. Never where, how far away or at what exact time.',
        },
      },
    ],
  },
  decisions: [
    {
      title: { es: 'No se guardan coordenadas', en: 'No coordinates are stored' },
      why: {
        es: 'La ubicación solo viaja del móvil al servidor para decidir a qué evento o burbuja perteneces; ninguna respuesta incluye coordenadas, distancias ni horas exactas de nadie.',
        en: "Location only travels from the phone to the server to decide which event or bubble you belong to; no response ever includes anyone's coordinates, distances or exact times.",
      },
    },
    {
      title: { es: 'Acceso solo por funciones RPC con RLS', en: 'Access only through RPC functions with RLS' },
      why: {
        es: 'Las tablas no se exponen: la app solo puede llamar a funciones concretas, y la seguridad a nivel de fila protege cada dato.',
        en: 'Tables are never exposed: the app can only call specific functions, and row-level security protects every record.',
      },
    },
    {
      title: { es: 'Nombres de lugar ocultos con menos de 5 personas', en: 'Place names hidden below 5 people' },
      why: {
        es: 'En una burbuja con poca gente, el nombre del sitio permitiría adivinar dónde está alguien; por debajo de 5 personas se muestra un genérico "cerca de ti".',
        en: 'In a bubble with few people, the place name would give away where someone is; below 5 people the app shows a generic "near you".',
      },
    },
    {
      title: { es: 'Límites de solicitudes', en: 'Request limits' },
      why: {
        es: 'Como máximo 50 solicitudes al día y 20 por evento, para que nadie use la app para insistir.',
        en: 'At most 50 requests a day and 20 per event, so nobody can use the app to pester people.',
      },
    },
  ],
  result: {
    es: 'El backend está terminado y cubierto con pruebas pgTAP de privacidad, presencia y conexiones. La app en Flutter tiene sus pantallas principales; ahora toca conectar la verificación de identidad y las notificaciones.',
    en: 'The backend is finished and covered by pgTAP tests for privacy, presence and connections. The Flutter app has its main screens; next comes wiring up identity verification and notifications.',
  },
  next: {
    es: 'Una beta cerrada en uno o dos locales antes de abrirla a más gente.',
    en: 'A closed beta in one or two venues before opening it up to more people.',
  },
  journal: [
    {
      date: '2026-09-30',
      text: {
        es: 'La página web de cada evento, a la que se llega desde el QR o un enlace, ya muestra el botón "Asistiré" correcto a quien la abre.',
        en: 'Each event web page, reached from the QR code or a link, now shows the right "I\'m going" button to whoever opens it.',
      },
    },
    {
      date: '2026-09-28',
      text: {
        es: 'Revisión del plan de la app: solo pueden usarla personas verificadas, y seguir tu presencia en segundo plano pide su propio consentimiento.',
        en: 'App plan review: only verified people can use it, and keeping your presence in the background asks for its own consent.',
      },
    },
    {
      date: '2026-09-27',
      text: {
        es: 'Diseño de la versión 1 y plan del backend. La privacidad es el producto: no se guardan coordenadas, selfies ni historial de ubicaciones.',
        en: 'Version 1 design and backend plan. Privacy is the product: no coordinates, selfies or location history are stored.',
      },
    },
  ],
}
