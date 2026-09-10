<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { findExercise, findTrack } from '@/content'
import { useProgress } from '@/composables/useProgress'
import { useGamification } from '@/composables/useGamification'
import { buildLessonSteps } from '@/utils/lessonSteps'
import { correctAnswerText, hasAnswer, initialAnswer, isQuestionCorrect } from '@/utils/quiz'
import type { QuizAnswer, QuizQuestion } from '@/types/exercise'
import MarkdownBlock from '@/components/MarkdownBlock.vue'
import QuizFill from '@/components/quiz/QuizFill.vue'
import QuizChoice from '@/components/quiz/QuizChoice.vue'
import QuizDrag from '@/components/quiz/QuizDrag.vue'
import QuizOrder from '@/components/quiz/QuizOrder.vue'
import LessonComplete from '@/components/lesson/LessonComplete.vue'

const props = defineProps<{ trackId: string; exerciseId: string }>()

/** Acertar a la primera vale más que acertar tras reintentar. */
const XP_FIRST_TRY = 10
const XP_RETRY = 5
/** Bonus por terminar la lección, solo la primera vez. */
const XP_LESSON = 20

const HELP: Record<QuizQuestion['kind'], string> = {
  fill: 'Escribe lo que falta en el hueco.',
  choice: 'Elige una opción.',
  drag: 'Coloca cada ficha en su hueco: arrástrala, o tócala y luego toca el hueco.',
  order: 'Ordena las líneas: arrástralas o usa las flechas.',
}

const track = computed(() => findTrack(props.trackId))
const exercise = computed(() => findExercise(props.trackId, props.exerciseId))

const { markRead, lessonStep, saveLessonStep, isLessonDone, markLessonDone } = useProgress()
const { addXp } = useGamification()

const allSteps = computed(() => (exercise.value ? buildLessonSteps(exercise.value) : []))
/** En el repaso solo se recorren las preguntas que se fallaron a la primera. */
const review = ref<number[] | null>(null)
const steps = computed(() =>
  review.value ? review.value.map((position) => allSteps.value[position]!) : allSteps.value,
)

type Phase = 'answering' | 'correct' | 'wrong' | 'revealed'

const index = ref(0)
const phase = ref<Phase>('answering')
const answer = ref<QuizAnswer>(null)
const attempts = ref(0)
/** Cambia en cada reintento para montar la pregunta de nuevo (vuelve a barajar). */
const retries = ref(0)
const lastGain = ref(0)
const finished = ref(false)
const elapsedMinutes = ref(1)
const stats = reactive({ xp: 0, firstTry: 0, failed: [] as number[], startedAt: Date.now() })

const step = computed(() => steps.value[index.value])
const concept = computed(() => (step.value?.kind === 'concept' ? step.value : null))
const question = computed<QuizQuestion | null>(() =>
  step.value?.kind === 'question' ? step.value.question : null,
)
const questionCount = computed(() => steps.value.filter((item) => item.kind === 'question').length)
const canCheck = computed(() => question.value !== null && hasAnswer(question.value, answer.value))
const correctNow = computed(
  () => question.value !== null && isQuestionCorrect(question.value, answer.value),
)
/** Posición en la lección completa, aunque se esté en el repaso. */
const originalIndex = computed(() => review.value?.[index.value] ?? index.value)

function prepareStep() {
  phase.value = 'answering'
  attempts.value = 0
  lastGain.value = 0
  answer.value = question.value ? initialAnswer(question.value) : null
}

function start(from: number, only: number[] | null = null) {
  review.value = only
  finished.value = false
  index.value = Math.min(Math.max(from, 0), Math.max(steps.value.length - 1, 0))
  stats.xp = 0
  stats.firstTry = 0
  stats.failed = []
  stats.startedAt = Date.now()
  prepareStep()
}

// Se retoma por el paso en el que se dejó la última vez.
watch(
  () => props.exerciseId,
  (id) => {
    markRead(id)
    start(lessonStep(id))
  },
  { immediate: true },
)

function check() {
  if (!question.value || phase.value !== 'answering' || !canCheck.value) return
  attempts.value++

  if (correctNow.value) {
    const gain = attempts.value === 1 ? XP_FIRST_TRY : XP_RETRY
    if (attempts.value === 1) stats.firstTry++
    lastGain.value = gain
    stats.xp += gain
    addXp(gain)
    phase.value = 'correct'
    return
  }

  if (attempts.value === 1 && !stats.failed.includes(originalIndex.value)) {
    stats.failed.push(originalIndex.value)
  }
  phase.value = 'wrong'
}

function retry() {
  if (!question.value) return
  retries.value++
  answer.value = initialAnswer(question.value)
  phase.value = 'answering'
}

function reveal() {
  phase.value = 'revealed'
}

