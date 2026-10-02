export const solarmetrics = {
  slug: 'solarmetrics',
  name: 'SolarMetrics',
  status: 'done',
  label: {
    es: 'Herramienta a medida · Proyecto de fin de grado',
    en: 'Custom tool · Final degree project',
  },
  tagline: {
    es: 'De series de números en una base de datos a un panel que se entiende de un vistazo.',
    en: 'From rows of numbers in a database to a dashboard you understand at a glance.',
  },
  highlight: {
    es: 'API propia que simula una instalación fotovoltaica en tiempo real',
    en: 'Custom API that simulates a photovoltaic plant in real time',
  },
  stats: [],
  stack: ['react', 'javascript', 'chartjs', 'springboot', 'java', 'python', 'influxdb'],
  links: { demo: 'https://solarmetrics.vercel.app', code: 'https://github.com/mdomgar/SolarMetrics' },
  logo: { src: '/img/solarmetrics-logo.webp', width: 256, height: 256 },
  preview: 'dashboard',
  challenge: {
    es: 'Los datos de una instalación fotovoltaica solo existían como series de números en una base de datos: difíciles de leer e imposibles de enseñar a alguien que no sea técnico.',
    en: 'The data from a photovoltaic plant only existed as series of numbers in a database: hard to read and impossible to show to anyone non-technical.',
  },
  built: {
    es: [
      'Una API propia que genera mediciones simuladas de una instalación fotovoltaica y las guarda en InfluxDB.',
      'Un panel en React que consume esa API: potencia, energía y curvas de producción por inversor.',
      'Inicio de sesión con roles (administrador y usuario), gestión de usuarios y gestión de dispositivos.',
    ],
    en: [
      'A custom API that generates simulated measurements from a photovoltaic plant and stores them in InfluxDB.',
      'A React dashboard that consumes that API: power, energy and production curves per inverter.',
      'Login with roles (administrator and user), user management and device management.',
    ],
  },
  decisions: [
    {
      title: { es: 'InfluxDB para las mediciones', en: 'InfluxDB for the measurements' },
      why: {
        es: 'Es una base de datos pensada para series temporales: guardar y consultar lecturas por fecha es su trabajo, no un apaño.',
        en: 'It is a database built for time series: storing and querying readings by date is its job, not a workaround.',
      },
    },
    {
      title: { es: 'Una API que simula la instalación', en: 'An API that simulates the plant' },
      why: {
        es: 'Sin hardware real disponible, simular las lecturas permitió desarrollar y probar el panel como si estuviera conectado a una planta de verdad.',
        en: 'With no real hardware available, simulating the readings made it possible to build and test the dashboard as if it were connected to a real plant.',
      },
    },
    {
      title: { es: 'Usuarios, roles y dispositivos', en: 'Users, roles and devices' },
      why: {
        es: 'Cada usuario ve solo los dispositivos que tiene asignados, y el administrador decide quién ve qué.',
        en: 'Each user only sees the devices assigned to them, and the administrator decides who sees what.',
      },
    },
  ],
  result: {
    es: 'Proyecto de fin de grado del ciclo de DAM, entregado, con una demo pública que funciona con datos simulados.',
    en: 'Final project of my multiplatform development degree, delivered, with a public demo running on simulated data.',
  },
  next: {
    es: 'Conectarlo a una instalación real en lugar de la API simulada y avisar cuando un inversor rinda por debajo de lo esperado.',
    en: 'Connect it to a real plant instead of the simulated API and send an alert when an inverter underperforms.',
  },
}
