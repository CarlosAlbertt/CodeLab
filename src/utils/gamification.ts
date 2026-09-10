/**
 * Pure helpers for XP and the daily streak. Kept free of Vue and of the clock
 * so the rules can be tested with fixed dates.
 */

/** XP diarios que cuentan como "meta cumplida". */
export const DAILY_GOAL = 50

/** Inicial del día de la semana, empezando en domingo como Date.getDay(). */
const DAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S']

/** Fecha local en formato AAAA-MM-DD: la racha va por días del alumno, no por UTC. */
export function dateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

export interface Streak {
  /** Días seguidos con XP. */
  days: number
  /** Si hoy ya se ha conseguido XP. */
  todayDone: boolean
}

/**
 * Consecutive days with XP. Mientras no acabe el día, no haber practicado
 * todavía no rompe la racha: se cuenta desde ayer y hoy queda pendiente.
 */
export function computeStreak(daily: Record<string, number>, today: Date): Streak {
  const todayDone = (daily[dateKey(today)] ?? 0) > 0
  let cursor = todayDone ? today : addDays(today, -1)
  let days = 0

  while ((daily[dateKey(cursor)] ?? 0) > 0) {
    days++
    cursor = addDays(cursor, -1)
  }

  return { days, todayDone }
}

export interface DayMark {
  key: string
  label: string
  done: boolean
  isToday: boolean
}

/** Los últimos `count` días, terminando en hoy, para pintar la semana. */
export function lastDays(daily: Record<string, number>, today: Date, count: number): DayMark[] {
  return Array.from({ length: count }, (_, position) => {
    const date = addDays(today, position - count + 1)
    const key = dateKey(date)
    return {
      key,
      label: DAY_LABELS[date.getDay()]!,
      done: (daily[key] ?? 0) > 0,
      isToday: position === count - 1,
    }
  })
}

/** Borra los días más antiguos que `keepDays`: para la racha no hacen falta. */
export function pruneDaily(daily: Record<string, number>, today: Date, keepDays: number): void {
  const limit = dateKey(addDays(today, -keepDays))
  for (const key of Object.keys(daily)) {
    if (key < limit) delete daily[key]
  }
}
