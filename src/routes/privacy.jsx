import LegalPage from '../components/LegalPage'
import { legalPages } from '../data/legal'
import { getPageSeo } from '../data/seo'
import { usePageScene } from '../hooks/usePageScene'
import { buildMeta } from '../lib/seo'

const PATH = '/privacidad'

export const meta = () => buildMeta({ path: PATH, ...getPageSeo(PATH) })

export default function Privacy() {
  usePageScene('case')
  return <LegalPage page={legalPages.privacy} />
}
