<script setup lang="ts">
import { computed, ref } from 'vue'
import type { QuizAnswer, QuizQuestion } from '@/types/exercise'
import { correctAnswerText, initialAnswer, isQuestionCorrect } from '@/utils/quiz'
import QuizFill from '@/components/quiz/QuizFill.vue'
import QuizChoice from '@/components/quiz/QuizChoice.vue'
import QuizDrag from '@/components/quiz/QuizDrag.vue'
import QuizOrder from '@/components/quiz/QuizOrder.vue'

const props = defineProps<{ questions: QuizQuestion[] }>()

const answers = ref<QuizAnswer[]>(props.questions.map(initialAnswer))
const checked = ref(false)
const revealed = ref(false)

const results = computed(() =>
  props.questions.map((question, index) => isQuestionCorrect(question, answers.value[index]!)),
)
const rightCount = computed(() => results.value.filter(Boolean).length)
const allRight = computed(() => rightCount.value === props.questions.length)

const HELP: Record<QuizQuestion['kind'], string> = {
  fill: 'Escribe lo que falta',
  choice: 'Elige una opción',
  drag: 'Arrastra las fichas a su hueco',
  order: 'Ordena las líneas',
}

function setAnswer(index: number, value: QuizAnswer) {
  answers.value[index] = value
}

function retry() {
  answers.value = props.questions.map(initialAnswer)
  checked.value = false
  revealed.value = false
}
</script>

<template>
  <section class="rounded-xl border border-line bg-ink-900/60 p-6">
    <h2 class="text-xl font-semibold">Comprueba que lo has cogido</h2>
    <p class="mt-1.5 text-base text-muted">
      Un repaso rápido de cada punto. No cuenta para el progreso: es solo para ti.
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
        <div class="mb-3 flex items-start gap-2.5">
          <span class="font-mono text-sm text-muted">{{ index + 1 }}</span>
          <div class="min-w-0 flex-1">
            <p class="text-base">{{ question.prompt }}</p>
            <p class="mt-0.5 text-sm text-muted">{{ HELP[question.kind] }}</p>
          </div>
          <span v-if="checked" class="shrink-0" :class="results[index] ? 'text-pass' : 'text-fail'">
            {{ results[index] ? '✓' : '✗' }}
          </span>
        </div>

        <QuizFill
          v-if="question.kind === 'fill'"
          :question="question"
          :answer="(answers[index] as string)"
          :checked="checked"
          :correct="results[index]!"
          @update:answer="setAnswer(index, $event)"
          @submit="checked = true"
        />
        <QuizChoice
          v-else-if="question.kind === 'choice'"
          :question="question"
          :answer="(answers[index] as number | null)"
          :checked="checked"
          :correct="results[index]!"
          @update:answer="setAnswer(index, $event)"
        />
        <QuizDrag
          v-else-if="question.kind === 'drag'"
          :question="question"
          :answer="(answers[index] as (number | null)[])"
          :checked="checked"
          @update:answer="setAnswer(index, $event)"
        />
        <QuizOrder
          v-else
          :question="question"
          :answer="(answers[index] as string[])"
          :checked="checked"
          @update:answer="setAnswer(index, $event)"
        />

        <p v-if="checked && (results[index] || revealed)" class="mt-3 text-sm text-muted">
          <span v-if="!results[index]" class="font-mono text-fail">
            {{ correctAnswerText(question) }} —
          </span>
          {{ question.explanation }}
        </p>
      </li>
    </ol>

    <div class="mt-6 flex flex-wrap items-center gap-4">
      <button
        type="button"
        class="rounded-lg border border-accent/40 bg-accent/15 px-4 py-2 text-base font-medium text-accent transition-colors hover:bg-accent/25"
        @click="checked = true"
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
