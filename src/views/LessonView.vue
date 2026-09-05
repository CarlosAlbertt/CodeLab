<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { findExercise, findTrack } from '@/content'
import { useProgress } from '@/composables/useProgress'
import MarkdownBlock from '@/components/MarkdownBlock.vue'

const props = defineProps<{ trackId: string; exerciseId: string }>()

const track = computed(() => findTrack(props.trackId))
const exercise = computed(() => findExercise(props.trackId, props.exerciseId))
const position = computed(() => {
  const exercises = track.value?.exercises ?? []
  return exercises.findIndex((item) => item.id === props.exerciseId) + 1
})

const { isCompleted } = useProgress()
</script>

<template>
  <main v-if="exercise && track" class="mx-auto max-w-3xl px-6 py-12">
    <RouterLink
      :to="{ name: 'track', params: { trackId: track.id } }"
      class="text-xs text-muted hover:text-fg"
    >
      ← {{ track.name }}
    </RouterLink>

    <header class="mt-4 border-b border-line pb-6">
      <p class="font-mono text-xs uppercase tracking-wider text-accent">
        {{ exercise.kind === 'project' ? 'Proyecto final' : `Teoría · unidad ${position}` }}
      </p>
      <h1 class="mt-2 text-2xl font-semibold tracking-tight">{{ exercise.title }}</h1>
      <p class="mt-2 text-sm text-muted">{{ exercise.concepts.join(' · ') }}</p>
    </header>

    <article class="py-8">
      <MarkdownBlock :source="exercise.theory" />
    </article>

    <!-- La teoría siempre termina llevando al caso práctico. -->
    <footer class="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
      <p class="text-sm text-muted">
        {{
          isCompleted(exercise.id)
            ? 'Ya superaste este caso práctico. Puedes repetirlo cuando quieras.'
            : 'Cuando lo tengas claro, pasa al caso práctico.'
        }}
      </p>
      <RouterLink
        :to="{ name: 'exercise', params: { trackId: track.id, exerciseId: exercise.id } }"
        class="rounded border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent transition-colors hover:bg-accent/20"
      >
        {{ exercise.kind === 'project' ? 'Empezar el proyecto' : 'Ir al caso práctico' }} →
      </RouterLink>
    </footer>
  </main>

  <main v-else class="mx-auto max-w-3xl px-6 py-14">
    <p class="text-muted">Esa unidad no existe.</p>
    <RouterLink to="/" class="mt-4 inline-block text-sm text-accent">Volver al inicio</RouterLink>
  </main>
</template>
