import type { Diagnostic, Exercise, RunResult, Runner, TestResult } from '@/types/exercise'
import { parseDockerfile } from '../docker/dockerfile'

function isYaml(fileName: string | undefined): boolean {
  return fileName !== undefined && (fileName.endsWith('.yml') || fileName.endsWith('.yaml'))
}

/** En YAML la indentacion es significativa y un tabulador es un error de sintaxis. */
function yamlDiagnostics(source: string): Diagnostic[] {
  return source
    .split('\n')
    .map((text, index) => ({ text, number: index + 1 }))
    .filter((entry) => /^ *\t/.test(entry.text))
    .map((entry) => ({
      origin: 'solution' as const,
      severity: 'error' as const,
      line: entry.number,
      column: 1,
      message: 'Hay un tabulador al principio de la linea.',
      hint: 'YAML no admite tabuladores: la indentacion se hace siempre con espacios.',
    }))
}

/**
 * Docker exercises are graded by reading the Dockerfile, not by running it:
 * no daemon is available in the browser. Each test carries a `check` that
 * inspects the parsed instructions and reports what is missing.
 */
export class DockerfileRunner implements Runner {
  readonly language = 'docker' as const

  async run(exercise: Exercise, code: string): Promise<RunResult> {
    const startedAt = Date.now()
    const diagnostics = isYaml(exercise.fileName) ? yamlDiagnostics(code) : parseDockerfile(code).diagnostics

    // Si el fichero ni siquiera se entiende, las comprobaciones sobran.
    if (diagnostics.some((diagnostic) => diagnostic.severity === 'error')) {
      return { ok: false, diagnostics, logs: [], tests: [], durationMs: Date.now() - startedAt }
    }

    const tests: TestResult[] = exercise.tests.map((test) => {
      if (!test.check) {
        return { name: test.name, status: 'error', message: 'Este ejercicio no trae comprobación.' }
      }
      const failure = test.check(code)
      return failure === null
        ? { name: test.name, status: 'pass' }
        : { name: test.name, status: 'fail', message: failure }
    })

    return {
      ok: tests.length > 0 && tests.every((test) => test.status === 'pass'),
      diagnostics,
      logs: [],
      tests,
      durationMs: Date.now() - startedAt,
    }
  }

  dispose(): void {
    // Nada que liberar: el análisis es síncrono y en el hilo principal.
  }
}
