import { computed, reactive, watch } from 'vue'
import { DAILY_GOAL, computeStreak, dateKey, lastDays, pruneDaily } from '@/utils/gamification'

const STORAGE_KEY = 'codelab:gamification:v1'
/** Días de historial que se guardan: de sobra para la racha y la semana. */
const KEEP_DAYS = 60

interface GamificationState {
  xp: number
  /** XP conseguidos cada día, por fecha local AAAA-MM-DD. */
  daily: Record<string, number>
}

function load(): GamificationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { xp: 0, daily: {} }
    const parsed = JSON.parse(raw) as Partial<GamificationState>
    return { xp: Number(parsed.xp) || 0, daily: parsed.daily ?? {} }
  } catch {
    // Modo privado o datos corruptos: se empieza de cero sin romper la app.
    return { xp: 0, daily: {} }
  }
}

const state = reactive<GamificationState>(load())

watch(
  state,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // Sin persistencia, pero la sesión sigue funcionando.
    }
  },
  { deep: true },
)

/**
 * XP and daily streak, persisted in localStorage like the rest of the
 * progress. Module-level singleton: the header and the lesson share it.
 */
export function useGamification() {
  const totalXp = computed(() => state.xp)
  const todayXp = computed(() => state.daily[dateKey(new Date())] ?? 0)
  const streak = computed(() => computeStreak(state.daily, new Date()))
  const week = computed(() => lastDays(state.daily, new Date(), 7))

  function addXp(amount: number) {
    if (amount <= 0) return
    const today = new Date()
    const key = dateKey(today)
    state.xp += amount
    state.daily[key] = (state.daily[key] ?? 0) + amount
    pruneDaily(state.daily, today, KEEP_DAYS)
  }

  return { totalXp, todayXp, streak, week, dailyGoal: DAILY_GOAL, addXp }
}
