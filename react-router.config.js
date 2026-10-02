import { copyFile } from 'node:fs/promises'
import path from 'node:path'
import { NOT_FOUND_PATH, PRERENDER_PATHS } from './src/data/site.js'

export default {
  appDirectory: 'src',
  ssr: false,
  prerender: PRERENDER_PATHS,
  async buildEnd({ viteConfig, reactRouterConfig }) {
    const clientDir = path.resolve(viteConfig.root, reactRouterConfig.buildDirectory, 'client')
    // Vercel serves /404.html with a 404 status for any unknown URL.
    await copyFile(path.join(clientDir, NOT_FOUND_PATH.slice(1), 'index.html'), path.join(clientDir, '404.html'))
  },
}
