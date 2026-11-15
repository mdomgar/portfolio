import { capabilities } from '../data/capabilities'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import './css/Today.css'

export default function Today() {
  const lang = useLang()
  const t = useT()

  return (
    <section id="hoy" className="section today on-ink" aria-labelledby="today-title">
      <div className="container">
        <h2 id="today-title" className="giant today-title" style={{ '--em': 8.4 }}>
          {t('todayTitle')}
        </h2>
        <ul className="today-list">
          {capabilities.map((capability, index) => (
            <li key={capability.id} className="today-item">
              <span className="today-index label" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="today-name">{localize(capability.title, lang)}</h3>
              <p className="today-proof">{localize(capability.proof, lang)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
