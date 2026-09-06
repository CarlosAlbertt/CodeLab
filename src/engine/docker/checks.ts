import { instructionsOf, parseDockerfile, type DockerfileDoc } from './dockerfile'

/** Devuelve el fallo, o null si la comprobación pasa. */
export type Check = (source: string) => string | null

/**
 * Small assertion helpers used by the Docker exercises. They read like the
 * sentence shown to the student, so the exercise content stays declarative.
 */
export function check(fn: (doc: DockerfileDoc, source: string) => string | null): Check {
  return (source) => fn(parseDockerfile(source), source)
}

/** La instrucción existe (y, si se pasa un patrón, sus argumentos encajan). */
export function requires(keyword: string, pattern?: RegExp, hint?: string): Check {
  return check((doc) => {
    const found = instructionsOf(doc, keyword)
    if (found.length === 0) return hint ?? `Falta la instrucción ${keyword}.`
    if (!pattern) return null
    return found.some((item) => pattern.test(item.args))
      ? null
      : hint ?? `${keyword} está, pero sus argumentos no son los que se piden.`
  })
}

/** La instrucción no debe aparecer. */
export function forbids(keyword: string, hint: string): Check {
  return check((doc) => (instructionsOf(doc, keyword).length === 0 ? null : hint))
}

/** La primera coincidencia de `first` va antes que la de `second`. */
export function inOrder(
  first: { keyword: string; pattern?: RegExp },
  second: { keyword: string; pattern?: RegExp },
  hint: string,
): Check {
  return check((doc) => {
    const find = (target: { keyword: string; pattern?: RegExp }) =>
      doc.instructions.find(
        (item) => item.keyword === target.keyword && (!target.pattern || target.pattern.test(item.args)),
      )

    // Si falta alguna de las dos, el mensaje del orden ya describe lo que se espera.
    const a = find(first)
    const b = find(second)
    if (!a || !b) return hint
    return a.line < b.line ? null : hint
  })
}

/** Número exacto de etapas (instrucciones FROM). */
export function hasStages(count: number, hint: string): Check {
  return check((doc) => (doc.stages.length === count ? null : hint))
}

/** Alguna etapa se llama con AS <nombre>, y otra copia desde ella. */
export function copiesFromStage(stageName: string, hint: string): Check {
  return check((doc) => {
    const named = doc.stages.some((stage) => stage.name === stageName)
    if (!named) return `Ninguna etapa se llama "${stageName}": usa FROM ... AS ${stageName}.`
    const copies = instructionsOf(doc, 'COPY').some((item) =>
      new RegExp(`--from=${stageName}\\b`).test(item.args),
    )
    return copies ? null : hint
  })
}

/** Comprobación libre sobre el texto tal cual, para lo que no encaje arriba. */
export function matchesText(pattern: RegExp, hint: string): Check {
  return (source) => (pattern.test(source) ? null : hint)
}
