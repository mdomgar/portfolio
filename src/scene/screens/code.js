export const CODE_LINES = [
  'const developer = {',
  "  name: 'Miguel Ángel',",
  "  role: 'Web Developer',",
  "  stack: ['React', 'Node.js', 'Spring Boot'],",
  "  basedIn: 'Jaén',",
  '  available: true,',
  '};',
  '',
  'export default developer;',
]

const COLORS = {
  keyword: '#7c5cff',
  string: '#ffb454',
  boolean: '#3ddc97',
  key: '#00e5ff',
  punct: '#8a93a6',
  plain: '#e8ecf4',
}

const TOKEN_RE = /('[^']*'?|\b(?:const|export|default|true|false)\b|[A-Za-z_]\w*(?=:)|[{}[\](),;:=.])/g
const TOTAL_CHARS = CODE_LINES.join('\n').length
const CHARS_PER_SECOND = 22
const HOLD_SECONDS = 4

function tokenType(text) {
  if (text.startsWith("'")) return 'string'
  if (/^(const|export|default)$/.test(text)) return 'keyword'
  if (/^(true|false)$/.test(text)) return 'boolean'
  if (/^[A-Za-z_]/.test(text)) return 'key'
  return 'punct'
}

export function tokenizeLine(line) {
  const tokens = []
  let last = 0
  for (const match of line.matchAll(TOKEN_RE)) {
    if (match.index > last) tokens.push({ text: line.slice(last, match.index), type: 'plain' })
    tokens.push({ text: match[0], type: tokenType(match[0]) })
    last = match.index + match[0].length
  }
  if (last < line.length) tokens.push({ text: line.slice(last), type: 'plain' })
  return tokens
}

export function typedLines(lines, chars) {
  const out = []
  let left = chars
  for (const line of lines) {
    if (left <= 0) break
    out.push(line.slice(0, left))
    left -= line.length + 1
  }
  return out
}

export function drawCode(ctx, time, width, height, complete = false) {
  const cycle = TOTAL_CHARS / CHARS_PER_SECOND + HOLD_SECONDS
  const chars = complete ? TOTAL_CHARS : Math.floor((time % cycle) * CHARS_PER_SECOND)

  ctx.fillStyle = '#0a0d16'
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = '#131722'
  ctx.fillRect(0, 0, width, 34)
  ctx.fillStyle = '#e8ecf4'
  ctx.font = '500 16px "JetBrains Mono", monospace'
  ctx.fillText('developer.js', 18, 23)

  ctx.font = '20px "JetBrains Mono", monospace'
  const lines = typedLines(CODE_LINES, chars)
  lines.forEach((line, index) => {
    const y = 70 + index * 30
    ctx.fillStyle = '#3a4256'
    ctx.fillText(String(index + 1).padStart(2, ' '), 18, y)
    let x = 64
    for (const token of tokenizeLine(line)) {
      ctx.fillStyle = COLORS[token.type]
      ctx.fillText(token.text, x, y)
      x += ctx.measureText(token.text).width
    }
    const isLast = index === lines.length - 1
    if (isLast && (complete || Math.floor(time * 2) % 2 === 0)) {
      ctx.fillStyle = '#00e5ff'
      ctx.fillRect(x + 2, y - 18, 10, 22)
    }
  })
}
