import { sameRow, showRow, type SqlResult, type SqlValue } from './result'

/** Devuelve el fallo, o null si la comprobación pasa. */
export type SqlCheck = (source: string, output?: unknown) => string | null

function asResult(output: unknown): SqlResult | null {
  return output && typeof output === 'object' && 'columns' in output ? (output as SqlResult) : null
}

/**
 * Assertion helpers for SQL exercises. Every message says what was expected and
 * what came back, so a wrong query points at its own mistake.
 */
export function returnsColumns(...names: string[]): SqlCheck {
  return (_source, output) => {
    const result = asResult(output)
    if (!result) return 'La consulta no ha devuelto ninguna fila ni columna.'

    const got = result.columns.map((column) => column.toLowerCase())
    const want = names.map((name) => name.toLowerCase())
    if (got.length !== want.length) {
      return `Esperaba ${want.length} columnas (${names.join(', ')}) y han llegado ${got.length}: ${result.columns.join(', ')}.`
    }
    const wrong = want.findIndex((name, index) => name !== got[index])
    return wrong === -1
      ? null
      : `La columna ${wrong + 1} debería llamarse ${names[wrong]} y se llama ${result.columns[wrong]}. Usa AS para ponerle nombre.`
  }
}

export function returnsRowCount(count: number): SqlCheck {
  return (_source, output) => {
    const result = asResult(output)
    if (!result) return count === 0 ? null : 'La consulta no ha devuelto ninguna fila.'
    return result.rows.length === count
      ? null
      : `Esperaba ${count} fila${count === 1 ? '' : 's'} y han llegado ${result.rows.length}.`
  }
}

/** Las filas exactas. Con `ordered`, además en ese orden. */
export function returnsRows(expected: SqlValue[][], options?: { ordered?: boolean }): SqlCheck {
  const ordered = options?.ordered ?? false

  return (_source, output) => {
    const result = asResult(output)
    if (!result) return 'La consulta no ha devuelto ninguna fila.'
    if (result.rows.length !== expected.length) {
      return `Esperaba ${expected.length} fila${expected.length === 1 ? '' : 's'} y han llegado ${result.rows.length}.`
    }

    if (ordered) {
      const wrong = expected.findIndex((row, index) => !sameRow(row, result.rows[index] ?? []))
      return wrong === -1
        ? null
        : `La fila ${wrong + 1} debería ser ${showRow(expected[wrong]!)} y es ${showRow(result.rows[wrong] ?? [])}. Revisa el ORDER BY.`
    }

    // Sin ORDER BY el orden no está garantizado: se compara como conjunto.
    const pending = [...result.rows]
    for (const row of expected) {
      const index = pending.findIndex((candidate) => sameRow(row, candidate))
      if (index === -1) return `Falta la fila ${showRow(row)} en el resultado.`
      pending.splice(index, 1)
    }
    return pending.length === 0 ? null : `Sobra la fila ${showRow(pending[0]!)} en el resultado.`
  }
}

/** Obliga a resolverlo con una construcción concreta (JOIN, GROUP BY...). */
export function usesSql(pattern: RegExp, hint: string): SqlCheck {
  return (source) => (pattern.test(source) ? null : hint)
}

/** Prohíbe un atajo que se salta lo que se está practicando. */
export function avoidsSql(pattern: RegExp, hint: string): SqlCheck {
  return (source) => (pattern.test(source) ? hint : null)
}
