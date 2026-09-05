<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { findExercise, findTrack, nextExercise } from '@/content'
import { createRunner } from '@/engine'
import { useProgress } from '@/composables/useProgress'
import type { RunResult, Runner } from '@/types/exercise'
import CodeEditor from '@/components/CodeEditor.vue'
import MarkdownBlock from '@/components/MarkdownBlock.vue'
import ResultsPanel from '@/components/ResultsPanel.vue'
import LevelBadge from '@/components/LevelBadge.vue'

const props = defineProps<{ trackId: string; exerciseId: string }>()

const track = computed(() => findTrack(props.trackId))
const exercise = computed(() => findExercise(props.trackId, props.exerciseId))
const siguiente = computed(() =>
  exercise.value ? nextExercise(exercise.value.language, exercise.value.id) : undefined,
)

const { isCompleted, markCompleted, savedCode, saveCode, clearCode } = useProgress()

type Tab = 'teoria' | 'enunciado' | 'tests' | 'solucion'
const tab = ref<Tab>('enunciado')
const code = ref('')
const result = ref<RunResult | null>(null)
const running = ref(false)
const visibleHints = ref(0)
const solutionRevealed = ref(false)

let runner: Runner | null = null

/** Cada ejercicio arranca con el codigo guardado o, si no hay, con la plantilla. */
function loadExercise() {
  const current = exercise.value
  result.value = null
  running.value = false
  visibleHints.value = 0
  solutionRevealed.value = false
  // La teoria ya se ha leido en su propio apartado: aqui se abre el enunciado.
  tab.value = 'enunciado'
  code.value = current ? (savedCode(current.id) ?? current.starterCode) : ''

  runner?.dispose()
  runner = current ? createRunner(current.language) : null
}

watch(() => [props.trackId, props.exerciseId], loadExercise, { immediate: true })

// Autoguardado: no se pierde el trabajo al recargar ni al cambiar de ejercicio.
watch(code, (value) => {
  if (exercise.value) saveCode(exercise.value.id, value)
})

onBeforeUnmount(() => runner?.dispose())

async function run() {
  const current = exercise.value
  if (!current || !runner || running.value) return

  running.value = true
  try {
    const outcome = await runner.run(current, code.value)
    result.value = outcome
    if (outcome.ok) markCompleted(current.id)
  } finally {
    running.value = false
  }
}

function reset() {
  const current = exercise.value
  if (!current) return
  code.value = current.starterCode
  clearCode(current.id)
  result.value = null
}

function revealSolution() {
  solutionRevealed.value = true
  tab.value = 'solucion'
}

function copySolutionToEditor() {
  if (exercise.value) code.value = exercise.value.solution
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'enunciado', label: 'Enunciado' },
  { id: 'teoria', label: 'Teoría' },
  { id: 'tests', label: 'Tests' },
]
</script>

