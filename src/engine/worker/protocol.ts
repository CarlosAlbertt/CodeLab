import type { RunResult, TestCase } from '@/types/exercise'

/** Message sent from the runner to the TypeScript worker. */
export interface WorkerRequest {
  id: number
  code: string
  tests: TestCase[]
}

/** Message sent back once compilation and execution finish. */
export interface WorkerResponse {
  id: number
  result: RunResult
}
