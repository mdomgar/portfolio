// Base text for phase A (spec §9). Miguel must review it before publishing.
export const legalPages = {
  privacy: {
    path: '/privacidad',
    updated: '2026-10-01',
    title: { es: 'Política de privacidad', en: 'Privacy policy' },
    intro: {
      es: 'Qué hago con los datos que me envías desde el formulario «Cuéntame tu proyecto».',
      en: 'What I do with the data you send me through the "Tell me about your project" form.',
    },
    sections: [
      {
        id: 'controller',
        title: { es: 'Responsable', en: 'Data controller' },
        body: {
          es: ['{holder}, {address}. Puedes escribirme a {email}.'],
          en: ['{holder}, {address}. You can write to me at {email}.'],
        },
      },
      {
        id: 'data',
        title: { es: 'Qué datos trato', en: 'What data I process' },
        body: {
          es: [
            'Los que escribes en el formulario: qué quieres construir, la descripción, las etiquetas que marques, el plazo, tu nombre, tu email y, si lo das, tu teléfono.',
          ],
          en: [
            'What you type in the form: what you want to build, the description, the tags you tick, the timeline, your name, your email and, if you give it, your phone number.',
          ],
        },
      },
      {
        id: 'purpose',
        title: { es: 'Para qué', en: 'Purpose' },
        body: {
          es: ['Solo para leer tu proyecto y responderte. No los uso para publicidad ni se los cedo a nadie para sus propios fines.'],
          en: ['Only to read about your project and reply to you. I do not use them for advertising or hand them to anyone for their own purposes.'],
        },
      },
      {
        id: 'basis',
        title: { es: 'Base legal', en: 'Legal basis' },
        body: {
          es: ['Tu consentimiento, que das al marcar la casilla antes de enviar el formulario. Puedes retirarlo cuando quieras escribiéndome.'],
          en: ['Your consent, which you give by ticking the box before sending the form. You can withdraw it at any time by writing to me.'],
        },
      },
      {
        id: 'retention',
        title: { es: 'Cuánto tiempo los guardo', en: 'How long I keep them' },
        body: {
          es: ['12 meses desde nuestro último contacto. Si acabamos trabajando juntos, conservaré lo necesario para el contrato durante los plazos que exija la ley.'],
          en: ['12 months from our last contact. If we end up working together, I will keep what the contract needs for as long as the law requires.'],
        },
      },
      {
        id: 'recipients',
        title: { es: 'Quién más los trata', en: 'Who else processes them' },
        body: {
          es: [
            'Resend, que me hace llegar por correo el contenido del formulario, como encargado del tratamiento.',
            'Vercel, que aloja esta web y ejecuta el envío del formulario.',
            'Ambas empresas están en Estados Unidos y tratan los datos con las garantías que exige el RGPD para las transferencias internacionales (cláusulas contractuales tipo o Marco de Privacidad de Datos UE-EE. UU.).',
          ],
          en: [
            'Resend, which delivers the content of the form to my inbox, as data processor.',
            'Vercel, which hosts this website and runs the form submission.',
            'Both companies are based in the United States and process the data with the safeguards the GDPR requires for international transfers (standard contractual clauses or the EU-US Data Privacy Framework).',
          ],
        },
      },
      {
        id: 'rights',
        title: { es: 'Tus derechos', en: 'Your rights' },
        body: {
          es: [
            'Puedes pedirme el acceso, la rectificación, la supresión, la oposición, la limitación o la portabilidad de tus datos escribiendo a {email}.',
            'Si crees que no los he tratado bien, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).',
          ],
          en: [
            'You can ask me for access, rectification, erasure, objection, restriction or portability of your data by writing to {email}.',
            'If you think I have not handled them properly, you can complain to the Spanish Data Protection Agency (aepd.es).',
          ],
        },
      },
      {
        id: 'storage',
        title: { es: 'Cookies y almacenamiento', en: 'Cookies and storage' },
        body: {
          es: [
            'Esta web no usa cookies ni analítica. Tu navegador guarda en sessionStorage el borrador del formulario y si ya has visto la animación de inicio; se borra al cerrar la pestaña y nunca sale de tu dispositivo.',
          ],
          en: [
            'This website uses no cookies and no analytics. Your browser keeps the form draft, and whether you have already seen the intro animation, in sessionStorage; it is deleted when you close the tab and never leaves your device.',
          ],
        },
      },
    ],
  },
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
