import { describe, expect, it } from 'vitest'
import { JavaRunner } from '@/engine/runners/java'
import { correctAnswerText, initialAnswer, isQuestionCorrect } from '@/utils/quiz'
import { tracks } from '@/content'

/**
 * Verifies the Java content against the real compile-and-run service. If it is
 * not up (CI, o simplemente no lo has arrancado) los casos se saltan en vez de
 * fallar: el resto de la suite no depende de tener un JDK escuchando.
 */
const BASE_URL = process.env.JAVA_RUNNER_URL ?? 'http://localhost:8099'

async function servicioDisponible(): Promise<boolean> {
  try {
    const respuesta = await fetch(`${BASE_URL}/api/salud`, {
      signal: AbortSignal.timeout(1500),
    })
    return respuesta.ok
  } catch {
    return false
  }
}

const disponible = await servicioDisponible()
const javaTrack = tracks.find((track) => track.id === 'java')!
const runner = new JavaRunner()

describe('pista de Java', () => {
  it('tiene ejercicios y cierra con un proyecto', () => {
    expect(javaTrack.exercises.length).toBeGreaterThan(0)
    expect(javaTrack.exercises.some((exercise) => exercise.kind === 'project')).toBe(true)
  })

  for (const exercise of javaTrack.exercises) {
    it(`${exercise.id}: el quiz está bien formado`, () => {
      expect(exercise.quiz.length, 'sin preguntas de repaso').toBeGreaterThan(0)
      for (const question of exercise.quiz) {
        expect(correctAnswerText(question), question.prompt).not.toBe('')
        expect(isQuestionCorrect(question, initialAnswer(question)), question.prompt).toBe(false)
      }
    })
  }

  describe.skipIf(!disponible)('con el servicio arrancado', () => {
    for (const exercise of javaTrack.exercises) {
      it(`${exercise.id}: la solución compila y pasa sus tests`, async () => {
        const result = await runner.run(exercise, exercise.solution)
        expect(result.diagnostics.filter((d) => d.severity === 'error')).toEqual([])
        expect(result.fatal).toBeUndefined()
        expect(result.tests.filter((test) => test.status !== 'pass')).toEqual([])
        expect(result.ok).toBe(true)
      }, 40_000)

      it(`${exercise.id}: la plantilla inicial no pasa los tests`, async () => {
        const result = await runner.run(exercise, exercise.starterCode)
        expect(result.ok).toBe(false)
      }, 40_000)
    }
  })
})
