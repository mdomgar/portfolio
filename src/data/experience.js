export const experience = [
  {
    id: 'macrosad',
    role: { es: 'Web Developer', en: 'Web Developer' },
    company: 'Macrosad',
    shortName: 'Macrosad',
    location: 'Jaén',
    start: '2025-12',
    end: null,
    period: { es: 'Diciembre 2025 – Actualidad', en: 'December 2025 – Present' },
    tasks: {
      es: [
        'Desarrollo de aplicaciones empresariales con Node.js y React.',
        'Testeo y consumo de APIs RESTful.',
      ],
      en: ['Building enterprise applications with Node.js and React.', 'Testing and consuming RESTful APIs.'],
    },
  },
  {
    id: 'grupo-avanza',
    role: { es: 'Técnico Auxiliar IT', en: 'IT Support Technician' },
    company: 'Grupo Avanza',
    shortName: 'Grupo Avanza',
    location: 'Jaén',
    start: '2023-03',
    end: '2024-08',
    period: { es: 'Marzo – Junio 2023 / Marzo – Agosto 2024', en: 'March – June 2023 / March – August 2024' },
    tasks: {
      es: [
        'Soporte técnico de hardware y software.',
        'Gestión de servidores Windows Server y Hetzner.',
        'Administración de redes y DNS.',
        'Gestión del servicio de ticketing y de las suites de Google y Microsoft.',
      ],
      en: [
        'Hardware and software technical support.',
        'Managing Windows Server and Hetzner servers.',
        'Network and DNS administration.',
        'Managing the ticketing service and the Google and Microsoft suites.',
      ],
    },
  },
  {
    id: 'intelec',
    role: { es: 'Desarrollador Full Stack y Odoo', en: 'Full Stack & Odoo Developer' },
    company: 'Intelec',
    shortName: 'Intelec',
    location: 'Jaén',
    start: '2024-03',
    end: '2024-06',
    period: { es: 'Marzo – Junio 2024', en: 'March – June 2024' },
    tasks: {
      es: [
        'Desarrollo con Java, Spring Boot y React, consumiendo APIs desarrolladas por mí mismo.',
        'Creación de módulos personalizados de Odoo en Python, probados en un entorno Docker.',
        'Gestión de modelos, vistas y lógica de negocio, y creación de portales para clientes y trabajadores.',
      ],
      en: [
        'Development with Java, Spring Boot and React, consuming APIs I built myself.',
        'Custom Odoo modules in Python, tested in a Docker environment.',
        'Models, views and business logic, plus client and employee portals.',
      ],
    },
  },
  {
    id: 'mecaofi',
    role: { es: 'Técnico Informático', en: 'IT Technician' },
    company: 'Mecaofi Jaén 1992',
    shortName: 'Mecaofi',
    location: 'Jaén',
    start: '2023-11',
    end: '2024-02',
    period: { es: 'Noviembre 2023 – Febrero 2024', en: 'November 2023 – February 2024' },
    tasks: {
      es: [
        'Mantenimiento de la infraestructura informática en centros educativos.',
        'Reparación de equipos y resolución de incidencias.',
      ],
      en: ['Maintaining IT infrastructure in schools.', 'Hardware repair and incident resolution.'],
    },
  },
]

// Order of the "Quién soy" journey (spec §4.5): support → ERP → current job.
export const JOURNEY_IDS = ['mecaofi', 'grupo-avanza', 'intelec', 'macrosad']
