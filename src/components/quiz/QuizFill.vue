<script setup lang="ts">
import type { FillQuestion } from '@/types/exercise'
import { splitSnippet } from '@/utils/quiz'

defineProps<{ question: FillQuestion; answer: string; checked: boolean; correct: boolean }>()
const emit = defineEmits<{ 'update:answer': [value: string]; submit: [] }>()
</script>

<template>
  <pre class="overflow-x-auto rounded-md border border-line bg-ink-900 p-3.5 font-mono text-sm leading-relaxed text-fg/80"><span>{{ splitSnippet(question.snippet)[0] }}</span><input
    :value="answer"
    type="text"
    spellcheck="false"
    autocomplete="off"
    class="mx-0.5 w-32 rounded border-b-2 bg-ink-800 px-2 py-0.5 font-mono text-sm text-fg outline-none transition-colors focus:border-accent"
    :class="!checked ? 'border-line' : correct ? 'border-pass' : 'border-fail'"
    @input="emit('update:answer', ($event.target as HTMLInputElement).value)"
    @keyup.enter="emit('submit')"
  /><span>{{ splitSnippet(question.snippet)[1] }}</span></pre>
</template>
