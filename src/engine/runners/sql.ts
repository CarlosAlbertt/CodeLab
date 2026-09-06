import type { Exercise, RunResult, Runner, TestResult } from '@/types/exercise'
import SqlWorker from '../sql/sql.worker?worker'
import type { SqlWorkerRequest, SqlWorkerResponse } from '../sql/protocol'

/** La primera ejecución descarga y compila el WebAssembly de SQLite. */
const WARMUP_TIMEOUT_MS = 25_000
const EXECUTION_TIMEOUT_MS = 8_000

/**
 * Runs SQL exercises against an in-memory SQLite database inside a worker.
 * The worker only executes; the per-exercise assertions run here, because they
 * are functions and cannot cross the worker boundary.
 */
export class SqlRunner implements Runner {
  readonly language = 'sql' as const

  private worker: Worker | null = null
  private nextId = 1
  private warmedUp = false

  private ensureWorker(): Worker {
    if (!this.worker) this.worker = new SqlWorker()
    return this.worker
  }

  run(exercise: Exercise, code: string): Promise<RunResult> {
    const worker = this.ensureWorker()
    const id = this.nextId++
    const timeoutMs = this.warmedUp ? EXECUTION_TIMEOUT_MS : WARMUP_TIMEOUT_MS
    const startedAt = Date.now()

    return new Promise<RunResult>((resolve) => {
      const finish = (result: RunResult) => {
        clearTimeout(timer)
        worker.removeEventListener('message', onMessage)
        worker.removeEventListener('error', onError)
        resolve(result)
      }

      const timer = setTimeout(() => {
        this.dispose()
        finish(
          this.failure(
            'La consulta tardó demasiado y se detuvo. Revisa si has escrito un JOIN sin condición o una consulta recursiva sin fin.',
            Date.now() - startedAt,
          ),
        )
      }, timeoutMs)

      const onMessage = (event: MessageEvent<SqlWorkerResponse>) => {
        if (event.data.id !== id) return
        this.warmedUp = true

        const { run, fatal } = event.data
        if (fatal) {
          finish(this.failure(fatal, Date.now() - startedAt))
          return
        }

        // Si la consulta ni siquiera se ejecuta, los tests no dicen nada útil.
        if (run.diagnostics.some((diagnostic) => diagnostic.severity === 'error')) {
          finish({
            ok: false,
            diagnostics: run.diagnostics,
            logs: [],
            tests: [],
            durationMs: Date.now() - startedAt,
          })
          return
        }

        const tests: TestResult[] = exercise.tests.map((test) => {
          if (!test.check) {
            return { name: test.name, status: 'error', message: 'Este ejercicio no trae comprobación.' }
          }
          const failure = test.check(code, run.result)
          return failure === null
            ? { name: test.name, status: 'pass' }
            : { name: test.name, status: 'fail', message: failure }
        })

        finish({
          ok: tests.length > 0 && tests.every((test) => test.status === 'pass'),
          diagnostics: run.diagnostics,
          logs: [],
          tests,
          durationMs: Date.now() - startedAt,
        })
      }

      const onError = (event: ErrorEvent) => {
        this.dispose()
        finish(this.failure(event.message || 'Error interno del motor de SQL.', Date.now() - startedAt))
      }

      worker.addEventListener('message', onMessage)
      worker.addEventListener('error', onError)

      const request: SqlWorkerRequest = {
        id,
        setup: exercise.setup ?? '',
        source: code,
        verify: exercise.verify,
      }
      worker.postMessage(request)
    })
  }

  dispose(): void {
    this.worker?.terminate()
    this.worker = null
    this.warmedUp = false
  }

  private failure(fatal: string, durationMs: number): RunResult {
    return { ok: false, diagnostics: [], logs: [], tests: [], fatal, durationMs }
  }
}
