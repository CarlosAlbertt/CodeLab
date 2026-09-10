<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useGamification } from '@/composables/useGamification'

const props = defineProps<{
  trackId: string
  exerciseId: string
  title: string
  isProject: boolean
  isReview: boolean
  xp: number
  firstTry: number
  questions: number
  minutes: number
  failed: number
}>()

const emit = defineEmits<{ review: []; restart: [] }>()

const { streak, week } = useGamification()

const heading = computed(() => {
  if (props.isReview) return 'Repaso terminado'
  return props.isProject ? 'Teoría del proyecto completada' : 'Lección completada'
})

function dayClass(day: { done: boolean; isToday: boolean }): string {
  if (day.isToday && day.done) return 'bg-warn ring-2 ring-warn ring-offset-2 ring-offset-ink-950'
  if (day.isToday) return 'border-2 border-dashed border-warn'
  return day.done ? 'bg-warn' : 'bg-ink-700'
}
</script>

<template>
  <main class="mx-auto flex w-full max-w-[600px] flex-1 flex-col items-center px-6 pb-16 pt-16">
    <div
      class="cl-medalla flex size-24 items-center justify-center rounded-full border-2 border-pass bg-pass/[0.12] text-pass"
    >
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
    </div>

    <h1 class="cl-sube mt-7 text-center text-4xl font-semibold tracking-tight" style="animation-delay: 120ms">
      {{ heading }}
    </h1>
    <p class="cl-sube mt-2.5 text-center text-lg text-muted" style="animation-delay: 160ms">{{ title }}</p>

    <div class="mt-9 grid w-full grid-cols-3 gap-3">
      <div class="cl-sube flex flex-col items-center gap-2 rounded-xl border border-line bg-ink-900 p-5" style="animation-delay: 240ms">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-accent" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></svg>
        <span class="font-mono text-[26px] font-semibold text-accent">+{{ xp }}</span>
        <span class="text-[13px] text-muted">XP ganados</span>
      </div>
      <div class="cl-sube flex flex-col items-center gap-2 rounded-xl border border-line bg-ink-900 p-5" style="animation-delay: 300ms">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-pass" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /></svg>
        <span class="font-mono text-[26px] font-semibold text-pass">{{ firstTry }} / {{ questions }}</span>
        <span class="text-[13px] text-muted">a la primera</span>
      </div>
      <div class="cl-sube flex flex-col items-center gap-2 rounded-xl border border-line bg-ink-900 p-5" style="animation-delay: 360ms">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
        <span class="font-mono text-[26px] font-semibold">{{ minutes }} min</span>
        <span class="text-[13px] text-muted">de lección</span>
      </div>
    </div>

    <div
      class="cl-sube mt-3 flex w-full flex-wrap items-center justify-between gap-4 rounded-xl border border-warn/30 bg-warn/[0.06] px-5 py-4"
      style="animation-delay: 420ms"
    >
      <div class="flex items-center gap-3.5">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-warn" aria-hidden="true"><path d="M12 2.5c.8 3.2 5 5.2 5 10a5 5 0 0 1-10 0c0-2.1 1-3.6 2.4-4.8.2 1.8 1.1 2.8 2.1 3.1-.4-3 .1-5.6.5-8.3z" /></svg>
        <div class="flex flex-col">
          <span class="text-base font-semibold">
            Racha de {{ streak.days }} {{ streak.days === 1 ? 'día' : 'días' }}
          </span>
          <span class="text-sm text-muted">
            {{ streak.todayDone ? 'Hoy ya cuenta.' : 'Consigue algo de XP hoy para mantenerla.' }}
          </span>
        </div>
      </div>
      <div class="flex gap-1.5">
        <span
          v-for="day in week"
          :key="day.key"
          :title="day.label"
          class="size-[26px] rounded-full"
          :class="dayClass(day)"
        />
      </div>
    </div>

    <div class="cl-sube mt-8 flex w-full flex-col items-center gap-3.5" style="animation-delay: 480ms">
      <RouterLink
        :to="{ name: 'exercise', params: { trackId, exerciseId } }"
        class="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[10px] bg-accent text-base font-semibold text-ink-950 transition-colors hover:bg-[#8cbaff]"
      >
        <span>{{ isProject ? 'Empezar el proyecto' : 'Ir al caso práctico' }}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </RouterLink>
      <button
        v-if="failed > 0"
        type="button"
        class="text-[15px] text-muted transition-colors hover:text-fg"
        @click="emit('review')"
      >
        Repasar {{ failed === 1 ? 'la pregunta que fallaste' : `las ${failed} preguntas que fallaste` }}
      </button>
      <button
        v-else
        type="button"
        class="text-[15px] text-muted transition-colors hover:text-fg"
        @click="emit('restart')"
      >
        Repetir la lección
      </button>
      <RouterLink :to="{ name: 'track', params: { trackId } }" class="text-sm text-muted transition-colors hover:text-fg">
        Volver a la pista
      </RouterLink>
    </div>
  </main>
</template>
