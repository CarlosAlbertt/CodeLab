import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { compileAndRun } from '@/engine/worker/core'
import { isCorrect } from '@/utils/quiz'
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
        // Sin el hueco no hay donde escribir la respuesta.
        expect(question.snippet, question.prompt).toContain('___')
        expect(question.answers.length, question.prompt).toBeGreaterThan(0)
        // La respuesta que se muestra al rendirse tiene que darse por buena.
        expect(isCorrect(question.answers[0]!, question.answers), question.prompt).toBe(true)
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
