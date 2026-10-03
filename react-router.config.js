import { copyFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { NOT_FOUND_PATH, PRERENDER_PATHS, PUBLIC_PATHS } from './src/data/site.js'
import { buildRobots, buildSitemap } from './src/lib/sitemap.js'

export default {
  appDirectory: 'src',
  ssr: false,
  prerender: PRERENDER_PATHS,
  async buildEnd({ viteConfig, reactRouterConfig }) {
    const clientDir = path.resolve(viteConfig.root, reactRouterConfig.buildDirectory, 'client')
    const siteUrl = viteConfig.env?.VITE_SITE_URL
    // Vercel serves /404.html with a 404 status for any unknown URL.
    await copyFile(path.join(clientDir, NOT_FOUND_PATH.slice(1), 'index.html'), path.join(clientDir, '404.html'))
    await writeFile(path.join(clientDir, 'sitemap.xml'), buildSitemap(siteUrl, PUBLIC_PATHS))
    await writeFile(path.join(clientDir, 'robots.txt'), buildRobots(siteUrl))
  },
}
