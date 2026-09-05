<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useProgress } from '@/composables/useProgress'

const { totalCompleted } = useProgress()
</script>

<template>
  <div class="min-h-screen">
    <header class="border-b border-line">
      <div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <RouterLink to="/" class="font-mono text-sm tracking-tight text-fg hover:text-accent">
          codelab
        </RouterLink>
        <span class="text-xs text-muted">
          {{ totalCompleted }} ejercicio{{ totalCompleted === 1 ? '' : 's' }} superado{{ totalCompleted === 1 ? '' : 's' }}
        </span>
      </div>
    </header>

    <RouterView />
  </div>
</template>
