/**
 * Minimal Markdown renderer for exercise theory and briefs.
 *
 * Supports headings, paragraphs, bullet and numbered lists, fenced code
 * blocks, bold and inline code. Everything is HTML-escaped before any
 * transformation, so exercise content can never inject markup into the page.
 */
const ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"]/g, (character) => ESCAPES[character]!)
}

function renderInline(text: string): string {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

const FENCE = /^(?:```|~~~)\s*(\w*)\s*$/

export function renderMarkdown(source: string): string {
  const lines = source.split('\n')
  const html: string[] = []

  let paragraph: string[] = []
  let list: string[] = []
  let listTag: 'ul' | 'ol' = 'ul'

  const flushParagraph = () => {
    if (paragraph.length === 0) return
    html.push(`<p>${renderInline(paragraph.join(' '))}</p>`)
    paragraph = []
  }

  const flushList = () => {
    if (list.length === 0) return
    const items = list.map((item) => `<li>${renderInline(item)}</li>`).join('')
    html.push(`<${listTag}>${items}</${listTag}>`)
    list = []
  }

  /** Un cambio de vinetas a numeros cierra la lista anterior y abre otra. */
  const pushListItem = (tag: 'ul' | 'ol', text: string) => {
    flushParagraph()
    if (list.length > 0 && listTag !== tag) flushList()
    listTag = tag
    list.push(text)
  }

  const flushAll = () => {
    flushParagraph()
    flushList()
  }

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]!
    const fence = FENCE.exec(line)

    if (fence) {
      flushAll()
      const code: string[] = []
      index++
      while (index < lines.length && !FENCE.test(lines[index]!)) {
        code.push(lines[index]!)
        index++
      }
      const language = fence[1] ? ` class="language-${fence[1]}"` : ''
      html.push(`<pre><code${language}>${escapeHtml(code.join('\n'))}</code></pre>`)
      continue
    }

    if (line.startsWith('## ')) {
      flushAll()
      html.push(`<h3>${renderInline(line.slice(3))}</h3>`)
      continue
    }

    if (/^[-*]\s+/.test(line)) {
      pushListItem('ul', line.replace(/^[-*]\s+/, ''))
      continue
    }

    if (/^\d+\.\s+/.test(line)) {
      pushListItem('ol', line.replace(/^\d+\.\s+/, ''))
      continue
    }

    if (line.trim() === '') {
      flushAll()
      continue
    }

    // Linea que continua la vineta anterior: se pega a ella en vez de romper la lista.
    if (list.length > 0) {
      list[list.length - 1] += ` ${line.trim()}`
      continue
    }

    paragraph.push(line.trim())
  }

  flushAll()
  return html.join('\n')
}
