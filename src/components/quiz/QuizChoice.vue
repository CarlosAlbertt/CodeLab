<script setup lang="ts">
import type { ChoiceQuestion } from '@/types/exercise'

const props = defineProps<{
  question: ChoiceQuestion
  answer: number | null
  checked: boolean
  correct: boolean
}>()
const emit = defineEmits<{ 'update:answer': [value: number] }>()

/** Tras comprobar se marca en verde la correcta y en rojo la elegida si fallo. */
function optionClass(index: number): string {
  if (!props.checked) {
    return props.answer === index
      ? 'border-accent bg-accent/10 text-fg'
      : 'border-line text-fg/80 hover:border-fg/30'
  }
  if (index === props.question.correct) return 'border-pass bg-pass/10 text-pass'
  if (index === props.answer) return 'border-fail bg-fail/10 text-fail'
  return 'border-line text-muted'
}
</script>

<template>
  <div>
    <pre
      v-if="question.snippet"
      class="mb-3 overflow-x-auto rounded-md border border-line bg-ink-900 p-3.5 font-mono text-sm leading-relaxed text-fg/80"
    >{{ question.snippet }}</pre>

    <div class="flex flex-col gap-2">
      <button
        v-for="(option, index) in question.options"
        :key="index"
        type="button"
        :disabled="checked"
        class="rounded-md border px-3.5 py-2 text-left font-mono text-sm transition-colors"
        :class="optionClass(index)"
        @click="emit('update:answer', index)"
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>
