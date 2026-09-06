// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { HtmlRunner } from '@/engine/runners/html'
import { correctAnswerText, initialAnswer, isQuestionCorrect } from '@/utils/quiz'
import { tracks } from '@/content'

/**
 * The HTML exercises assert on a parsed `Document`, so this file runs under
 * jsdom: the same checks the browser will run, against the same kind of DOM.
 */
const htmlTrack = tracks.find((track) => track.id === 'html')!
const runner = new HtmlRunner()

describe('pista de HTML', () => {
  it('tiene ejercicios y cierra con un proyecto', () => {
    expect(htmlTrack.exercises.length).toBeGreaterThan(0)
    expect(htmlTrack.exercises.some((exercise) => exercise.kind === 'project')).toBe(true)
  })

  for (const exercise of htmlTrack.exercises) {
    it(`${exercise.id}: la solución pasa todos sus tests`, async () => {
      const result = await runner.run(exercise, exercise.solution)
      expect(result.tests.filter((test) => test.status !== 'pass')).toEqual([])
      expect(result.ok).toBe(true)
    })

    it(`${exercise.id}: la plantilla inicial no pasa los tests`, async () => {
      const result = await runner.run(exercise, exercise.starterCode)
      expect(result.ok).toBe(false)
    })

    it(`${exercise.id}: el quiz está bien formado`, () => {
      expect(exercise.quiz.length, 'sin preguntas de repaso').toBeGreaterThan(0)
      for (const question of exercise.quiz) {
        expect(correctAnswerText(question), question.prompt).not.toBe('')
        expect(isQuestionCorrect(question, initialAnswer(question)), question.prompt).toBe(false)
        if (question.kind === 'drag') {
          expect(question.snippet.split('___').length - 1, question.prompt).toBe(
            question.blanks.length,
          )
        }
        if (question.kind === 'order') {
          expect(new Set(question.lines).size, question.prompt).toBe(question.lines.length)
        }
      }
    })
  }
})
