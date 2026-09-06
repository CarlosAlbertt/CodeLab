/**
 * Assertions for HTML exercises. They run against a parsed `Document`, so they
 * check the structure the browser actually builds, not the text the student
 * typed: sangría, comillas o el orden de los atributos dan igual.
 */
export type HtmlCheck = (source: string, output?: unknown) => string | null

function asDocument(output: unknown): Document | null {
  return output && typeof output === 'object' && 'querySelector' in output
    ? (output as Document)
    : null
}

function withDocument(fn: (doc: Document) => string | null): HtmlCheck {
  return (_source, output) => {
    const doc = asDocument(output)
    return doc ? fn(doc) : 'No se ha podido leer el HTML.'
  }
}

/** Existe al menos un elemento que encaje con el selector. */
export function hasElement(selector: string, hint: string): HtmlCheck {
  return withDocument((doc) => (doc.querySelector(selector) ? null : hint))
}

/** Hay exactamente `count` elementos. */
export function countElements(selector: string, count: number, hint: string): HtmlCheck {
  return withDocument((doc) => {
    const found = doc.querySelectorAll(selector).length
    return found === count ? null : `${hint} (encontrados: ${found})`
  })
}

/** El texto del primer elemento que encaje, comparado sin espacios de más. */
export function hasText(selector: string, expected: string, hint: string): HtmlCheck {
  return withDocument((doc) => {
    const element = doc.querySelector(selector)
    if (!element) return hint
    const text = (element.textContent ?? '').replace(/\s+/g, ' ').trim()
    return text === expected ? null : `${hint} (dice: "${text}")`
  })
}

/** Todos los elementos del selector cumplen la condición. */
export function everyElement(
  selector: string,
  condition: (element: Element) => boolean,
  hint: string,
): HtmlCheck {
  return withDocument((doc) => {
    const elements = [...doc.querySelectorAll(selector)]
    if (elements.length === 0) return hint
    return elements.every(condition) ? null : hint
  })
}

/** Un elemento está dentro de otro (por ejemplo, un h1 dentro del header). */
export function isInside(childSelector: string, parentSelector: string, hint: string): HtmlCheck {
  return withDocument((doc) =>
    doc.querySelector(`${parentSelector} ${childSelector}`) ? null : hint,
  )
}

/** Comprobación libre sobre el documento. */
export function checkHtml(fn: (doc: Document) => string | null): HtmlCheck {
  return withDocument(fn)
}
