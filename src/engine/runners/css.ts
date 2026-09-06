import type { Exercise, RunResult, Runner, TestResult } from '@/types/exercise'
import { parseCss } from '../css/parse'

/**
 * Grades CSS exercises by reading the rules the student declared. The visual
 * result lives in the live preview next to the editor: comprobar el diseño
 * exacto exigiría medir la página renderizada, y eso no da mensajes de error
 * que enseñen nada.
 */
export class CssRunner implements Runner {
  readonly language = 'css' as const

  async run(exercise: Exercise, code: string): Promise<RunResult> {
    const startedAt = Date.now()
    const sheet = parseCss(code)

    if (sheet.diagnostics.some((diagnostic) => diagnostic.severity === 'error')) {
      return {
        ok: false,
        diagnostics: sheet.diagnostics,
        logs: [],
        tests: [],
        durationMs: Date.now() - startedAt,
      }
    }

    const tests: TestResult[] = exercise.tests.map((test) => {
      if (!test.check) {
        return { name: test.name, status: 'error', message: 'Este ejercicio no trae comprobación.' }
      }
      const failure = test.check(code, sheet)
      return failure === null
        ? { name: test.name, status: 'pass' }
        : { name: test.name, status: 'fail', message: failure }
    })

    return {
      ok: tests.length > 0 && tests.every((test) => test.status === 'pass'),
      diagnostics: sheet.diagnostics,
      logs: [],
      tests,
      durationMs: Date.now() - startedAt,
    }
  }

  dispose(): void {
    // Análisis síncrono: nada que liberar.
  }
}
