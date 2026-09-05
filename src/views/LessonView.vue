<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { findExercise, findTrack } from '@/content'
import { useProgress } from '@/composables/useProgress'
import { LANGUAGE_STYLE } from '@/utils/tracks'
import MarkdownBlock from '@/components/MarkdownBlock.vue'
import TheoryQuiz from '@/components/TheoryQuiz.vue'
import LevelBadge from '@/components/LevelBadge.vue'

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
  <main v-if="exercise && track" class="mx-auto max-w-3xl px-6 py-14">
    <RouterLink
      :to="{ name: 'track', params: { trackId: track.id } }"
      class="text-sm text-muted hover:text-fg"
    >
      ← {{ track.name }}
    </RouterLink>

    <header class="mt-5 border-b border-line pb-8">
      <p
        class="font-mono text-sm font-medium uppercase tracking-wider"
        :class="exercise.kind === 'project' ? 'text-lang-sql' : LANGUAGE_STYLE[track.id].text"
      >
        {{ exercise.kind === 'project' ? 'Proyecto final' : `Teoría · unidad ${position}` }}
      </p>
      <h1 class="mt-3 text-4xl font-semibold tracking-tight">{{ exercise.title }}</h1>
      <div class="mt-4 flex flex-wrap items-center gap-3">
        <LevelBadge :difficulty="exercise.difficulty" :kind="exercise.kind" />
        <span class="text-sm text-muted">{{ exercise.concepts.join(' · ') }}</span>
      </div>
    </header>

    <article class="py-10">
      <MarkdownBlock :source="exercise.theory" />
    </article>

    <TheoryQuiz v-if="exercise.quiz.length" :key="exercise.id" :questions="exercise.quiz" />

    <!-- La teoría siempre termina llevando al caso práctico. -->
    <footer class="mt-10 flex flex-wrap items-center justify-between gap-5 border-t border-line pt-8">
      <p class="text-base text-muted">
        {{
          isCompleted(exercise.id)
            ? 'Ya superaste este caso práctico. Puedes repetirlo cuando quieras.'
            : 'Cuando lo tengas claro, pasa al caso práctico.'
        }}
      </p>
      <RouterLink
        :to="{ name: 'exercise', params: { trackId: track.id, exerciseId: exercise.id } }"
        class="rounded-lg border border-accent/40 bg-accent/15 px-5 py-2.5 text-base font-medium text-accent transition-colors hover:bg-accent/25"
      >
        {{ exercise.kind === 'project' ? 'Empezar el proyecto' : 'Ir al caso práctico' }} →
      </RouterLink>
    </footer>
  </main>

  <main v-else class="mx-auto max-w-3xl px-6 py-14">
    <p class="text-muted">Esa unidad no existe.</p>
    <RouterLink to="/" class="mt-4 inline-block text-accent">Volver al inicio</RouterLink>
  </main>
</template>
