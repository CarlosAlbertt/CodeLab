<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DragQuestion } from '@/types/exercise'
import { shuffle, splitSnippet } from '@/utils/quiz'

const props = defineProps<{
  question: DragQuestion
  answer: (number | null)[]
  checked: boolean
}>()
const emit = defineEmits<{ 'update:answer': [value: (number | null)[]] }>()

const parts = computed(() => splitSnippet(props.question.snippet))
/**
 * Orden en que se ofrecen las fichas, barajado al montar la pregunta: en el
 * orden del autor, la respuesta saldría colocando las fichas en fila.
 */
const order = shuffle(props.question.pool.map((_, index) => index))
/** Fichas que siguen sin colocar. */
const available = computed(() =>
  order
    .map((index) => ({ token: props.question.pool[index]!, index }))
    .filter((item) => !props.answer.includes(item.index)),
)

const dragging = ref<number | null>(null)
const selected = ref<number | null>(null)

function place(slot: number, poolIndex: number) {
  if (props.checked) return
  // Una ficha solo puede estar en un hueco: se quita de donde estuviera.
  const next = props.answer.map((value) => (value === poolIndex ? null : value))
  next[slot] = poolIndex
  emit('update:answer', next)
  selected.value = null
}

function clearSlot(slot: number) {
  if (props.checked) return
  const next = [...props.answer]
  next[slot] = null
  emit('update:answer', next)
}

function onSlotClick(slot: number) {
  if (props.answer[slot] !== null && props.answer[slot] !== undefined) {
    clearSlot(slot)
    return
  }
  if (selected.value !== null) place(slot, selected.value)
}

function onDrop(slot: number) {
  if (dragging.value !== null) place(slot, dragging.value)
  dragging.value = null
}

function slotClass(slot: number): string {
  const filled = props.answer[slot] !== null && props.answer[slot] !== undefined
  if (!props.checked) {
    return filled
      ? 'border-accent bg-accent/15 text-accent'
      : 'border-dashed border-line bg-ink-800 text-muted'
  }
  const right =
    filled && props.question.pool[props.answer[slot] as number] === props.question.blanks[slot]
  return right ? 'border-pass bg-pass/15 text-pass' : 'border-fail bg-fail/15 text-fail'
}
</script>

<template>
  <div>
    <pre class="overflow-x-auto rounded-md border border-line bg-ink-900 p-3.5 font-mono text-sm leading-relaxed text-fg/80"><template v-for="(part, index) in parts" :key="index"><span>{{ part }}</span><button v-if="index < question.blanks.length" type="button" class="mx-1 inline-block min-w-24 rounded border-2 px-2 py-0.5 align-middle font-mono text-sm transition-colors" :class="slotClass(index)" @click="onSlotClick(index)" @dragover.prevent @drop.prevent="onDrop(index)">{{ answer[index] !== null && answer[index] !== undefined ? question.pool[answer[index] as number] : '⌐' }}</button></template></pre>

    <div v-if="!checked" class="mt-3 flex flex-wrap items-center gap-2">
      <span class="mr-1 text-sm text-muted">Arrastra o pulsa:</span>
      <button
        v-for="item in available"
        :key="item.index"
        type="button"
        draggable="true"
        class="cursor-grab rounded-md border px-3 py-1.5 font-mono text-sm transition-colors active:cursor-grabbing"
        :class="
          selected === item.index
            ? 'border-accent bg-accent/20 text-accent'
            : 'border-line bg-ink-800 text-fg/85 hover:border-accent/50'
        "
        @click="selected = selected === item.index ? null : item.index"
        @dragstart="dragging = item.index"
        @dragend="dragging = null"
      >
        {{ item.token }}
      </button>
      <span v-if="!available.length" class="text-sm text-muted">todas colocadas</span>
    </div>
  </div>
</template>
