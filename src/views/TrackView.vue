<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { findTrack } from '@/content'
import { useProgress } from '@/composables/useProgress'

const props = defineProps<{ trackId: string }>()

const track = computed(() => findTrack(props.trackId))
// El proyecto final se lista aparte: no es una unidad mas, es el cierre de la pista.
const units = computed(() => track.value?.exercises.filter((item) => item.kind !== 'project') ?? [])
const project = computed(() => track.value?.exercises.find((item) => item.kind === 'project'))

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

    <p class="mt-8 text-xs uppercase tracking-wider text-muted">Unidades</p>
    <ol class="mt-3 divide-y divide-line border-y border-line">
      <li
        v-for="(exercise, index) in units"
        :key="exercise.id"
        class="flex flex-wrap items-center gap-x-4 gap-y-2 py-4"
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
        <span class="hidden shrink-0 text-xs text-muted sm:inline">
          {{ DIFFICULTY_LABEL[exercise.difficulty] }}
        </span>
        <span class="flex shrink-0 items-center gap-3 pr-1 text-xs">
          <RouterLink
            :to="{ name: 'lesson', params: { trackId: track.id, exerciseId: exercise.id } }"
            class="text-accent hover:underline"
          >
            Teoría
          </RouterLink>
          <span class="text-line">|</span>
          <RouterLink
            :to="{ name: 'exercise', params: { trackId: track.id, exerciseId: exercise.id } }"
            class="text-muted hover:text-fg"
          >
            Práctica
          </RouterLink>
        </span>
      </li>
    </ol>

    <template v-if="project">
      <p class="mt-12 text-xs uppercase tracking-wider text-muted">Cierre de la pista</p>
      <RouterLink
        :to="{ name: 'lesson', params: { trackId: track.id, exerciseId: project.id } }"
        class="mt-3 block rounded-lg border border-line p-5 transition-colors hover:bg-ink-900"
      >
        <div class="flex items-baseline justify-between gap-4">
          <h2 class="text-base font-medium">
            {{ project.title }}
            <span v-if="isCompleted(project.id)" class="ml-1 text-sm text-pass">✓</span>
          </h2>
          <span class="shrink-0 text-xs text-muted">proyecto final</span>
        </div>
        <p class="mt-1.5 text-xs text-muted">{{ project.concepts.join(' · ') }}</p>
      </RouterLink>
    </template>
  </main>

  <main v-else class="mx-auto max-w-4xl px-6 py-14">
    <p class="text-muted">Esa pista no existe.</p>
    <RouterLink to="/" class="mt-4 inline-block text-sm text-accent">Volver al inicio</RouterLink>
  </main>
</template>
