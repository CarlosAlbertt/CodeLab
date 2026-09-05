import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { compileAndRun } from '@/engine/worker/core'
import { correctAnswerText, initialAnswer, isQuestionCorrect } from '@/utils/quiz'
import { tracks } from '@/content'

/**
 * Every shipped solution must compile in strict mode and pass its own tests.
 * This catches wrong expected values in exercise content before a student does.
 */
const libText = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'ts-libs', 'lib.bundle.d.ts'),
  'utf8',
)

const typescriptTrack = tracks.find((track) => track.id === 'typescript')!

describe('pista de TypeScript', () => {
  it('tiene ejercicios', () => {
    expect(typescriptTrack.exercises.length).toBeGreaterThan(0)
  })

  it('no repite identificadores', () => {
    const ids = typescriptTrack.exercises.map((exercise) => exercise.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('todas las unidades traen quiz de repaso', () => {
    for (const exercise of typescriptTrack.exercises) {
      expect(exercise.quiz.length, exercise.id).toBeGreaterThan(0)
    }
  })

  for (const exercise of typescriptTrack.exercises) {
    it(`${exercise.id}: el quiz está bien formado`, () => {
      for (const question of exercise.quiz) {
        expect(correctAnswerText(question), question.prompt).not.toBe('')

        if (question.kind === 'fill') {
          // Sin el hueco no hay dónde escribir la respuesta.
          expect(question.snippet, question.prompt).toContain('___')
          expect(question.answers.length, question.prompt).toBeGreaterThan(0)
        }

        if (question.kind === 'choice') {
          expect(question.options.length, question.prompt).toBeGreaterThan(1)
          expect(question.options[question.correct], question.prompt).toBeDefined()
        }

        if (question.kind === 'drag') {
          // Un hueco por ficha esperada, y todas las respuestas en el montón.
          expect(question.snippet.split('___').length - 1, question.prompt).toBe(question.blanks.length)
          expect(question.pool.length, question.prompt).toBeGreaterThanOrEqual(question.blanks.length)
          for (const blank of question.blanks) {
            expect(question.pool, question.prompt).toContain(blank)
          }
        }

        if (question.kind === 'order') {
          expect(question.lines.length, question.prompt).toBeGreaterThan(1)
          // Barajar exige que no haya lineas repetidas: se usan como clave.
          expect(new Set(question.lines).size, question.prompt).toBe(question.lines.length)
        }
      }
    })

    it(`${exercise.id}: el quiz empieza sin resolver`, () => {
      for (const question of exercise.quiz) {
        expect(isQuestionCorrect(question, initialAnswer(question)), question.prompt).toBe(false)
      }
    })

    it(`${exercise.id}: la solución pasa todos sus tests`, async () => {
      const result = await compileAndRun(libText, exercise.solution, exercise.tests)

      expect(result.diagnostics.filter((d) => d.severity === 'error')).toEqual([])
      expect(result.fatal).toBeUndefined()
      expect(result.tests.filter((test) => test.status !== 'pass')).toEqual([])
      expect(result.ok).toBe(true)
    }, 30_000)

    it(`${exercise.id}: la plantilla inicial no pasa los tests`, async () => {
      const result = await compileAndRun(libText, exercise.starterCode, exercise.tests)
      expect(result.ok).toBe(false)
    }, 30_000)
  }
})
