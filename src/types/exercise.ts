/**
 * Domain model shared by every language track. The engine never depends on a
 * specific language: it only knows about exercises, runners and run results.
 */

export type LanguageId = 'typescript' | 'java' | 'sql' | 'html' | 'css'

/** Difficulty: 1 = introduccion, 2 = practica, 3 = reto. */
export type Difficulty = 1 | 2 | 3

export interface TestCase {
  /** Texto que ve el alumno en la lista de resultados. */
  name: string
  /** Codigo de comprobacion, escrito en el lenguaje del ejercicio. */
  code: string
}

export interface Exercise {
  /** Identificador estable usado en la URL y en el progreso guardado. */
  id: string
  language: LanguageId
  title: string
  /** `project` = proyecto final que integra todo lo visto en la pista. */
  kind?: 'exercise' | 'project'
  difficulty: Difficulty
  /** Conceptos que se practican, para las etiquetas de la ficha. */
  concepts: string[]
  /** Teoria breve previa al enunciado (Markdown ligero). */
  theory: string
  /** Enunciado con lo que hay que implementar (Markdown ligero). */
  brief: string
  starterCode: string
  solution: string
  hints: string[]
  tests: TestCase[]
}

export interface Track {
  id: LanguageId
  name: string
  tagline: string
  description: string
  /** `soon` = pista planificada pero sin motor de ejecucion todavia. */
  status: 'ready' | 'soon'
  exercises: Exercise[]
}

export type TestStatus = 'pass' | 'fail' | 'error'

export interface TestResult {
  name: string
  status: TestStatus
  message?: string
}

export interface Diagnostic {
  /** `solution` = codigo del alumno; `tests` = el codigo no encaja con lo pedido. */
  origin: 'solution' | 'tests'
  severity: 'error' | 'warning'
  line: number
  column: number
  message: string
  /** Explicacion en castellano para los errores mas habituales. */
  hint?: string
}

export interface RunResult {
  /** true solo si no hay errores de compilacion y todos los tests pasan. */
  ok: boolean
  diagnostics: Diagnostic[]
  logs: string[]
  tests: TestResult[]
  /** Error que aborta la ejecucion entera (timeout, excepcion fuera de test...). */
  fatal?: string
  durationMs: number
}

/** Contrato que debe cumplir cada motor de lenguaje (local o remoto). */
export interface Runner {
  language: LanguageId
  run(exercise: Exercise, code: string): Promise<RunResult>
  /** Libera recursos (workers, conexiones) cuando se abandona la vista. */
  dispose(): void
}
