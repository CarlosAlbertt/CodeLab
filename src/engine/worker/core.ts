/**
 * Compile-and-run core, free of any DOM or worker API.
 *
 * The browser worker feeds it a lib bundle fetched over HTTP; the test suite
 * feeds it the same bundle read from disk. Both paths therefore exercise the
 * exact same compiler configuration a student sees.
 */
import ts from 'typescript'
import type { Diagnostic, RunResult, TestCase, TestResult } from '@/types/exercise'
import { HARNESS_DTS, RUNTIME_EPILOGUE, RUNTIME_PRELUDE, buildTestsSource } from './harness'
import { friendlyHint } from './diagnostics'

const LIB_FILE = 'lib.d.ts'
const HARNESS_FILE = '/harness.d.ts'
const SOLUTION_FILE = '/solution.ts'
const TESTS_FILE = '/tests.ts'

const COMPILER_OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2020,
  // El alumno escribe scripts sueltos, no modulos: nada de import/export.
  module: ts.ModuleKind.None,
  strict: true,
  noEmitOnError: false,
  skipLibCheck: true,
  forceConsistentCasingInFileNames: true,
}

/** Parsear 400 KB de lib.d.ts en cada ejecucion seria inaceptable: se cachea. */
let cachedLib: { text: string; sourceFile: ts.SourceFile } | null = null

function libSourceFile(
  text: string,
  languageVersion: ts.ScriptTarget | ts.CreateSourceFileOptions,
): ts.SourceFile {
  if (!cachedLib || cachedLib.text !== text) {
    cachedLib = { text, sourceFile: ts.createSourceFile(LIB_FILE, text, languageVersion, true) }
  }
  return cachedLib.sourceFile
}

function toDiagnostic(diagnostic: ts.Diagnostic): Diagnostic | null {
  const file = diagnostic.file
  if (!file) return null

  const origin =
    file.fileName === SOLUTION_FILE ? 'solution' : file.fileName === TESTS_FILE ? 'tests' : null
  if (!origin) return null

  const { line, character } = file.getLineAndCharacterOfPosition(diagnostic.start ?? 0)
  return {
    origin,
    severity: diagnostic.category === ts.DiagnosticCategory.Error ? 'error' : 'warning',
    line: line + 1,
    column: character + 1,
    message: ts.flattenDiagnosticMessageText(diagnostic.messageText, ' '),
    hint: friendlyHint(diagnostic.code),
  }
}

function createHost(sources: Map<string, string>, emitted: Map<string, string>): ts.CompilerHost {
  return {
    fileExists: (fileName) => sources.has(fileName),
    readFile: (fileName) => sources.get(fileName),
    getSourceFile: (fileName, languageVersion) => {
      if (fileName === LIB_FILE) return libSourceFile(sources.get(fileName)!, languageVersion)
      const text = sources.get(fileName)
      return text === undefined
        ? undefined
        : ts.createSourceFile(fileName, text, languageVersion, true)
    },
    getDefaultLibFileName: () => LIB_FILE,
    writeFile: (fileName, text) => emitted.set(fileName, text),
    getCurrentDirectory: () => '/',
    getCanonicalFileName: (fileName) => fileName,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
  }
}

/**
 * A missing declaration produces one error per test that uses it. The line
 * numbers point at generated code the student never sees, so only the first
 * occurrence of each message is kept.
 */
function dedupeTestDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
  const seen = new Set<string>()

  return diagnostics.filter((diagnostic) => {
    if (diagnostic.origin !== 'tests') return true
    if (seen.has(diagnostic.message)) return false
    seen.add(diagnostic.message)
    return true
  })
}

/** Se ejecuta como funcion asincrona para que los tests puedan usar await. */
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
  ...args: string[]
) => (out: { logs: string[]; results: TestResult[] }) => Promise<void>

export async function compileAndRun(
  libText: string,
  code: string,
  tests: TestCase[],
): Promise<RunResult> {
  const startedAt = Date.now()

  const sources = new Map<string, string>([
    [LIB_FILE, libText],
    [HARNESS_FILE, HARNESS_DTS],
    [SOLUTION_FILE, code],
    [TESTS_FILE, buildTestsSource(tests)],
  ])
  const emitted = new Map<string, string>()

  const program = ts.createProgram(
    [HARNESS_FILE, SOLUTION_FILE, TESTS_FILE],
    COMPILER_OPTIONS,
    createHost(sources, emitted),
  )

  const diagnostics = dedupeTestDiagnostics(
    [...program.getSyntacticDiagnostics(), ...program.getSemanticDiagnostics()]
      .map(toDiagnostic)
      .filter((diagnostic): diagnostic is Diagnostic => diagnostic !== null),
  )

  // Si no compila no se ejecuta: los errores ya explican que falla.
  if (diagnostics.some((diagnostic) => diagnostic.severity === 'error')) {
    return { ok: false, diagnostics, logs: [], tests: [], durationMs: Date.now() - startedAt }
  }

  program.emit()
  const body = [
    RUNTIME_PRELUDE,
    emitted.get('/solution.js') ?? '',
    emitted.get('/tests.js') ?? '',
    RUNTIME_EPILOGUE,
  ].join('\n')

  const out = { logs: [] as string[], results: [] as TestResult[] }
  let fatal: string | undefined

  try {
    await new AsyncFunction('__out', body)(out)
  } catch (error) {
    fatal = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
  }

  return {
    ok: !fatal && out.results.length > 0 && out.results.every((test) => test.status === 'pass'),
    diagnostics,
    logs: out.logs,
    tests: out.results,
    fatal,
    durationMs: Date.now() - startedAt,
  }
}
