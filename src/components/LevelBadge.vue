<script setup lang="ts">
import { computed } from 'vue'
import type { Difficulty, Exercise } from '@/types/exercise'
import { DIFFICULTY, PROJECT_BADGE } from '@/utils/tracks'

const props = defineProps<{ difficulty: Difficulty; kind?: Exercise['kind'] }>()

const style = computed(() =>
  props.kind === 'project'
    ? { label: 'proyecto final', badge: PROJECT_BADGE }
    : DIFFICULTY[props.difficulty],
)
</script>

<template>
  <span
    class="shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
    :class="style.badge"
  >
    {{ style.label }}
  </span>
</template>
