<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useGamification } from '@/composables/useGamification'

const route = useRoute()
const { totalXp, streak } = useGamification()
</script>

<template>
  <div class="min-h-screen">
    <!-- En la lección no hay cabecera: toda la pantalla es para el paso actual. -->
    <header v-if="!route.meta.focus" class="border-b border-line">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <RouterLink to="/" class="font-mono text-base tracking-tight text-fg">
          code<span class="text-accent">lab</span>
        </RouterLink>
        <div class="flex items-center gap-2.5">
          <span
            class="flex h-8 items-center gap-1.5 rounded-full border px-3 font-mono text-sm font-semibold"
            :class="streak.days > 0 ? 'border-warn/35 bg-warn/[0.08] text-warn' : 'border-line text-muted'"
            :title="streak.todayDone ? 'Racha de días seguidos practicando' : 'Practica hoy para no perder la racha'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5c.8 3.2 5 5.2 5 10a5 5 0 0 1-10 0c0-2.1 1-3.6 2.4-4.8.2 1.8 1.1 2.8 2.1 3.1-.4-3 .1-5.6.5-8.3z" /></svg>
            {{ streak.days }}
          </span>
          <span
            class="flex h-8 items-center gap-1.5 rounded-full border border-accent/35 bg-accent/[0.08] px-3 font-mono text-sm font-semibold text-accent"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></svg>
            {{ totalXp }} XP
          </span>
        </div>
      </div>
    </header>

    <RouterView />
  </div>
</template>
