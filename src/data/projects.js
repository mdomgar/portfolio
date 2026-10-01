export const projects = [
  {
    id: 'solarmetrics',
    title: 'SolarMetrics',
    tag: { es: 'Proyecto final de DAM', en: 'Final degree project' },
    summary: {
      es: 'Portal web para visualizar datos de medición fotovoltaica, con login y gestión de usuarios.',
      en: 'Web portal to visualise photovoltaic measurement data, with login and user management.',
    },
    problem: {
      es: 'Los datos de una instalación fotovoltaica son difíciles de interpretar cuando solo existen como series numéricas en una base de datos.',
      en: 'Photovoltaic installation data is hard to read when it only exists as raw time series in a database.',
    },
    solution: {
      es: 'El backend genera datos de medición simulados y los almacena en InfluxDB; el frontend en React consume la API y los muestra de forma dinámica, con sistema de login y gestión de usuarios.',
      en: 'The backend generates simulated measurements and stores them in InfluxDB; the React frontend consumes the API and renders them dynamically, with login and user management.',
    },
    stack: ['react', 'javascript', 'springboot', 'java', 'python', 'influxdb'],
    live: 'https://solarmetrics.vercel.app',
    github: 'https://github.com/mdomgar/SolarMetrics',
    logo: { src: '/img/solarmetrics-logo.webp', width: 256, height: 256 },
  },
]
