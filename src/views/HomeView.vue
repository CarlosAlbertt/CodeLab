<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { tracks } from '@/content'
import { useProgress } from '@/composables/useProgress'
import { LANGUAGE_STYLE } from '@/utils/tracks'

const { isRead, nextUp, trackProgress } = useProgress()

const ready = computed(() => tracks.filter((track) => track.status === 'ready'))

/** Pista sobre la que retomar: la primera empezada y sin terminar, o la primera de todas. */
const resume = computed(() => {
  const started = ready.value.find((track) => {
    const { done, total } = trackProgress(track.id)
    return done > 0 && done < total
  })
  const track = started ?? ready.value.find((item) => trackProgress(item.id).done === 0)
  const exercise = track ? nextUp(track.id) : undefined
  return track && exercise ? { track, exercise } : undefined
})
</script>

<template>
  <main class="mx-auto max-w-6xl px-6 py-16">
    <h1 class="text-4xl font-semibold tracking-tight">Pistas de práctica</h1>
    <p class="mt-3 max-w-2xl text-lg leading-relaxed text-muted">
      Cada pista se recorre igual: teoría, caso práctico y, al final, un proyecto completo.
      Escribes el código, lo ejecutas y ves exactamente qué falla.
    </p>

    <RouterLink
      v-if="resume"
      :to="{
        name: isRead(resume.exercise.id) ? 'exercise' : 'lesson',
        params: { trackId: resume.track.id, exerciseId: resume.exercise.id },
      }"
      class="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line p-5 transition-colors hover:bg-ink-900"
      :class="LANGUAGE_STYLE[resume.track.id].border"
    >
      <span class="size-2.5 rounded-full" :class="LANGUAGE_STYLE[resume.track.id].dot" />
      <span class="text-sm uppercase tracking-wider text-muted">
        {{ trackProgress(resume.track.id).done === 0 ? 'Empezar' : 'Continuar' }}
      </span>
      <span class="text-lg">{{ resume.exercise.title }}</span>
      <span class="ml-auto text-sm" :class="LANGUAGE_STYLE[resume.track.id].text">
        {{ resume.track.name }} →
      </span>
    </RouterLink>

    <ul class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="track in tracks" :key="track.id">
        <component
          :is="track.status === 'ready' ? RouterLink : 'div'"
          :to="track.status === 'ready' ? { name: 'track', params: { trackId: track.id } } : undefined"
          class="flex h-full flex-col rounded-xl border border-line p-6 transition-colors"
          :class="
            track.status === 'ready'
              ? ['hover:bg-ink-900', LANGUAGE_STYLE[track.id].border]
              : 'cursor-default opacity-50'
          "
        >
          <div class="flex items-center gap-2.5">
            <span class="size-2.5 rounded-full" :class="LANGUAGE_STYLE[track.id].dot" />
            <h2 class="text-xl font-medium">{{ track.name }}</h2>
            <span
              v-if="track.status === 'soon'"
              class="ml-auto rounded-full border border-line px-2.5 py-0.5 text-xs text-muted"
            >
              próximamente
            </span>
            <span
              v-else
              class="ml-auto font-mono text-sm"
              :class="LANGUAGE_STYLE[track.id].text"
            >
              {{ trackProgress(track.id).done }}/{{ trackProgress(track.id).total }}
            </span>
          </div>

          <p class="mt-2 text-base text-muted">{{ track.tagline }}</p>
          <p class="mt-5 text-[0.9375rem] leading-relaxed text-fg/60">{{ track.description }}</p>
        </component>
      </li>
    </ul>
  </main>
</template>
