import type { Exercise, QuizQuestion } from '@/types/exercise'

/**
 * Step-by-step lesson model. Instead of one long theory page followed by a
 * quiz, a lesson is a sequence of short cards: one idea, then a question on it,
 * with feedback before moving on.
 */
export interface ConceptStep {
  kind: 'concept'
  /** Título del apartado de la teoría; vacío si el texto no tenía encabezado. */
  title: string
  /** Cuerpo del apartado en Markdown ligero. */
  body: string
}

export interface QuestionStep {
  kind: 'question'
  question: QuizQuestion
}

export type LessonStep = ConceptStep | QuestionStep

const FENCE = /^(?:```|~~~)/

/**
 * Parte la teoría por sus encabezados `## `. Un `##` dentro de un bloque de
 * código no es un encabezado, así que se lleva la cuenta de las vallas.
 */
export function splitTheory(theory: string): ConceptStep[] {
  const sections: { title: string; lines: string[] }[] = []
  let current: { title: string; lines: string[] } | null = null
  let insideFence = false

  for (const line of theory.split('\n')) {
    if (FENCE.test(line.trim())) insideFence = !insideFence

    if (!insideFence && line.startsWith('## ')) {
      current = { title: line.slice(3).trim(), lines: [] }
      sections.push(current)
      continue
    }

    if (!current) {
      current = { title: '', lines: [] }
      sections.push(current)
    }
    current.lines.push(line)
  }

  return sections
    .map((section) => ({ kind: 'concept' as const, title: section.title, body: section.lines.join('\n').trim() }))
    .filter((section) => section.title !== '' || section.body !== '')
}

/**
 * Palabras de código que delatan de qué va una pregunta: la respuesta de un
 * hueco, las fichas de un arrastre o una opción correcta que sea código. Los
 * símbolos sueltos y los números no sirven, porque aparecen en cualquier sitio.
 */
function keyTerms(question: QuizQuestion): string[] {
  const candidates =
    question.kind === 'fill'
      ? [question.answers[0] ?? '']
      : question.kind === 'drag'
        ? question.blanks
        : question.kind === 'choice' && !/\s/.test(question.options[question.correct] ?? ' ')
          ? [question.options[question.correct]!]
          : []

  return candidates.map((term) => term.trim()).filter((term) => term.length >= 2 && /[A-Za-z]/.test(term))
}

/**
 * Builds the lesson: concept cards with each question placed right after the
 * card that explains it.
 *
 * Una pregunta va detrás del primer apartado a partir del cual la teoría ya ha
 * mencionado sus palabras clave. Si la pregunta no tiene ninguna reconocible,
 * se reparte en proporción. En ambos casos nunca va antes del segundo apartado
 * (el primero suele ser la introducción) y se respeta el orden del autor.
 */
export function buildLessonSteps(exercise: Pick<Exercise, 'theory' | 'quiz'>): LessonStep[] {
  const concepts = splitTheory(exercise.theory)
  const questions = exercise.quiz

  if (concepts.length === 0) {
    return questions.map((question) => ({ kind: 'question', question }))
  }

  const firstSlot = concepts.length >= 2 ? 1 : 0
  // Texto acumulado hasta cada apartado: lo que el alumno ha leído al llegar ahí.
  const readSoFar: string[] = []
  concepts.reduce((text, concept) => {
    const next = `${text}\n${concept.title}\n${concept.body}`
    readSoFar.push(next)
    return next
  }, '')

  const behind: QuestionStep[][] = concepts.map(() => [])
  let previous = firstSlot

  questions.forEach((question, position) => {
    const proportional =
      firstSlot +
      Math.min(
        concepts.length - 1 - firstSlot,
        Math.ceil(((position + 1) * (concepts.length - firstSlot)) / questions.length) - 1,
      )

    const terms = keyTerms(question)
    const explainedAt = terms.length
      ? readSoFar.findIndex((text) => terms.every((term) => text.includes(term)))
      : -1

    const slot = Math.max(explainedAt === -1 ? proportional : explainedAt, firstSlot, previous)
    previous = slot
    behind[slot]!.push({ kind: 'question', question })
  })

  return concepts.flatMap((concept, position) => [concept, ...behind[position]!])
}
