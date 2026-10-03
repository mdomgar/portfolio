import { index, route } from '@react-router/dev/routes'
import { CASE_SLUGS } from './data/site.js'

export default [
  index('routes/home.jsx'),
  // One route per published case (same module, unique id) so unknown slugs fall through to the 404.
  ...CASE_SLUGS.map((slug) => route(`casos/${slug}`, 'routes/case.jsx', { id: `case-${slug}` })),
  route('*', 'routes/not-found.jsx'),
]
