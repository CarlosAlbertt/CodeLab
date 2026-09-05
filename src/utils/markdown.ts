/**
 * Minimal Markdown renderer for exercise theory and briefs.
 *
 * Supports headings, paragraphs, bullet lists, fenced code blocks, bold and
 * inline code. Everything is HTML-escaped before any transformation, so
 * exercise content can never inject markup into the page.
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

  const flushParagraph = () => {
    if (paragraph.length === 0) return
    html.push(`<p>${renderInline(paragraph.join(' '))}</p>`)
    paragraph = []
  }

  const flushList = () => {
    if (list.length === 0) return
    html.push(`<ul>${list.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ul>`)
    list = []
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
      flushParagraph()
      list.push(line.replace(/^[-*]\s+/, ''))
      continue
    }

    if (line.trim() === '') {
      flushAll()
      continue
    }

    flushList()
    paragraph.push(line.trim())
  }

  flushAll()
  return html.join('\n')
}
