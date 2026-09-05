<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { useProgress } from '@/composables/useProgress'

const { totalCompleted } = useProgress()
</script>

<template>
  <div class="min-h-screen">
    <header class="border-b border-line">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <RouterLink to="/" class="font-mono text-base tracking-tight text-fg">
          code<span class="text-accent">lab</span>
        </RouterLink>
        <span class="text-sm text-muted">
          <span class="font-medium text-pass">{{ totalCompleted }}</span>
          {{ totalCompleted === 1 ? 'ejercicio superado' : 'ejercicios superados' }}
        </span>
      </div>
    </header>

    <RouterView />
  </div>
</template>
