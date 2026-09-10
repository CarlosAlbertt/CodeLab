import { describe, expect, it } from 'vitest'
import { addDays, computeStreak, dateKey, lastDays, pruneDaily } from './gamification'

// Un miércoles cualquiera, a media tarde para no depender de la zona horaria.
const HOY = new Date(2026, 8, 9, 17, 30)

function dias(...desplazamientos: number[]): Record<string, number> {
  return Object.fromEntries(desplazamientos.map((d) => [dateKey(addDays(HOY, d)), 10]))
}

describe('dateKey', () => {
  it('usa la fecha local con ceros a la izquierda', () => {
    expect(dateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})

describe('computeStreak', () => {
  it('sin actividad no hay racha', () => {
    expect(computeStreak({}, HOY)).toEqual({ days: 0, todayDone: false })
  })

  it('cuenta los días seguidos que terminan hoy', () => {
    expect(computeStreak(dias(0, -1, -2), HOY)).toEqual({ days: 3, todayDone: true })
  })

  it('si hoy aún no se ha practicado, la racha sigue viva desde ayer', () => {
    expect(computeStreak(dias(-1, -2), HOY)).toEqual({ days: 2, todayDone: false })
  })

  it('un día sin practicar corta la racha', () => {
    expect(computeStreak(dias(0, -1, -3, -4), HOY)).toEqual({ days: 2, todayDone: true })
  })

  it('ayer sin practicar y hoy tampoco: la racha es cero', () => {
    expect(computeStreak(dias(-2, -3), HOY).days).toBe(0)
  })
})

describe('lastDays', () => {
  it('devuelve la semana terminando en hoy, con su inicial', () => {
    const semana = lastDays(dias(0, -2), HOY, 7)
    expect(semana).toHaveLength(7)
    expect(semana[6]).toMatchObject({ label: 'X', isToday: true, done: true })
    expect(semana[5]).toMatchObject({ label: 'M', done: false })
    expect(semana[4]).toMatchObject({ label: 'L', done: true })
  })
})

describe('pruneDaily', () => {
  it('borra solo los días más antiguos que el límite', () => {
    const historial = dias(0, -10, -90)
    pruneDaily(historial, HOY, 60)
    expect(Object.keys(historial).sort()).toEqual([dateKey(addDays(HOY, -10)), dateKey(HOY)])
  })
})
