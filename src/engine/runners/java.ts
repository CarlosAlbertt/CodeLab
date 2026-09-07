import type { Diagnostic, Exercise, RunResult, Runner, TestResult, TestStatus } from '@/types/exercise'

/** El servicio local se puede mover con VITE_JAVA_RUNNER_URL. */
const BASE_URL = import.meta.env.VITE_JAVA_RUNNER_URL ?? 'http://localhost:8099'
const TIMEOUT_MS = 25_000

const ARRANQUE =
  'El servicio de Java no responde. Ábrete una terminal en la carpeta del proyecto y ejecuta:  java backend/CodeLabServer.java  (necesitas un JDK 21 o superior). Déjala abierta mientras practicas.'

/** Traducción de los mensajes de javac que más se repiten al empezar. */
const PISTAS: { patron: RegExp; pista: string }[] = [
  { patron: /';' expected/, pista: 'Falta un punto y coma al final de la sentencia.' },
  { patron: /cannot find symbol/, pista: 'Ese nombre no existe: revisa cómo lo has escrito o si te falta declararlo.' },
  { patron: /incompatible types/, pista: 'El tipo del valor no encaja con el que declaraste.' },
  { patron: /missing return statement/, pista: 'Hay algún camino de la función que no llega a ningún return.' },
  { patron: /class .* is public, should be declared in a file named/, pista: 'La clase pública tiene que llamarse como pide el enunciado.' },
  { patron: /variable .* might not have been initialized/, pista: 'Se usa una variable a la que todavía no se le ha dado valor.' },
  { patron: /unreported exception/, pista: 'Esa llamada puede lanzar una excepción comprobada: hay que capturarla o declararla con throws.' },
]

interface RespuestaServicio {
  diagnostics?: { origin?: string; severity?: string; line?: number; column?: number; message?: string }[]
  tests?: { status?: string; name?: string; message?: string }[]
  logs?: string[]
  fatal?: string
}

/**
 * Talks to the local compile-and-run service. Everything else in the app runs
 * in the browser; Java needs a JDK, so this is the only track that depends on
 * something arrancado a mano.
 */
export class JavaRunner implements Runner {
  readonly language = 'java' as const

  private aborto: AbortController | null = null

  async run(exercise: Exercise, code: string): Promise<RunResult> {
    const startedAt = Date.now()
    this.aborto = new AbortController()
    const temporizador = setTimeout(() => this.aborto?.abort(), TIMEOUT_MS)

    try {
      const respuesta = await fetch(`${BASE_URL}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: this.aborto.signal,
        body: JSON.stringify({
          source: code,
          tests: exercise.tests.map((test) => ({ name: test.name, code: test.code })),
        }),
      })

      if (!respuesta.ok) {
        return this.fallo(`El servicio respondió ${respuesta.status}.`, Date.now() - startedAt)
      }

      const datos = (await respuesta.json()) as RespuestaServicio
      const diagnostics = (datos.diagnostics ?? []).map(toDiagnostic)
      const tests = (datos.tests ?? []).map(toTestResult)

      return {
        ok: !datos.fatal && diagnostics.every((d) => d.severity !== 'error') && tests.length > 0 &&
          tests.every((test) => test.status === 'pass'),
        diagnostics,
        logs: datos.logs ?? [],
        tests,
        fatal: datos.fatal,
        durationMs: Date.now() - startedAt,
      }
    } catch {
      // Un fetch fallido aquí casi siempre significa que el servicio no está.
      return this.fallo(ARRANQUE, Date.now() - startedAt)
    } finally {
      clearTimeout(temporizador)
      this.aborto = null
    }
  }

  dispose(): void {
    this.aborto?.abort()
    this.aborto = null
  }

  private fallo(fatal: string, durationMs: number): RunResult {
    return { ok: false, diagnostics: [], logs: [], tests: [], fatal, durationMs }
  }
}

function toDiagnostic(bruto: NonNullable<RespuestaServicio['diagnostics']>[number]): Diagnostic {
  const message = bruto.message ?? ''
  return {
    origin: bruto.origin === 'tests' ? 'tests' : 'solution',
    severity: bruto.severity === 'warning' ? 'warning' : 'error',
    line: bruto.line ?? 1,
    column: bruto.column ?? 1,
    message,
    hint: PISTAS.find((entrada) => entrada.patron.test(message))?.pista,
  }
}

function toTestResult(bruto: NonNullable<RespuestaServicio['tests']>[number]): TestResult {
  const status: TestStatus =
    bruto.status === 'pass' ? 'pass' : bruto.status === 'fail' ? 'fail' : 'error'
  return {
    name: bruto.name ?? '',
    status,
    message: bruto.message ? bruto.message : undefined,
  }
}
