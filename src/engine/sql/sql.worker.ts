/// <reference lib="webworker" />
/**
 * Runs exercise SQL in a worker: a runaway recursive query can be killed by
 * terminating the thread instead of freezing the page.
 */
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
import { runSql, setWasmLocation } from './core'

setWasmLocation(wasmUrl)
import type { SqlWorkerRequest, SqlWorkerResponse } from './protocol'

self.onmessage = async (event: MessageEvent<SqlWorkerRequest>) => {
  const request = event.data
  let response: SqlWorkerResponse

  try {
    response = { id: request.id, run: await runSql(request.setup, request.source, request.verify) }
  } catch (error) {
    response = {
      id: request.id,
      run: { diagnostics: [] },
      fatal: error instanceof Error ? error.message : String(error),
    }
  }

  self.postMessage(response)
}
