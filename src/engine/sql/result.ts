/** Filas devueltas por una consulta, en el formato que usan los ejercicios. */
export type SqlValue = string | number | Uint8Array | null

export interface SqlResult {
  columns: string[]
  rows: SqlValue[][]
}

/** Representación legible de un valor para los mensajes de error. */
export function showValue(value: SqlValue): string {
  if (value === null) return 'NULL'
  if (typeof value === 'string') return `'${value}'`
  if (value instanceof Uint8Array) return '<binario>'
  return String(value)
}

export function showRow(row: SqlValue[]): string {
  return `(${row.map(showValue).join(', ')})`
}

/** Compara dos valores tolerando el desajuste típico entre 3 y 3.0. */
export function sameValue(a: SqlValue, b: SqlValue): boolean {
  if (a === null || b === null) return a === b
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < 1e-9
  return String(a) === String(b)
}

export function sameRow(a: SqlValue[], b: SqlValue[]): boolean {
  return a.length === b.length && a.every((value, index) => sameValue(value, b[index]!))
}
