import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './markdown'

describe('renderMarkdown', () => {
  it('escapa el HTML del contenido', () => {
    expect(renderMarkdown('<img src=x onerror=alert(1)>')).not.toContain('<img')
  })

  it('convierte encabezados, listas y negrita', () => {
    const html = renderMarkdown('## Titulo\n\n- uno\n- dos\n\nTexto **fuerte**')
    expect(html).toContain('<h3>Titulo</h3>')
    expect(html).toContain('<li>uno</li>')
    expect(html).toContain('<strong>fuerte</strong>')
  })

  it('respeta los bloques de código sin interpretar su contenido', () => {
    const html = renderMarkdown('~~~ts\nconst a: number = 1\n~~~')
    expect(html).toContain('<pre><code class="language-ts">const a: number = 1</code></pre>')
  })
})
