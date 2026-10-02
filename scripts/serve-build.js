// Serves build/client the way Vercel does: /path → path/index.html, unknown → 404.html with status 404.
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('../build/client/', import.meta.url))
const PORT = Number(process.env.PORT) || 4173
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

async function isFile(file) {
  try {
    return (await stat(file)).isFile()
  } catch {
    return false
  }
}

async function resolveFile(pathname) {
  const relative = path.normalize(decodeURIComponent(pathname)).replace(/^[/\\]+/, '')
  const target = path.join(ROOT, relative)
  if (!target.startsWith(ROOT)) return null
  for (const candidate of [target, path.join(target, 'index.html'), `${target}.html`]) {
    if (await isFile(candidate)) return candidate
  }
  return null
}

createServer(async (request, response) => {
  try {
    const { pathname } = new URL(request.url, 'http://localhost')
    const file = await resolveFile(pathname)
    const body = file ?? path.join(ROOT, '404.html')
    response.writeHead(file ? 200 : 404, { 'Content-Type': TYPES[path.extname(body)] ?? 'application/octet-stream' })
    createReadStream(body).pipe(response)
  } catch {
    response.writeHead(400).end()
  }
}).listen(PORT, () => {
  console.log(`build/client → http://localhost:${PORT}`)
})
