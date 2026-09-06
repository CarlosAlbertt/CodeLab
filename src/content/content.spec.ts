import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { compileAndRun } from '@/engine/worker/core'
import { DockerfileRunner } from '@/engine/runners/dockerfile'
import { correctAnswerText, initialAnswer, isQuestionCorrect } from '@/utils/quiz'
import { tracks } from '@/content'
import type { Exercise, RunResult } from '@/types/exercise'

/**
 * Every shipped solution must pass its own tests, and every starter must fail
 * them. This catches wrong expected values in exercise content before a student
 * runs into them.
 */
const libText = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'ts-libs', 'lib.bundle.d.ts'),
  'utf8',
)

const dockerRunner = new DockerfileRunner()

function run(exercise: Exercise, code: string): Promise<RunResult> {
  return exercise.language === 'docker'
    ? dockerRunner.run(exercise, code)
    : compileAndRun(libText, code, exercise.tests)
}

const ready = tracks.filter((track) => track.status === 'ready')

describe.each(ready)('pista de $name', (track) => {
  it('tiene ejercicios', () => {
    expect(track.exercises.length).toBeGreaterThan(0)
  })

  it('no repite identificadores', () => {
    const ids = track.exercises.map((exercise) => exercise.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('cierra con un proyecto final', () => {
    expect(track.exercises.some((exercise) => exercise.kind === 'project')).toBe(true)
  })

  for (const exercise of track.exercises) {
    it(`${exercise.id}: la solución pasa todos sus tests`, async () => {
      const result = await run(exercise, exercise.solution)

      expect(result.diagnostics.filter((d) => d.severity === 'error')).toEqual([])
      expect(result.fatal).toBeUndefined()
      expect(result.tests.filter((test) => test.status !== 'pass')).toEqual([])
      expect(result.ok).toBe(true)
    }, 30_000)

    it(`${exercise.id}: la plantilla inicial no pasa los tests`, async () => {
      const result = await run(exercise, exercise.starterCode)
      expect(result.ok).toBe(false)
    }, 30_000)

    it(`${exercise.id}: el quiz está bien formado`, () => {
      expect(exercise.quiz.length, 'sin preguntas de repaso').toBeGreaterThan(0)

      for (const question of exercise.quiz) {
        expect(correctAnswerText(question), question.prompt).not.toBe('')
        // Una pregunta que ya viene resuelta no enseña nada.
        expect(isQuestionCorrect(question, initialAnswer(question)), question.prompt).toBe(false)

        if (question.kind === 'fill') {
          expect(question.snippet, question.prompt).toContain('___')
          expect(question.answers.length, question.prompt).toBeGreaterThan(0)
        }

        if (question.kind === 'choice') {
          expect(question.options.length, question.prompt).toBeGreaterThan(1)
          expect(question.options[question.correct], question.prompt).toBeDefined()
        }

        if (question.kind === 'drag') {
          expect(question.snippet.split('___').length - 1, question.prompt).toBe(question.blanks.length)
          expect(question.pool.length, question.prompt).toBeGreaterThanOrEqual(question.blanks.length)
          for (const blank of question.blanks) {
            expect(question.pool, question.prompt).toContain(blank)
          }
        }

        if (question.kind === 'order') {
          expect(question.lines.length, question.prompt).toBeGreaterThan(1)
          // Barajar exige que no haya líneas repetidas: se usan como clave.
          expect(new Set(question.lines).size, question.prompt).toBe(question.lines.length)
        }
      }
    })
  }
})
