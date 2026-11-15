// Base text for phase A (spec §9). Miguel must review it before publishing.
export const legalPages = {
  legal: {
    path: '/aviso-legal',
    updated: '2026-10-01',
    title: { es: 'Aviso legal', en: 'Legal notice' },
    intro: {
      es: 'Datos del titular y condiciones de uso de esta web, según la Ley 34/2002 de servicios de la sociedad de la información (LSSI).',
      en: 'Owner details and terms of use of this website, under Spanish Law 34/2002 on information society services (LSSI).',
    },
    sections: [
      {
        id: 'owner',
        owner: true,
        title: { es: 'Titular', en: 'Owner' },
        body: { es: ['Esta web pertenece a:'], en: ['This website belongs to:'] },
      },
      {
        id: 'purpose',
        title: { es: 'Objeto', en: 'Purpose' },
        body: {
          es: ['Esta web presenta mis servicios de desarrollo web y mis proyectos, y permite contactar conmigo.'],
          en: ['This website presents my web development services and my projects, and lets you contact me.'],
        },
      },
      {
        id: 'use',
        title: { es: 'Condiciones de uso', en: 'Terms of use' },
        body: {
          es: ['Al navegar por la web aceptas usarla de buena fe. El contenido es informativo y puede cambiar sin previo aviso.'],
          en: ['By browsing this website you agree to use it in good faith. The content is informative and may change without notice.'],
        },
      },
      {
        id: 'ip',
        title: { es: 'Propiedad intelectual', en: 'Intellectual property' },
        body: {
          es: ['Los textos, el diseño, el código y las imágenes de esta web son míos salvo que se indique lo contrario. Las marcas y logotipos de terceros pertenecen a sus titulares.'],
          en: ['The texts, design, code and images of this website are mine unless stated otherwise. Third-party trademarks and logos belong to their owners.'],
        },
      },
      {
        id: 'links',
        title: { es: 'Enlaces externos', en: 'External links' },
        body: {
          es: ['Los enlaces a otras webs (GitHub, LinkedIn, demos) llevan a sitios que no controlo; no me hago responsable de su contenido.'],
          en: ['Links to other websites (GitHub, LinkedIn, demos) lead to sites I do not control; I am not responsible for their content.'],
        },
      },
      {
        id: 'law',
        title: { es: 'Legislación aplicable', en: 'Applicable law' },
        body: { es: ['Se aplica la legislación española.'], en: ['Spanish law applies.'] },
      },
    ],
  },
}
