import type { SqlRun } from './core'

/** El worker solo ejecuta: las comprobaciones son funciones y viven en el hilo principal. */
export interface SqlWorkerRequest {
  id: number
  setup: string
  source: string
  verify?: string
}

export interface SqlWorkerResponse {
  id: number
  run: SqlRun
  /** Error que impide siquiera ejecutar (esquema roto, WebAssembly no disponible). */
  fatal?: string
}
