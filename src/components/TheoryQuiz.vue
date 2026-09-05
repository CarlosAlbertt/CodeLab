<script setup lang="ts">
import { computed, ref } from 'vue'
import type { QuizQuestion } from '@/types/exercise'
import { isCorrect } from '@/utils/quiz'

const props = defineProps<{ questions: QuizQuestion[] }>()

const given = ref<string[]>(props.questions.map(() => ''))
const checked = ref(false)
const revealed = ref(false)

const results = computed(() =>
  props.questions.map((question, index) => isCorrect(given.value[index] ?? '', question.answers)),
)
const rightCount = computed(() => results.value.filter(Boolean).length)
const allRight = computed(() => rightCount.value === props.questions.length)

/** El fragmento se parte por ___ para meter el campo dentro del propio código. */
function pieces(snippet: string): [string, string] {
  const index = snippet.indexOf('___')
  return index === -1 ? [snippet, ''] : [snippet.slice(0, index), snippet.slice(index + 3)]
}

function check() {
  checked.value = true
}

function retry() {
  given.value = props.questions.map(() => '')
  checked.value = false
  revealed.value = false
}
</script>

<template>
  <section class="rounded-xl border border-line bg-ink-900/60 p-6">
    <h2 class="text-xl font-semibold">Comprueba que lo has cogido</h2>
    <p class="mt-1.5 text-base text-muted">
      Rellena el hueco de cada ejemplo. No cuenta para el progreso: es solo para ti.
    </p>

    <ol class="mt-6 space-y-5">
      <li
        v-for="(question, index) in questions"
        :key="index"
        class="rounded-lg border border-l-2 p-4 transition-colors"
        :class="
          !checked
            ? 'border-line border-l-accent bg-ink-950'
            : results[index]
              ? 'border-pass/30 border-l-pass bg-pass/5'
              : 'border-fail/30 border-l-fail bg-fail/5'
        "
      >
        <p class="flex items-start gap-2.5 text-base">
          <span class="font-mono text-sm text-muted">{{ index + 1 }}</span>
          <span>{{ question.prompt }}</span>
          <span v-if="checked" class="ml-auto shrink-0" :class="results[index] ? 'text-pass' : 'text-fail'">
            {{ results[index] ? '✓' : '✗' }}
          </span>
        </p>

        <pre class="mt-3 overflow-x-auto rounded-md border border-line bg-ink-900 p-3.5 font-mono text-sm leading-relaxed text-fg/80"><span>{{ pieces(question.snippet)[0] }}</span><input
          v-model="given[index]"
          type="text"
          spellcheck="false"
          autocomplete="off"
          class="mx-0.5 w-32 rounded border-b-2 bg-ink-800 px-2 py-0.5 font-mono text-sm text-fg outline-none transition-colors focus:border-accent"
          :class="!checked ? 'border-line' : results[index] ? 'border-pass' : 'border-fail'"
          @keyup.enter="check"
        /><span>{{ pieces(question.snippet)[1] }}</span></pre>

        <p v-if="checked && (results[index] || revealed)" class="mt-3 text-sm text-muted">
          <span v-if="!results[index]" class="font-mono text-fail">
            {{ question.answers[0] }} —
          </span>
          {{ question.explanation }}
        </p>
      </li>
    </ol>

    <div class="mt-6 flex flex-wrap items-center gap-4">
      <button
        type="button"
        class="rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-base font-medium text-accent transition-colors hover:bg-accent/25"
        @click="check"
      >
        Comprobar
      </button>
      <button
        v-if="checked && !allRight && !revealed"
        type="button"
        class="rounded-lg border border-line px-4 py-2 text-base text-muted transition-colors hover:border-fg/30 hover:text-fg"
        @click="revealed = true"
      >
        Ver respuestas
      </button>
      <button
        v-if="checked"
        type="button"
        class="text-base text-muted transition-colors hover:text-fg"
        @click="retry"
      >
        Empezar de nuevo
      </button>

      <span v-if="checked" class="ml-auto text-base" :class="allRight ? 'text-pass' : 'text-warn'">
        {{ rightCount }} de {{ questions.length }} correctas
      </span>
    </div>
  </section>
</template>
