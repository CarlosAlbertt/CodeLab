<script setup lang="ts">
import { ref } from 'vue'
import type { OrderQuestion } from '@/types/exercise'

const props = defineProps<{ question: OrderQuestion; answer: string[]; checked: boolean }>()
const emit = defineEmits<{ 'update:answer': [value: string[]] }>()

const dragging = ref<number | null>(null)

function move(from: number, to: number) {
  if (props.checked || from === to || to < 0 || to >= props.answer.length) return
  const next = [...props.answer]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item!)
  emit('update:answer', next)
}

function onDrop(index: number) {
  if (dragging.value !== null) move(dragging.value, index)
  dragging.value = null
}

/** Tras comprobar, cada linea se marca segun este en su sitio o no. */
function lineClass(index: number): string {
  if (!props.checked) return 'border-line bg-ink-800 hover:border-accent/50'
  return props.answer[index] === props.question.lines[index]
    ? 'border-pass/60 bg-pass/10'
    : 'border-fail/60 bg-fail/10'
}
</script>

<template>
  <ol class="flex flex-col gap-2">
    <li
      v-for="(line, index) in answer"
      :key="line"
      :draggable="!checked"
      class="flex items-center gap-3 rounded-md border px-3 py-2 transition-colors"
      :class="[lineClass(index), checked ? '' : 'cursor-grab active:cursor-grabbing']"
      @dragstart="dragging = index"
      @dragend="dragging = null"
      @dragover.prevent
      @drop.prevent="onDrop(index)"
    >
      <span class="shrink-0 font-mono text-xs text-muted">{{ index + 1 }}</span>
      <code class="min-w-0 flex-1 whitespace-pre font-mono text-sm text-fg/85">{{ line }}</code>
      <span v-if="!checked" class="flex shrink-0 flex-col leading-none">
        <button
          type="button"
          class="px-1 text-xs text-muted transition-colors hover:text-fg disabled:opacity-30"
          :disabled="index === 0"
          aria-label="Subir"
          @click="move(index, index - 1)"
        >
          ▲
        </button>
        <button
          type="button"
          class="px-1 text-xs text-muted transition-colors hover:text-fg disabled:opacity-30"
          :disabled="index === answer.length - 1"
          aria-label="Bajar"
          @click="move(index, index + 1)"
        >
          ▼
        </button>
      </span>
    </li>
  </ol>
</template>
