<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { findTrack } from '@/content'
import { useProgress } from '@/composables/useProgress'

const props = defineProps<{ trackId: string }>()

const track = computed(() => findTrack(props.trackId))
const { isCompleted, trackProgress } = useProgress()

const DIFFICULTY_LABEL: Record<number, string> = {
  1: 'introducción',
  2: 'práctica',
  3: 'reto',
}
</script>

<template>
  <main v-if="track" class="mx-auto max-w-4xl px-6 py-14">
    <RouterLink to="/" class="text-xs text-muted hover:text-fg">← todas las pistas</RouterLink>

    <div class="mt-4 flex items-baseline justify-between gap-4">
      <h1 class="text-2xl font-semibold tracking-tight">{{ track.name }}</h1>
      <span class="font-mono text-xs text-muted">
        {{ trackProgress(track.id).done }}/{{ trackProgress(track.id).total }} superados
      </span>
    </div>
    <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{{ track.description }}</p>

    <ol class="mt-10 divide-y divide-line border-y border-line">
      <li v-for="(exercise, index) in track.exercises" :key="exercise.id">
        <RouterLink
          :to="{ name: 'exercise', params: { trackId: track.id, exerciseId: exercise.id } }"
          class="flex items-center gap-4 py-4 transition-colors hover:bg-ink-900"
        >
          <span class="w-8 shrink-0 pl-1 font-mono text-xs text-muted">
            {{ String(index + 1).padStart(2, '0') }}
          </span>
          <span
            class="w-4 shrink-0 font-mono text-xs"
            :class="isCompleted(exercise.id) ? 'text-pass' : 'text-line'"
            :aria-label="isCompleted(exercise.id) ? 'superado' : 'pendiente'"
          >
            {{ isCompleted(exercise.id) ? '✓' : '·' }}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate">{{ exercise.title }}</span>
            <span class="mt-0.5 block truncate text-xs text-muted">
              {{ exercise.concepts.join(' · ') }}
            </span>
          </span>
          <span class="shrink-0 pr-1 text-xs text-muted">
            {{ DIFFICULTY_LABEL[exercise.difficulty] }}
          </span>
        </RouterLink>
      </li>
    </ol>
  </main>

  <main v-else class="mx-auto max-w-4xl px-6 py-14">
    <p class="text-muted">Esa pista no existe.</p>
    <RouterLink to="/" class="mt-4 inline-block text-sm text-accent">Volver al inicio</RouterLink>
  </main>
</template>
