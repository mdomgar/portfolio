import { education } from '../data/education'
import { localize } from '../data/localize'
import { useLang, useT } from '../i18n/useLang'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'
import './css/Education.css'

export default function Education() {
  const lang = useLang()
  const t = useT()

  return (
    <section id="education" className="section" aria-labelledby="education-title">
      <div className="container">
        <SectionHeading id="education-title" eyebrow="04" title={t('educationTitle')} />
        <Reveal as="ul" className="education-grid">
          {education.map((item) => (
            <li key={item.id} className="card education-card">
              <p className="education-period mono">{localize(item.period, lang)}</p>
              <h3>{localize(item.degree, lang)}</h3>
              <p className="education-place">{item.place}</p>
              <div className="education-footer">
                <p className="education-grade">{item.grade}</p>
                <p className="education-note">{localize(item.note, lang)}</p>
              </div>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
