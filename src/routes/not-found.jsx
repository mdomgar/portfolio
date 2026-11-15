import { Link } from 'react-router'
import { useT } from '../i18n/useLang'
import { getPageSeo } from '../data/seo'
import { NOT_FOUND_PATH } from '../data/site'
import { buildMeta } from '../lib/seo'

export const meta = () => buildMeta({ path: NOT_FOUND_PATH, ...getPageSeo(NOT_FOUND_PATH) })

export default function NotFound() {
  const t = useT()
  return (
    <section className="section page-simple" aria-labelledby="not-found-title">
      <div className="container">
        <p className="section-eyebrow" aria-hidden="true">
          404
        </p>
        <h1 id="not-found-title">{t('notFoundTitle')}</h1>
        <p>{t('notFoundText')}</p>
        <Link className="btn btn-primary" to="/">
          {t('backHome')}
        </Link>
      </div>
    </section>
  )
}
