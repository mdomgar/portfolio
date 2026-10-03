import { useLocation, useOutletContext } from 'react-router'
import CaseStudy from '../components/CaseStudy'
import NotFound from './not-found'
import { getCase } from '../data/cases'
import { getPageSeo } from '../data/seo'
import { usePageScene } from '../hooks/usePageScene'
import { buildMeta } from '../lib/seo'

export const meta = ({ location }) => {
  const path = location.pathname.replace(/\/+$/, '')
  const seo = getPageSeo(path)
  return seo ? buildMeta({ path, ...seo, type: 'article' }) : []
}

export default function CasePage() {
  const { pathname } = useLocation()
  const { reducedMotion } = useOutletContext()
  usePageScene('case')
  const item = getCase(pathname.split('/').filter(Boolean).pop())
  if (!item) return <NotFound />
  return <CaseStudy item={item} reducedMotion={reducedMotion} />
}