function next() {
  if (index.value < steps.value.length - 1) {
    index.value++
    if (!review.value) saveLessonStep(props.exerciseId, index.value)
    prepareStep()
    window.scrollTo({ top: 0 })
    return
  }
  finish()
}

function finish() {
  elapsedMinutes.value = Math.max(1, Math.round((Date.now() - stats.startedAt) / 60_000))
  if (!review.value) {
    saveLessonStep(props.exerciseId, 0)
    if (!isLessonDone(props.exerciseId)) {
      markLessonDone(props.exerciseId)
      stats.xp += XP_LESSON
      addXp(XP_LESSON)
    }
  }
  finished.value = true
  window.scrollTo({ top: 0 })
}

function reviewFailed() {
  start(0, [...stats.failed].sort((a, b) => a - b))
}

/** Lo que hace el botón principal (y Enter) en cada momento. */
function primary() {
  if (finished.value || !step.value) return
  if (concept.value) return next()
  if (phase.value === 'answering') return check()
  if (phase.value === 'wrong') return retry()
  next()
}

function onKey(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.isComposing) return
  const target = event.target as HTMLElement | null
  // Los controles ya responden a Enter por su cuenta: no se dispara dos veces.
  if (target?.closest('input, textarea, button, a, select')) return
  event.preventDefault()
  primary()
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))

function segmentClass(position: number): string {
  if (finished.value || position < index.value) return 'bg-accent'
  if (position === index.value) return phase.value === 'correct' ? 'bg-pass' : 'bg-accent/45'
  return 'bg-ink-700'
}

const barClass = computed(() => {
  if (!question.value || phase.value === 'answering') return 'border-ink-700 bg-ink-950'
  if (phase.value === 'correct') return 'border-pass/35 bg-[#0f1815]'
  if (phase.value === 'wrong') return 'border-fail/35 bg-[#181214]'
  return 'border-line bg-ink-900'
})
</script>

