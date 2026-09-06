import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js'
import type { Diagnostic } from '@/types/exercise'
import type { SqlResult } from './result'

/**
 * Runs a student's SQL against an in-memory SQLite database. Shared by the
 * worker and the test suite, so both exercise the same engine.
 */
export interface SqlRun {
  /** Resultado de la última consulta con filas, o de `verify` si el ejercicio lo trae. */
  result?: SqlResult
  diagnostics: Diagnostic[]
}

let engine: Promise<SqlJsStatic> | null = null
let wasmLocation: string | undefined

/**
 * Where to find `sql-wasm.wasm`. The worker pasa la URL que emite Vite; los
 * tests pasan la ruta del fichero en node_modules. Asi el core no depende de
 * como se resuelvan los assets.
 */
export function setWasmLocation(location: string): void {
  wasmLocation = location
  engine = null
}

function load(): Promise<SqlJsStatic> {
  if (!engine) {
    engine = initSqlJs(wasmLocation ? { locateFile: () => wasmLocation! } : undefined)
  }
  return engine
}

/**
 * SQLite reports errors like `near "SELEC": syntax error` without a position.
 * Buscar el fragmento en el texto permite señalar la línea al alumno.
 */
function locate(source: string, message: string): { line: number; column: number } {
  const near = /near "([^"]+)"/.exec(message)
  const token = near?.[1]
  if (!token) return { line: 1, column: 1 }

  const index = source.toLowerCase().indexOf(token.toLowerCase())
  if (index === -1) return { line: 1, column: 1 }

  const before = source.slice(0, index)
  const line = before.split('\n').length
  const column = index - before.lastIndexOf('\n')
  return { line, column }
}

function toDiagnostic(source: string, error: unknown): Diagnostic {
  const message = error instanceof Error ? error.message : String(error)
  const { line, column } = locate(source, message)
  return {
    origin: 'solution',
    severity: 'error',
    line,
    column,
    message,
    hint: /no such table/i.test(message)
      ? 'Revisa el nombre de la tabla: el esquema del ejercicio está en el enunciado.'
      : /no such column/i.test(message)
        ? 'Esa columna no existe en las tablas que estás consultando.'
        : undefined,
  }
}

export async function runSql(
  setup: string,
  source: string,
  verify?: string,
): Promise<SqlRun> {
  const SQL = await load()
  const db: Database = new SQL.Database()

  try {
    // El esquema lo escribimos nosotros: si falla, es un error del ejercicio.
    if (setup.trim()) db.run(setup)
  } catch (error) {
    db.close()
    throw new Error(`El esquema del ejercicio no se pudo crear: ${String(error)}`)
  }

  try {
    const executed = db.exec(source)
    // Con verify, lo que se corrige es el estado de la base, no lo que devolvió el alumno.
    const relevant = verify ? db.exec(verify) : executed
    const last = relevant[relevant.length - 1]

    return {
      result: last ? { columns: last.columns, rows: last.values as SqlResult['rows'] } : undefined,
      diagnostics: [],
    }
  } catch (error) {
    return { diagnostics: [toDiagnostic(source, error)] }
  } finally {
    db.close()
  }
}
