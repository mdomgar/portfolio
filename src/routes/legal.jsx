import LegalPage from '../components/LegalPage'
import { legalPages } from '../data/legal'
import { getPageSeo } from '../data/seo'
import { usePageScene } from '../hooks/usePageScene'
import { buildMeta } from '../lib/seo'

const PATH = '/aviso-legal'

export const meta = () => buildMeta({ path: PATH, ...getPageSeo(PATH) })

export default function Legal() {
  usePageScene('case')
  return <LegalPage page={legalPages.legal} />
}
