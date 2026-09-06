/**
 * Domain model shared by every language track. The engine never depends on a
 * specific language: it only knows about exercises, runners and run results.
 */

export type LanguageId = 'typescript' | 'docker' | 'sql' | 'java' | 'html' | 'css'

/** Difficulty: 1 = introduccion, 2 = practica, 3 = reto. */
export type Difficulty = 1 | 2 | 3

export interface TestCase {
  /** Texto que ve el alumno en la lista de resultados. */
  name: string
  /** Codigo de comprobacion, o su descripcion cuando no se ejecuta codigo. */
  code: string
  /**
   * Comprobacion programatica para motores que analizan el texto en vez de
   * ejecutarlo (Docker). Devuelve el fallo, o null si la comprobacion pasa.
   */
  check?: (source: string) => string | null
}

interface QuizBase {
  /** Qué se pide, en una línea. */
  prompt: string
  /** Por qué es esa la respuesta. Se lee después de comprobar. */
  explanation: string
}

/** Rellenar un hueco escribiendo: el fragmento lleva ___ donde va la respuesta. */
export interface FillQuestion extends QuizBase {
  kind: 'fill'
  snippet: string
  /** Respuestas válidas; se comparan sin distinguir mayúsculas ni espacios. */
  answers: string[]
}

/** Elegir una opción entre varias. */
export interface ChoiceQuestion extends QuizBase {
  kind: 'choice'
  /** Código de apoyo sobre el que se pregunta (opcional). */
  snippet?: string
  options: string[]
  /** Índice de la opción correcta dentro de `options`. */
  correct: number
}

/** Arrastrar fichas a los huecos del fragmento (un ___ por hueco, en orden). */
export interface DragQuestion extends QuizBase {
  kind: 'drag'
  snippet: string
  /** Lo que va en cada hueco, en el mismo orden que aparecen. */
  blanks: string[]
  /** Fichas ofrecidas: las de los huecos más algún distractor. */
  pool: string[]
}

/** Ordenar líneas sueltas hasta reconstruir el fragmento. */
export interface OrderQuestion extends QuizBase {
  kind: 'order'
  /** Líneas en el orden correcto; se barajan al mostrarlas. */
  lines: string[]
}

export type QuizQuestion = FillQuestion | ChoiceQuestion | DragQuestion | OrderQuestion

/** Respuesta del alumno. Su forma depende del tipo de pregunta. */
export type QuizAnswer = string | number | null | (number | null)[] | string[]

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
  /** Repaso rápido entre la teoría y el caso práctico. */
  quiz: QuizQuestion[]
  /** Nombre del fichero que se edita; decide el resaltado. Por defecto, el de la pista. */
  fileName?: string
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
