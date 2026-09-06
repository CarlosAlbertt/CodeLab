import { declaredValue, parseCss, rulesFor, type CssSheet } from './parse'

/** Devuelve el fallo, o null si la comprobación pasa. */
export type CssCheck = (source: string, output?: unknown) => string | null

function sheetOf(source: string, output: unknown): CssSheet {
  return output && typeof output === 'object' && 'rules' in output
    ? (output as CssSheet)
    : parseCss(source)
}

/**
 * Assertions for CSS exercises. Comprueban lo que el alumno ha declarado; la
 * vista previa se encarga de enseñar el resultado real.
 */
export function hasRule(selector: string, hint: string): CssCheck {
  return (source, output) => (rulesFor(sheetOf(source, output), selector).length > 0 ? null : hint)
}

/** La propiedad está declarada en ese selector, y su valor encaja. */
export function hasDeclaration(
  selector: string,
  property: string,
  expected: string | RegExp,
  hint: string,
): CssCheck {
  return (source, output) => {
    const value = declaredValue(sheetOf(source, output), selector, property)
    if (value === undefined) return hint
    const matches =
      expected instanceof RegExp
        ? expected.test(value)
        : value.toLowerCase().replace(/\s+/g, ' ') === expected.toLowerCase()
    return matches ? null : `${hint} (ahora vale "${value}")`
  }
}

/** Existe una media query cuya condición encaja con el patrón. */
export function hasMedia(pattern: RegExp, hint: string): CssCheck {
  return (source, output) => {
    const sheet = sheetOf(source, output)
    return sheet.rules.some((rule) => rule.media !== undefined && pattern.test(rule.media))
      ? null
      : hint
  }
}

/** Comprobación libre sobre la hoja ya interpretada. */
export function checkCss(fn: (sheet: CssSheet) => string | null): CssCheck {
  return (source, output) => fn(sheetOf(source, output))
}
