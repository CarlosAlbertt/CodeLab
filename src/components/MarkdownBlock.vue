<script setup lang="ts">
import { computed } from 'vue'
import { renderMarkdown } from '@/utils/markdown'

const props = defineProps<{ source: string }>()

// El contenido lo escribimos nosotros y el renderizador escapa el HTML de entrada.
const html = computed(() => renderMarkdown(props.source))
</script>

<template>
  <div class="prose-lab text-[0.9375rem] text-fg/85" v-html="html" />
</template>
