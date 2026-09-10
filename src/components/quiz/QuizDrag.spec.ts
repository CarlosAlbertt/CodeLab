// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import type { DragQuestion } from '@/types/exercise'
import QuizDrag from './QuizDrag.vue'

const pregunta: DragQuestion = {
  kind: 'drag',
  prompt: 'Completa la cadena',
  explanation: '',
  snippet: 'notas.___(...).___(...)',
  blanks: ['filter', 'reduce'],
  pool: ['filter', 'reduce', 'map', 'find'],
}

function fichas(answer: (number | null)[]): string[] {
  const wrapper = mount(QuizDrag, { props: { question: pregunta, answer, checked: false } })
  return wrapper.findAll('button[draggable="true"]').map((ficha) => ficha.text())
}

describe('QuizDrag', () => {
  it('no ofrece las fichas en el orden de la respuesta', () => {
    const ofrecidas = fichas([null, null])
    expect([...ofrecidas].sort()).toEqual([...pregunta.pool].sort())
    // En el orden del autor bastaría con colocar las fichas en fila para acertar.
    expect(ofrecidas).not.toEqual(pregunta.pool)
  })

  it('las fichas ya colocadas desaparecen del montón', () => {
    const ofrecidas = fichas([0, null])
    expect(ofrecidas).toHaveLength(3)
    expect(ofrecidas).not.toContain('filter')
  })
})
