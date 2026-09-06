import { computed, reactive, watch } from 'vue'
import type { LanguageId } from '@/types/exercise'
import { findTrack } from '@/content'

const STORAGE_KEY = 'codelab:progress:v1'

interface ProgressEntry {
  /** El ejercicio se ha superado alguna vez con todos los tests en verde. */
  completed: boolean
  /** Se ha abierto el apartado de teoria de esta unidad. */
  read?: boolean
  /** Ultimo codigo escrito, para no perderlo al recargar. */
  code?: string
  completedAt?: string
}

type ProgressMap = Record<string, ProgressEntry>

function load(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ProgressMap) : {}
  } catch {
    // Modo privado o almacenamiento lleno: se trabaja sin persistencia.
    return {}
  }
}

const state = reactive<ProgressMap>(load())

watch(
  state,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // Sin persistencia, pero la sesion sigue funcionando.
    }
  },
  { deep: true },
)

function entry(exerciseId: string): ProgressEntry {
  if (!state[exerciseId]) state[exerciseId] = { completed: false }
  return state[exerciseId]!
}

/**
 * Per-exercise progress, persisted in localStorage. Deliberately a module-level
 * singleton: every view shares the same reactive state.
 */
export function useProgress() {
  const isCompleted = (exerciseId: string) => state[exerciseId]?.completed === true

  const markCompleted = (exerciseId: string) => {
    const item = entry(exerciseId)
    if (item.completed) return
    item.completed = true
    item.completedAt = new Date().toISOString()
  }

  const isRead = (exerciseId: string) => state[exerciseId]?.read === true

  const markRead = (exerciseId: string) => {
    entry(exerciseId).read = true
  }

  /** Primera unidad de la pista que aun no se ha superado. */
  const nextUp = (trackId: LanguageId) =>
    findTrack(trackId)?.exercises.find((exercise) => !isCompleted(exercise.id))

  const savedCode = (exerciseId: string) => state[exerciseId]?.code

  const saveCode = (exerciseId: string, code: string) => {
    entry(exerciseId).code = code
  }

  const clearCode = (exerciseId: string) => {
    delete entry(exerciseId).code
  }

  const trackProgress = (trackId: LanguageId) => {
    const exercises = findTrack(trackId)?.exercises ?? []
    const done = exercises.filter((exercise) => isCompleted(exercise.id)).length
    return { done, total: exercises.length }
  }

  const totalCompleted = computed(
    () => Object.values(state).filter((item) => item.completed).length,
  )

  const resetAll = () => {
    for (const key of Object.keys(state)) delete state[key]
  }

  return {
    isCompleted,
    markCompleted,
    isRead,
    markRead,
    nextUp,
    savedCode,
    saveCode,
    clearCode,
    trackProgress,
    totalCompleted,
    resetAll,
  }
}
