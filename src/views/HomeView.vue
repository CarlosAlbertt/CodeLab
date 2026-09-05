<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { tracks } from '@/content'
import { useProgress } from '@/composables/useProgress'

const { trackProgress } = useProgress()
</script>

<template>
  <main class="mx-auto max-w-6xl px-6 py-14">
    <h1 class="text-2xl font-semibold tracking-tight">Pistas de práctica</h1>
    <p class="mt-2 max-w-2xl text-muted">
      Ejercicios cortos con enunciado, tests y solución. Escribes el código, lo ejecutas y ves
      exactamente qué falla.
    </p>

    <ul class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="track in tracks" :key="track.id" class="overflow-hidden rounded-lg border border-line">
        <component
          :is="track.status === 'ready' ? RouterLink : 'div'"
          :to="track.status === 'ready' ? { name: 'track', params: { trackId: track.id } } : undefined"
          class="flex h-full flex-col p-6 transition-colors"
          :class="track.status === 'ready' ? 'hover:bg-ink-900' : 'cursor-default opacity-55'"
        >
          <div class="flex items-baseline justify-between gap-3">
            <h2 class="text-base font-medium">{{ track.name }}</h2>
            <span v-if="track.status === 'soon'" class="text-xs text-muted">próximamente</span>
            <span v-else class="font-mono text-xs text-muted">
              {{ trackProgress(track.id).done }}/{{ trackProgress(track.id).total }}
            </span>
          </div>
          <p class="mt-1 text-sm text-muted">{{ track.tagline }}</p>
          <p class="mt-4 text-sm leading-relaxed text-fg/60">{{ track.description }}</p>
        </component>
      </li>
    </ul>
  </main>
</template>