<template>
  <main v-if="exercise && track" class="mx-auto max-w-[1700px] px-6 py-6">
    <div class="flex flex-wrap items-center justify-between gap-4 pb-5">
      <div class="min-w-0">
        <RouterLink
          :to="{ name: 'track', params: { trackId: track.id } }"
          class="text-sm text-muted hover:text-fg"
        >
          ← {{ track.name }}
        </RouterLink>
        <h1 class="mt-1.5 flex items-center gap-3 truncate text-2xl font-semibold tracking-tight">
          {{ exercise.title }}
          <span v-if="isCompleted(exercise.id)" class="text-xl text-pass">✓</span>
        </h1>
      </div>
      <div class="flex items-center gap-4">
        <RouterLink
          :to="{ name: 'lesson', params: { trackId: track.id, exerciseId: exercise.id } }"
          class="rounded-md border border-line px-3 py-1.5 text-sm text-muted transition-colors hover:border-fg/30 hover:text-fg"
        >
          Repasar la teoría
        </RouterLink>
        <LevelBadge :difficulty="exercise.difficulty" :kind="exercise.kind" />
      </div>
    </div>

    <div class="grid gap-px overflow-hidden rounded-xl border border-line bg-line lg:h-[calc(100vh-11rem)] lg:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
      <!-- Panel izquierdo: teoría, enunciado, tests y (bajo demanda) solución -->
      <section class="flex min-h-0 flex-col bg-ink-950">
        <nav class="flex shrink-0 border-b border-line">
          <button
            v-for="item in TABS"
            :key="item.id"
            type="button"
            class="border-b-2 px-5 py-3 text-sm transition-colors"
            :class="tab === item.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-fg'"
            @click="tab = item.id"
          >
            {{ item.label }}
          </button>
          <button
            v-if="solutionRevealed"
            type="button"
            class="border-b-2 px-5 py-3 text-sm transition-colors"
            :class="
              tab === 'solucion'
                ? 'border-lang-sql text-lang-sql'
                : 'border-transparent text-muted hover:text-fg'
            "
            @click="tab = 'solucion'"
          >
            Solución
          </button>
        </nav>

        <div class="min-h-0 flex-1 overflow-y-auto p-6">
          <MarkdownBlock v-if="tab === 'teoria'" :source="exercise.theory" />

          <template v-else-if="tab === 'enunciado'">
            <MarkdownBlock :source="exercise.brief" />

            <div v-if="exercise.hints.length" class="mt-10 border-t border-line pt-6">
              <ul class="space-y-3">
                <li
                  v-for="(hint, index) in exercise.hints.slice(0, visibleHints)"
                  :key="index"
                  class="rounded-md border-l-2 border-warn bg-warn/5 py-2.5 pl-4 pr-3 text-base text-fg/80"
                >
                  <span class="mr-2 font-mono text-sm text-warn">{{ index + 1 }}</span>{{ hint }}
                </li>
              </ul>
              <button
                v-if="visibleHints < exercise.hints.length"
                type="button"
                class="mt-4 rounded-md border border-warn/40 bg-warn/10 px-3.5 py-1.5 text-sm text-warn transition-colors hover:bg-warn/20"
                @click="visibleHints++"
              >
                Ver pista {{ visibleHints + 1 }} de {{ exercise.hints.length }}
              </button>
              <button
                v-else-if="!solutionRevealed"
                type="button"
                class="mt-4 rounded-md border border-line px-3.5 py-1.5 text-sm text-muted transition-colors hover:border-fg/30 hover:text-fg"
                @click="revealSolution"
              >
                Ver la solución
              </button>
            </div>
          </template>

          <template v-else-if="tab === 'tests'">
            <p class="mb-5 text-base text-muted">
              Estas son las comprobaciones que se ejecutan contra tu código.
            </p>
            <ol class="space-y-5">
              <li v-for="(test, index) in exercise.tests" :key="test.name">
                <p class="text-base text-fg/85">
                  <span class="mr-2 font-mono text-sm text-accent">{{ index + 1 }}</span>
                  {{ test.name }}
                </p>
                <pre class="mt-2 overflow-x-auto rounded-lg border border-line border-l-2 border-l-accent bg-ink-900 p-3.5 font-mono text-sm leading-relaxed text-fg/75">{{ test.code.trim() }}</pre>
              </li>
            </ol>
          </template>

          <template v-else>
            <div class="mb-5 flex items-center justify-between gap-3">
              <p class="text-base text-muted">Una solución posible (no la única).</p>
              <button
                type="button"
                class="shrink-0 rounded-md border border-lang-sql/40 bg-lang-sql/10 px-3.5 py-1.5 text-sm text-lang-sql transition-colors hover:bg-lang-sql/20"
                @click="copySolutionToEditor"
              >
                Copiar al editor
              </button>
            </div>
            <pre class="overflow-x-auto rounded-lg border border-line border-l-2 border-l-lang-sql bg-ink-900 p-3.5 font-mono text-sm leading-relaxed text-fg/80">{{ exercise.solution.trim() }}</pre>
          </template>
        </div>
      </section>

      <!-- Panel derecho: editor arriba, resultados abajo -->
      <section class="grid min-h-0 grid-rows-[minmax(0,1fr)_minmax(0,380px)] gap-px bg-line">
        <div class="flex min-h-[420px] flex-col bg-ink-950">
          <div class="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-2.5">
            <span class="flex items-center gap-2.5 font-mono text-sm text-muted">
              <span class="size-2 rounded-full bg-lang-typescript" />
              solucion.ts
            </span>
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="rounded-md border border-line px-3.5 py-1.5 text-sm text-muted transition-colors hover:border-fg/30 hover:text-fg"
                @click="reset"
              >
                Reiniciar
              </button>
              <button
                type="button"
                class="rounded-md border border-accent/50 bg-accent/15 px-4 py-1.5 text-sm font-medium text-accent transition-colors hover:bg-accent/25 disabled:opacity-50"
                :disabled="running"
                @click="run"
              >
                {{ running ? 'Ejecutando…' : 'Ejecutar' }}
              </button>
            </div>
          </div>
          <div class="min-h-0 flex-1">
            <CodeEditor v-model="code" @run="run" />
          </div>
        </div>

        <div class="flex min-h-0 flex-col bg-ink-950">
          <div class="flex shrink-0 items-center justify-between border-b border-line px-5 py-2.5">
            <span class="font-mono text-sm text-muted">resultados</span>
            <RouterLink
              v-if="result?.ok && siguiente"
              :to="{ name: 'exercise', params: { trackId: track.id, exerciseId: siguiente.id } }"
              class="rounded-md border border-pass/50 bg-pass/15 px-3.5 py-1.5 text-sm font-medium text-pass transition-colors hover:bg-pass/25"
            >
              Siguiente ejercicio →
            </RouterLink>
          </div>
          <div class="min-h-0 flex-1">
            <ResultsPanel :result="result" :running="running" />
          </div>
        </div>
      </section>
    </div>
  </main>

  <main v-else class="mx-auto max-w-4xl px-6 py-14">
    <p class="text-muted">Ese ejercicio no existe.</p>
    <RouterLink to="/" class="mt-4 inline-block text-accent">Volver al inicio</RouterLink>
  </main>
</template>
