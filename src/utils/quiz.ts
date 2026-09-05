import type { QuizAnswer, QuizQuestion } from '@/types/exercise'

/**
 * Answer handling for the theory quiz. Deliberately forgiving: the point is to
 * check the concept stuck, not that the student typed the exact spacing.
 */
export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/"/g, "'")
    .replace(/;+$/, '')
}

export function matchesAnswer(given: string, answers: string[]): boolean {
  const normalized = normalizeAnswer(given)
  return normalized.length > 0 && answers.some((answer) => normalizeAnswer(answer) === normalized)
}

/** Baraja sin dejar el resultado igual que la entrada: si no, no hay nada que hacer. */
export function shuffle<T>(items: T[]): T[] {
  if (items.length < 2) return [...items]

  let result = [...items]
  for (let attempt = 0; attempt < 10; attempt++) {
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j]!, result[i]!]
    }
    if (result.some((item, index) => item !== items[index])) return result
    result = [...items]
  }
  return result.reverse()
}

/** Estado inicial vacío para cada tipo de pregunta. */
export function initialAnswer(question: QuizQuestion): QuizAnswer {
  switch (question.kind) {
    case 'fill':
      return ''
    case 'choice':
      return null
    case 'drag':
      return question.blanks.map(() => null)
    case 'order':
      return shuffle(question.lines)
  }
}

export function isQuestionCorrect(question: QuizQuestion, answer: QuizAnswer): boolean {
  switch (question.kind) {
    case 'fill':
      return typeof answer === 'string' && matchesAnswer(answer, question.answers)

    case 'choice':
      return answer === question.correct

    case 'drag': {
      if (!Array.isArray(answer)) return false
      return question.blanks.every((expected, index) => {
        const chosen = answer[index]
        return typeof chosen === 'number' && normalizeAnswer(question.pool[chosen] ?? '') === normalizeAnswer(expected)
      })
    }

    case 'order':
      return Array.isArray(answer) && answer.join('\n') === question.lines.join('\n')
  }
}

/** Texto de la respuesta correcta, para mostrarla cuando el alumno se rinde. */
export function correctAnswerText(question: QuizQuestion): string {
  switch (question.kind) {
    case 'fill':
      return question.answers[0] ?? ''
    case 'choice':
      return question.options[question.correct] ?? ''
    case 'drag':
      return question.blanks.join(' · ')
    case 'order':
      return question.lines.join(' ⏎ ')
  }
}

/** Parte el fragmento por los ___: con n huecos devuelve n + 1 trozos de texto. */
export function splitSnippet(snippet: string): string[] {
  return snippet.split('___')
}