<template>
  <div v-if="exercise && track" class="flex min-h-screen flex-col">
    <div class="sticky top-0 z-10 border-b border-ink-700 bg-ink-950">
      <div class="mx-auto flex h-[72px] max-w-[960px] items-center gap-5 px-6">
        <RouterLink
          :to="{ name: 'track', params: { trackId: track.id } }"
          class="flex size-10 shrink-0 items-center justify-center rounded-lg border border-line text-muted transition-colors hover:border-fg/30 hover:text-fg"
          aria-label="Salir de la lección"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </RouterLink>
        <div
          class="grid flex-1 gap-1.5"
          :style="{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }"
          role="progressbar"
          :aria-valuemin="0"
          :aria-valuemax="steps.length"
          :aria-valuenow="finished ? steps.length : index"
        >
          <div
            v-for="(_, position) in steps"
            :key="position"
            class="h-1.5 rounded-full transition-colors duration-300"
            :class="segmentClass(position)"
          />
        </div>
        <span class="flex shrink-0 items-center gap-1.5 font-mono text-sm font-semibold text-accent">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></svg>
          {{ stats.xp }} XP
        </span>
      </div>
    </div>

    <LessonComplete
      v-if="finished"
      :track-id="track.id"
      :exercise-id="exercise.id"
      :title="exercise.title"
      :is-project="exercise.kind === 'project'"
      :is-review="review !== null"
      :xp="stats.xp"
      :first-try="stats.firstTry"
      :questions="questionCount"
      :minutes="elapsedMinutes"
      :failed="stats.failed.length"
      @review="reviewFailed"
      @restart="start(0)"
    />

    <template v-else-if="step">
      <main class="mx-auto w-full max-w-[680px] flex-1 px-6 pb-16 pt-16">
        <template v-if="concept">
          <div class="flex items-center gap-3">
            <span class="font-mono text-[13px] font-semibold tracking-[0.08em] text-accent">CONCEPTO</span>
            <span class="text-[13px] text-muted">{{ exercise.title }}</span>
          </div>
          <h1 class="mt-3.5 text-[34px] font-semibold leading-tight tracking-tight">
            {{ concept.title || exercise.title }}
          </h1>
          <MarkdownBlock class="lesson-prose mt-5" :source="concept.body" />
        </template>

        <template v-else-if="question">
          <span class="font-mono text-[13px] font-semibold tracking-[0.08em] text-accent">
            {{ review ? 'REPASO' : 'EJERCICIO' }}
          </span>
          <h1 class="mt-3.5 text-[30px] font-semibold leading-tight tracking-tight">{{ question.prompt }}</h1>
          <p class="mt-3 text-[17px] text-muted">{{ HELP[question.kind] }}</p>

          <div :key="`${originalIndex}-${retries}`" class="lesson-quiz mt-8">
            <QuizFill
              v-if="question.kind === 'fill'"
              :question="question"
              :answer="(answer as string)"
              :checked="phase !== 'answering'"
              :correct="correctNow"
              @update:answer="answer = $event"
              @submit="check"
            />
            <QuizChoice
              v-else-if="question.kind === 'choice'"
              :question="question"
              :answer="(answer as number | null)"
              :checked="phase !== 'answering'"
              :correct="correctNow"
              @update:answer="answer = $event"
            />
            <QuizDrag
              v-else-if="question.kind === 'drag'"
              :question="question"
              :answer="(answer as (number | null)[])"
              :checked="phase !== 'answering'"
              @update:answer="answer = $event"
            />
            <QuizOrder
              v-else
              :question="question"
              :answer="(answer as string[])"
              :checked="phase !== 'answering'"
              @update:answer="answer = $event"
            />
          </div>
        </template>
      </main>

      <div class="sticky bottom-0 border-t transition-colors" :class="barClass" aria-live="polite">
        <div class="mx-auto flex min-h-24 max-w-[960px] flex-wrap items-center justify-between gap-x-8 gap-y-4 px-6 py-5">
          <template v-if="question && phase === 'correct'">
            <div class="flex min-w-0 flex-1 items-start gap-4">
              <span class="flex size-11 shrink-0 items-center justify-center rounded-full bg-pass/[0.18] text-pass">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
              </span>
              <div class="min-w-0">
                <p class="text-xl font-bold text-pass">¡Correcto!</p>
                <p class="mt-1 text-base text-fg/80">{{ question.explanation }}</p>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="font-mono text-sm font-semibold text-accent">+{{ lastGain }} XP</span>
              <button
                type="button"
                class="h-12 rounded-[10px] bg-pass px-8 text-base font-semibold text-ink-950 transition-opacity hover:opacity-90"
                @click="next"
              >
                Continuar
              </button>
            </div>
          </template>

          <template v-else-if="question && phase === 'wrong'">
            <div class="flex min-w-0 flex-1 items-start gap-4">
              <span class="flex size-11 shrink-0 items-center justify-center rounded-full bg-fail/[0.16] text-fail">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </span>
              <div class="min-w-0">
                <p class="text-xl font-bold text-fail">Casi</p>
                <p class="mt-1 text-base text-fg/80">
                  No es eso. Inténtalo otra vez; si te atascas, mira la respuesta. Fallar no te quita nada.
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="h-12 rounded-[10px] px-5 text-[15px] text-muted transition-colors hover:text-fg"
                @click="reveal"
              >
                Ver la respuesta
              </button>
              <button
                type="button"
                class="h-12 rounded-[10px] bg-fail px-8 text-base font-semibold text-ink-950 transition-opacity hover:opacity-90"
                @click="retry"
              >
                Reintentar
              </button>
            </div>
          </template>

          <template v-else-if="question && phase === 'revealed'">
            <div class="flex min-w-0 flex-1 items-start gap-4">
              <span class="flex size-11 shrink-0 items-center justify-center rounded-full bg-warn/[0.15] text-warn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.5.4.8 1 .8 1.6V16h5.4v-.5c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3z" /></svg>
              </span>
              <div class="min-w-0">
                <p class="text-xl font-bold">La respuesta</p>
                <p class="mt-1 font-mono text-[15px] text-pass">{{ correctAnswerText(question) }}</p>
                <p class="mt-1.5 text-base text-fg/80">{{ question.explanation }}</p>
              </div>
            </div>
            <button
              type="button"
              class="h-12 rounded-[10px] bg-accent px-8 text-base font-semibold text-ink-950 transition-colors hover:bg-[#8cbaff]"
              @click="next"
            >
              Continuar
            </button>
          </template>

          <template v-else>
            <span class="text-sm text-muted">
              {{ review ? 'Repaso' : 'Paso' }} {{ index + 1 }} de {{ steps.length }}
            </span>
            <button
              v-if="question"
              type="button"
              :disabled="!canCheck"
              class="h-12 rounded-[10px] px-8 text-base font-semibold transition-colors"
              :class="canCheck ? 'bg-accent text-ink-950 hover:bg-[#8cbaff]' : 'cursor-not-allowed bg-ink-700 text-[#5b6270]'"
              @click="check"
            >
              Comprobar
            </button>
            <button
              v-else
              type="button"
              class="flex h-12 items-center gap-2.5 rounded-[10px] bg-accent px-8 text-base font-semibold text-ink-950 transition-colors hover:bg-[#8cbaff]"
              @click="next"
            >
              <span>Continuar</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          </template>
        </div>
      </div>
    </template>
  </div>

  <main v-else class="mx-auto max-w-3xl px-6 py-14">
    <p class="text-muted">Esa unidad no existe.</p>
    <RouterLink to="/" class="mt-4 inline-block text-accent">Volver al inicio</RouterLink>
  </main>
</template>
