import type { Diagnostic } from '@/types/exercise'

/**
 * Small CSS parser: enough to assert on what the student declared, with line
 * numbers for the errors. No cascade, no specificity — the exercises check the
 * rules that were written, and the live preview shows the real result.
 */
export interface CssRule {
  /** Selectores del bloque, ya separados por coma y con los espacios normalizados. */
  selectors: string[]
  declarations: Record<string, string>
  /** Condición del @media que lo envuelve, si lo hay. */
  media?: string
  line: number
}

export interface CssSheet {
  rules: CssRule[]
  diagnostics: Diagnostic[]
}

function normalize(selector: string): string {
  return selector.replace(/\s+/g, ' ').trim()
}

function parseDeclarations(body: string, line: number, diagnostics: Diagnostic[]): Record<string, string> {
  const declarations: Record<string, string> = {}

  for (const piece of body.split(';')) {
    const text = piece.trim()
    if (text === '') continue

    const colon = text.indexOf(':')
    if (colon === -1) {
      diagnostics.push({
        origin: 'solution',
        severity: 'error',
        line,
        column: 1,
        message: `A la declaración "${text}" le faltan los dos puntos.`,
        hint: 'Cada declaración es propiedad: valor; y termina en punto y coma.',
      })
      continue
    }

    declarations[text.slice(0, colon).trim().toLowerCase()] = text.slice(colon + 1).trim()
  }

  return declarations
}

export function parseCss(source: string): CssSheet {
  // Los comentarios se sustituyen por espacios para no mover los números de línea.
  const clean = source.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '))
  const rules: CssRule[] = []
  const diagnostics: Diagnostic[] = []

  let index = 0
  let media: string | undefined

  const lineAt = (position: number) => clean.slice(0, position).split('\n').length

  while (index < clean.length) {
    const open = clean.indexOf('{', index)
    if (open === -1) {
      if (clean.slice(index).trim() !== '' && clean.slice(index).trim() !== '}') {
        diagnostics.push({
          origin: 'solution',
          severity: 'error',
          line: lineAt(index),
          column: 1,
          message: 'Hay una regla sin abrir la llave.',
        })
      }
      break
    }

    const head = clean.slice(index, open).replace(/^[\s}]+/, '').trim()
    const line = lineAt(open)

    if (head.startsWith('@media')) {
      // Se entra en el bloque: las reglas de dentro heredan la condición.
      media = head.slice('@media'.length).trim()
      index = open + 1
      continue
    }

    const close = clean.indexOf('}', open)
    if (close === -1) {
      diagnostics.push({
        origin: 'solution',
        severity: 'error',
        line,
        column: 1,
        message: `Falta la llave de cierre del bloque "${head}".`,
        hint: 'Cada bloque abre con { y cierra con }.',
      })
      break
    }

    if (head !== '') {
      rules.push({
        selectors: head.split(',').map(normalize).filter(Boolean),
        declarations: parseDeclarations(clean.slice(open + 1, close), line, diagnostics),
        media,
        line,
      })
    }

    index = close + 1
    // Si lo siguiente cierra el @media, se sale de él.
    const rest = clean.slice(index)
    if (media && /^\s*}/.test(rest)) {
      media = undefined
      index += rest.indexOf('}') + 1
    }
  }

  return { rules, diagnostics }
}

/**
 * Reglas cuyo selector coincide, comparando sin espacios de más. Por defecto
 * solo las de fuera de cualquier @media: si no, una regla dentro de una media
 * query pisaría a la base al preguntar por el valor declarado.
 */
export function rulesFor(sheet: CssSheet, selector: string, includeMedia = false): CssRule[] {
  const wanted = normalize(selector)
  return sheet.rules.filter(
    (rule) => rule.selectors.includes(wanted) && (includeMedia || rule.media === undefined),
  )
}

/** Valor declarado para una propiedad en un selector, mirando la última regla que gana. */
export function declaredValue(
  sheet: CssSheet,
  selector: string,
  property: string,
): string | undefined {
  const matching = rulesFor(sheet, selector)
  let value: string | undefined
  for (const rule of matching) {
    const declared = rule.declarations[property.toLowerCase()]
    if (declared !== undefined) value = declared
  }
  return value
}
