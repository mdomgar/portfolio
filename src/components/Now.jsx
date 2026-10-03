import { now } from '../data/now'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import { formatMonthYear } from '../lib/format'
import Reveal from './Reveal'
import './css/Now.css'

export default function Now() {
  const lang = useLang()
  const t = useT()

  return (
    <section id="ahora" className="section now" aria-labelledby="ahora-title">
      <div className="container">
        <Reveal className="card now-card">
          <header className="now-head">
            <h2 id="ahora-title">{t('nowTitle')}</h2>
            <p className="now-updated mono">
              {t('nowUpdated')} <time dateTime={now.updated}>{formatMonthYear(now.updated, lang)}</time>
            </p>
          </header>
          <ul className="now-list">
            {now.items.map((item) => (
              <li key={item.id}>
                <strong>{localize(item.label, lang)}</strong> {localize(item.text, lang)}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
