/**
 * Answer matching for the theory quiz. Deliberately forgiving: the point is to
 * check that the concept stuck, not that the student typed the exact spacing.
 */
export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/"/g, "'")
    .replace(/;+$/, '')
}

export function isCorrect(given: string, answers: string[]): boolean {
  const normalized = normalizeAnswer(given)
  return normalized.length > 0 && answers.some((answer) => normalizeAnswer(answer) === normalized)
}
