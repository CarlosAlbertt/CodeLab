import type { Diagnostic } from '@/types/exercise'

/**
 * Minimal Dockerfile parser: enough to give line-accurate feedback and to let
 * exercises assert on the instructions a student wrote.
 */
export interface DockerInstruction {
  /** Instrucción en mayúsculas: FROM, RUN, COPY... */
  keyword: string
  /** Lo que va detrás de la instrucción, ya unido si venía partido con \\. */
  args: string
  /** Línea (empezando en 1) donde arranca la instrucción. */
  line: number
  /** Índice de la etapa (FROM) a la que pertenece; -1 si va antes del primer FROM. */
  stage: number
}

export interface DockerStage {
  /** Imagen base tal cual se escribió. */
  image: string
  /** Nombre dado con AS, si lo hay. */
  name?: string
  line: number
}

export interface DockerfileDoc {
  instructions: DockerInstruction[]
  stages: DockerStage[]
  diagnostics: Diagnostic[]
}

const KNOWN = new Set([
  'FROM', 'RUN', 'CMD', 'LABEL', 'EXPOSE', 'ENV', 'ADD', 'COPY', 'ENTRYPOINT',
  'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD', 'STOPSIGNAL', 'HEALTHCHECK', 'SHELL',
])

function error(line: number, message: string, hint?: string): Diagnostic {
  return { origin: 'solution', severity: 'error', line, column: 1, message, hint }
}

export function parseDockerfile(source: string): DockerfileDoc {
  const lines = source.split('\n')
  const instructions: DockerInstruction[] = []
  const stages: DockerStage[] = []
  const diagnostics: Diagnostic[] = []

  let index = 0
  while (index < lines.length) {
    const raw = lines[index]!
    const trimmed = raw.trim()

    // Líneas vacías y comentarios (incluida la directiva # syntax=) no son instrucciones.
    if (trimmed === '' || trimmed.startsWith('#')) {
      index++
      continue
    }

    const startLine = index + 1
    let text = trimmed
    // Una barra final continúa la instrucción en la línea siguiente.
    while (text.endsWith('\\') && index + 1 < lines.length) {
      index++
      text = text.slice(0, -1).trim() + ' ' + lines[index]!.trim()
    }

    const match = /^(\w+)\s*(.*)$/.exec(text)
    if (!match) {
      diagnostics.push(error(startLine, `No entiendo esta línea: ${trimmed}`))
      index++
      continue
    }

    const keyword = match[1]!.toUpperCase()
    const args = (match[2] ?? '').trim()

    if (!KNOWN.has(keyword)) {
      diagnostics.push(
        error(startLine, `${match[1]} no es una instrucción de Dockerfile.`,
          'Las instrucciones van en mayúsculas al principio de la línea: FROM, RUN, COPY, CMD...'),
      )
      index++
      continue
    }

    if (args === '' && keyword !== 'ONBUILD') {
      diagnostics.push(error(startLine, `${keyword} necesita algo detrás.`))
    }

    if (keyword === 'FROM') {
      const from = /^(\S+)(?:\s+[Aa][Ss]\s+(\S+))?/.exec(args)
      stages.push({ image: from?.[1] ?? '', name: from?.[2], line: startLine })
    }

    instructions.push({ keyword, args, line: startLine, stage: stages.length - 1 })
    index++
  }

  if (stages.length === 0) {
    diagnostics.push(
      error(1, 'Falta la instrucción FROM.',
        'Todo Dockerfile empieza eligiendo una imagen base con FROM.'),
    )
  } else {
    const first = instructions.find((item) => item.keyword !== 'ARG' && item.keyword !== 'FROM')
    const firstFrom = instructions.find((item) => item.keyword === 'FROM')!
    if (first && first.line < firstFrom.line) {
      diagnostics.push(
        error(first.line, `${first.keyword} aparece antes del primer FROM.`,
          'Solo ARG puede ir antes de FROM: hasta que no eliges imagen base no hay dónde ejecutar nada.'),
      )
    }
  }

  return { instructions, stages, diagnostics }
}

/** Instrucciones de un tipo, opcionalmente limitadas a una etapa. */
export function instructionsOf(doc: DockerfileDoc, keyword: string, stage?: number): DockerInstruction[] {
  return doc.instructions.filter(
    (item) => item.keyword === keyword && (stage === undefined || item.stage === stage),
  )
}
