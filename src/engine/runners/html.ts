import type { Exercise, RunResult, Runner, TestResult } from '@/types/exercise'

/**
 * Parses the student's HTML and runs the exercise assertions against the
 * resulting document. No worker: parsing cannot hang, and the checks need a
 * real `Document`, which does not survive the worker boundary.
 */
export class HtmlRunner implements Runner {
  readonly language = 'html' as const

  async run(exercise: Exercise, code: string): Promise<RunResult> {
    const startedAt = Date.now()
    const document = new DOMParser().parseFromString(code, 'text/html')

    const tests: TestResult[] = exercise.tests.map((test) => {
      if (!test.check) {
        return { name: test.name, status: 'error', message: 'Este ejercicio no trae comprobación.' }
      }
      const failure = test.check(code, document)
      return failure === null
        ? { name: test.name, status: 'pass' }
        : { name: test.name, status: 'fail', message: failure }
    })

    return {
      ok: tests.length > 0 && tests.every((test) => test.status === 'pass'),
      diagnostics: [],
      logs: [],
      tests,
      durationMs: Date.now() - startedAt,
    }
  }

  dispose(): void {
    // El análisis es síncrono: no hay nada que liberar.
  }
}
