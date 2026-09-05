/// <reference lib="webworker" />
/**
 * In-browser TypeScript exercise runner.
 *
 * Lives in a worker so an infinite loop in the student's code can be killed by
 * terminating the thread. The actual compilation happens in `./core`, shared
 * with the test suite that verifies every bundled exercise.
 */
import type { RunResult } from '@/types/exercise'
import { compileAndRun } from './core'
import type { WorkerRequest, WorkerResponse } from './protocol'

/** El bundle de tipos pesa cientos de KB: se descarga una sola vez por worker. */
let libText: Promise<string> | null = null

function loadLib(): Promise<string> {
  if (!libText) {
    libText = fetch(`${import.meta.env.BASE_URL}ts-libs/lib.bundle.d.ts`).then((response) => {
      if (!response.ok) {
        throw new Error('No se pudo cargar la librería de tipos. Ejecuta "npm run prepare:libs".')
      }
      return response.text()
    })
  }
  return libText
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data
  let result: RunResult

  try {
    result = await compileAndRun(await loadLib(), request.code, request.tests)
  } catch (error) {
    result = {
      ok: false,
      diagnostics: [],
      logs: [],
      tests: [],
      fatal: error instanceof Error ? error.message : String(error),
      durationMs: 0,
    }
  }

  const response: WorkerResponse = { id: request.id, result }
  self.postMessage(response)
}
