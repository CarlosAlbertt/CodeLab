<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { findTrack } from '@/content'
import { useProgress } from '@/composables/useProgress'
import { LANGUAGE_STYLE } from '@/utils/tracks'
import LevelBadge from '@/components/LevelBadge.vue'

const props = defineProps<{ trackId: string }>()

const track = computed(() => findTrack(props.trackId))
// El proyecto final se lista aparte: no es una unidad mas, es el cierre de la pista.
const units = computed(() => track.value?.exercises.filter((item) => item.kind !== 'project') ?? [])
const project = computed(() => track.value?.exercises.find((item) => item.kind === 'project'))

const { isCompleted, isRead, nextUp, trackProgress } = useProgress()
const pending = computed(() => (track.value ? nextUp(track.value.id) : undefined))
const progress = computed(() => (track.value ? trackProgress(track.value.id) : { done: 0, total: 0 }))
</script>

<template>
  <main v-if="track" class="mx-auto max-w-4xl px-6 py-14">
    <RouterLink to="/" class="text-sm text-muted hover:text-fg">← todas las pistas</RouterLink>

    <div class="mt-5 flex flex-wrap items-center gap-3">
      <span class="size-3 rounded-full" :class="LANGUAGE_STYLE[track.id].dot" />
      <h1 class="text-3xl font-semibold tracking-tight">{{ track.name }}</h1>
      <span class="ml-auto font-mono text-sm text-muted">
        <span :class="LANGUAGE_STYLE[track.id].text">{{ progress.done }}</span>/{{ progress.total }}
        superados
      </span>
    </div>

    <!-- Barra de avance: el color de la pista sobre la linea neutra. -->
    <div class="mt-4 h-1 overflow-hidden rounded-full bg-line">
      <div
        class="h-full rounded-full transition-all"
        :class="LANGUAGE_STYLE[track.id].dot"
        :style="{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }"
      />
    </div>

    <p class="mt-5 max-w-2xl text-base leading-relaxed text-muted">{{ track.description }}</p>

    <!-- Atajo al siguiente paso: evita tener que buscarlo en la lista. -->
    <RouterLink
      v-if="pending"
      :to="{
        name: isRead(pending.id) ? 'exercise' : 'lesson',
        params: { trackId: track.id, exerciseId: pending.id },
      }"
      class="mt-6 inline-flex items-center gap-3 rounded-lg border border-accent/40 bg-accent/15 px-5 py-3 text-base text-accent transition-colors hover:bg-accent/25"
    >
      <span class="font-medium">
        {{ progress.done === 0 ? 'Empezar por' : 'Continuar por' }}
      </span>
      <span class="text-fg/90">{{ pending.title }}</span>
      <span aria-hidden="true">→</span>
    </RouterLink>
    <p v-else class="mt-6 text-base text-pass">Pista completa. Nada mal.</p>

    <h2 class="mt-12 text-sm font-medium uppercase tracking-wider text-muted">Unidades</h2>
    <ol class="mt-4 divide-y divide-line border-y border-line">
      <li
        v-for="(exercise, index) in units"
        :key="exercise.id"
        class="flex flex-wrap items-center gap-x-5 gap-y-3 py-5"
      >
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs"
          :class="
            isCompleted(exercise.id)
              ? 'border-pass/40 bg-pass/10 text-pass'
              : 'border-line text-muted'
          "
        >
          {{ isCompleted(exercise.id) ? '✓' : String(index + 1).padStart(2, '0') }}
        </span>

        <span class="min-w-0 flex-1">
          <span class="block truncate text-lg">{{ exercise.title }}</span>
          <span class="mt-1 block truncate text-sm text-muted">
            {{ exercise.concepts.join(' · ') }}
          </span>
        </span>

        <LevelBadge :difficulty="exercise.difficulty" />

        <span class="flex shrink-0 items-center gap-3 text-sm">
          <!-- La teoría ya leída se apaga: así destaca lo que queda por hacer. -->
          <RouterLink
            :to="{ name: 'lesson', params: { trackId: track.id, exerciseId: exercise.id } }"
            class="rounded-md border px-3 py-1.5 transition-colors"
            :class="
              isRead(exercise.id)
                ? 'border-line text-muted hover:border-fg/30 hover:text-fg'
                : 'border-accent/40 bg-accent/10 text-accent hover:bg-accent/20'
            "
          >
            Teoría
          </RouterLink>
          <RouterLink
            :to="{ name: 'exercise', params: { trackId: track.id, exerciseId: exercise.id } }"
            class="rounded-md border border-line px-3 py-1.5 text-muted transition-colors hover:border-fg/30 hover:text-fg"
          >
            Práctica
          </RouterLink>
        </span>
      </li>
    </ol>

    <template v-if="project">
      <h2 class="mt-14 text-sm font-medium uppercase tracking-wider text-muted">
        Cierre de la pista
      </h2>
      <RouterLink
        :to="{ name: 'lesson', params: { trackId: track.id, exerciseId: project.id } }"
        class="mt-4 block rounded-xl border border-lang-sql/30 bg-lang-sql/5 p-6 transition-colors hover:border-lang-sql/60 hover:bg-lang-sql/10"
      >
        <div class="flex flex-wrap items-center gap-3">
          <h3 class="text-xl font-medium">{{ project.title }}</h3>
          <span v-if="isCompleted(project.id)" class="text-lg text-pass">✓</span>
          <LevelBadge class="ml-auto" :difficulty="project.difficulty" kind="project" />
        </div>
        <p class="mt-2 text-sm text-muted">{{ project.concepts.join(' · ') }}</p>
      </RouterLink>
    </template>
  </main>

  <main v-else class="mx-auto max-w-4xl px-6 py-14">
    <p class="text-muted">Esa pista no existe.</p>
    <RouterLink to="/" class="mt-4 inline-block text-accent">Volver al inicio</RouterLink>
  </main>
</template>
