import type { Exercise, RunResult, Runner } from '@/types/exercise'
import TypeScriptWorker from '../worker/typescript.worker?worker'
import type { WorkerRequest, WorkerResponse } from '../worker/protocol'

/** La primera ejecucion descarga y parsea lib.d.ts, por eso es mas lenta. */
const WARMUP_TIMEOUT_MS = 25_000
const EXECUTION_TIMEOUT_MS = 8_000

/**
 * Runs TypeScript exercises in a dedicated worker. A hung worker (infinite
 * loop) is terminated from the main thread and replaced on the next run.
 */
export class TypeScriptRunner implements Runner {
  readonly language = 'typescript' as const

  private worker: Worker | null = null
  private nextId = 1
  private warmedUp = false

  private ensureWorker(): Worker {
    if (!this.worker) this.worker = new TypeScriptWorker()
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
        // El worker esta bloqueado: no responde a mensajes, hay que matarlo.
        this.dispose()
        finish(
          this.failure(
            'La ejecución tardó demasiado y se detuvo. Suele ser un bucle infinito: revisa las condiciones de tus while y for.',
            Date.now() - startedAt,
          ),
        )
      }, timeoutMs)

      const onMessage = (event: MessageEvent<WorkerResponse>) => {
        if (event.data.id !== id) return
        this.warmedUp = true
        finish(event.data.result)
      }

      const onError = (event: ErrorEvent) => {
        this.dispose()
        finish(this.failure(event.message || 'Error interno del motor.', Date.now() - startedAt))
      }

      worker.addEventListener('message', onMessage)
      worker.addEventListener('error', onError)

      const request: WorkerRequest = { id, code, tests: exercise.tests }
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
