import { useLocation, useOutletContext } from 'react-router'
import CaseStudy from '../components/CaseStudy'
import NotFound from './not-found'
import { getCase } from '../data/cases'
import { getPageSeo } from '../data/seo'
import { buildMeta } from '../lib/seo'

export const meta = ({ location }) => {
  const path = location.pathname.replace(/\/+$/, '')
  const seo = getPageSeo(path)
  return seo ? buildMeta({ path, ...seo, type: 'article' }) : []
}

export default function CasePage() {
  const { pathname } = useLocation()
  const { reducedMotion } = useOutletContext()
  const item = getCase(pathname.split('/').filter(Boolean).pop())
  // Defensive: routes.js only registers published slugs, so this is unreachable today.
  if (!item) return <NotFound />
  return <CaseStudy item={item} reducedMotion={reducedMotion} />
}
