import { describe, expect, it } from 'vitest'
import type { QuizQuestion } from '@/types/exercise'
import { buildLessonSteps, splitTheory } from './lessonSteps'
import { tracks } from '@/content'

function pregunta(prompt: string): QuizQuestion {
  return { kind: 'choice', prompt, options: ['a', 'b'], correct: 0, explanation: '' }
}

describe('splitTheory', () => {
  it('parte la teoría por sus encabezados', () => {
    const conceptos = splitTheory('## Uno\n\nTexto uno.\n\n## Dos\n\nTexto dos.')
    expect(conceptos.map((c) => c.title)).toEqual(['Uno', 'Dos'])
    expect(conceptos[1]!.body).toBe('Texto dos.')
  })

  it('no confunde un ## dentro de un bloque de código con un encabezado', () => {
    const conceptos = splitTheory('## Uno\n\n~~~\n## esto es código\n~~~\n\n## Dos\n\nFin.')
    expect(conceptos.map((c) => c.title)).toEqual(['Uno', 'Dos'])
    expect(conceptos[0]!.body).toContain('## esto es código')
  })

  it('conserva el texto que va antes del primer encabezado', () => {
    const conceptos = splitTheory('Introducción.\n\n## Uno\n\nTexto.')
    expect(conceptos[0]).toEqual({ kind: 'concept', title: '', body: 'Introducción.' })
  })
})

describe('buildLessonSteps', () => {
  it('reparte las preguntas por detrás de los conceptos', () => {
    const teoria = '## A\n\na\n\n## B\n\nb\n\n## C\n\nc'
    const pasos = buildLessonSteps({ theory: teoria, quiz: [pregunta('1'), pregunta('2')] })
    const orden = pasos.map((paso) => (paso.kind === 'concept' ? paso.title : paso.question.prompt))
    expect(orden).toEqual(['A', 'B', '1', 'C', '2'])
  })

  it('pone la pregunta detrás del apartado que explica su respuesta', () => {
    const teoria = '## Intro\n\nnada aún\n\n## Map\n\nusa map\n\n## Filter\n\nusa filter'
    const hueco: QuizQuestion = {
      kind: 'fill',
      prompt: 'filtra',
      snippet: 'notas.___()',
      answers: ['filter'],
      explanation: '',
    }
    const pasos = buildLessonSteps({ theory: teoria, quiz: [hueco] })
    const orden = pasos.map((paso) => (paso.kind === 'concept' ? paso.title : paso.question.prompt))
    expect(orden).toEqual(['Intro', 'Map', 'Filter', 'filtra'])
  })

  it('nunca pregunta antes del segundo apartado, aunque haya tantas preguntas como apartados', () => {
    const teoria = '## A\n\na\n\n## B\n\nb\n\n## C\n\nc'
    const pasos = buildLessonSteps({ theory: teoria, quiz: [pregunta('1'), pregunta('2'), pregunta('3')] })
    expect(pasos.map((paso) => paso.kind).slice(0, 2)).toEqual(['concept', 'concept'])
  })

  it('respeta el orden en que el autor escribió las preguntas', () => {
    const teoria = '## A\n\na\n\n## B\n\nusa filter\n\n## C\n\nc'
    const hueco: QuizQuestion = {
      kind: 'fill',
      prompt: 'segunda',
      snippet: '___',
      answers: ['filter'],
      explanation: '',
    }
    const pasos = buildLessonSteps({ theory: teoria, quiz: [pregunta('primera'), hueco] })
    const preguntas = pasos.flatMap((paso) => (paso.kind === 'question' ? [paso.question.prompt] : []))
    expect(preguntas).toEqual(['primera', 'segunda'])
  })

  it('apila varias preguntas cuando hay más preguntas que conceptos', () => {
    const pasos = buildLessonSteps({ theory: '## A\n\na', quiz: [pregunta('1'), pregunta('2')] })
    expect(pasos.map((paso) => paso.kind)).toEqual(['concept', 'question', 'question'])
  })

  it('sin teoría, la lección son solo las preguntas', () => {
    const pasos = buildLessonSteps({ theory: '', quiz: [pregunta('1')] })
    expect(pasos).toHaveLength(1)
    expect(pasos[0]!.kind).toBe('question')
  })

  for (const track of tracks.filter((item) => item.status === 'ready')) {
    it(`todas las unidades de ${track.name} dan una lección bien formada`, () => {
      for (const exercise of track.exercises) {
        const pasos = buildLessonSteps(exercise)
        const conceptos = pasos.filter((paso) => paso.kind === 'concept')

        // Empieza explicando, no preguntando.
        expect(pasos[0]?.kind, exercise.id).toBe('concept')
        expect(conceptos.length, exercise.id).toBeGreaterThanOrEqual(2)
        // No se pierde ninguna pregunta por el camino.
        expect(pasos.length - conceptos.length, exercise.id).toBe(exercise.quiz.length)
        // Ninguna tarjeta sale vacía.
        for (const concepto of conceptos) {
          expect(concepto.kind === 'concept' && concepto.body.length > 0, `${exercise.id}: ${concepto.kind === 'concept' ? concepto.title : ''}`).toBe(true)
        }
      }
    })
  }
})
