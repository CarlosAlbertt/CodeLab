<script setup lang="ts">
import { computed } from 'vue'
import type { RunResult } from '@/types/exercise'

const props = defineProps<{
  result: RunResult | null
  running: boolean
}>()

const errors = computed(() => props.result?.diagnostics.filter((d) => d.severity === 'error') ?? [])
const passed = computed(() => props.result?.tests.filter((t) => t.status === 'pass').length ?? 0)
</script>

<template>
  <div class="flex h-full flex-col overflow-y-auto">
    <p v-if="running" class="p-5 text-base text-accent">Compilando y ejecutando…</p>

    <p v-else-if="!result" class="p-5 text-base text-muted">
      Escribe tu solución y pulsa
      <kbd class="rounded border border-line bg-ink-800 px-2 py-0.5 font-mono text-sm">Ctrl</kbd>
      +
      <kbd class="rounded border border-line bg-ink-800 px-2 py-0.5 font-mono text-sm">Enter</kbd>
      para ejecutar.
    </p>

    <template v-else>
      <!-- Franja de estado: el veredicto se ve sin leer nada. -->
      <div
        class="flex items-center justify-between gap-4 border-b px-5 py-3 text-base font-medium"
        :class="
          result.ok
            ? 'border-pass/30 bg-pass/10 text-pass'
            : 'border-fail/30 bg-fail/10 text-fail'
        "
      >
        <span>
          <template v-if="errors.length">
            {{ errors.length }} error{{ errors.length === 1 ? '' : 'es' }} de compilación
          </template>
          <template v-else-if="result.ok">Todo correcto</template>
          <template v-else>{{ passed }} de {{ result.tests.length }} tests correctos</template>
        </span>
        <span class="font-mono text-sm opacity-70">{{ result.durationMs }} ms</span>
      </div>

      <section v-if="errors.length" class="border-b border-line p-5">
        <ul class="space-y-4">
          <li
            v-for="(diagnostic, index) in errors"
            :key="index"
            class="rounded-md border-l-2 border-fail/70 bg-fail/5 py-2 pl-4 pr-3"
          >
            <!-- En los tests las líneas son de código generado: no se muestran. -->
            <p class="font-mono text-sm text-muted">
              <template v-if="diagnostic.origin === 'solution'">
                línea {{ diagnostic.line }}, columna {{ diagnostic.column }}
              </template>
              <template v-else>al comprobar tu código con los tests</template>
            </p>
            <p class="mt-1 text-base text-fg/90">{{ diagnostic.message }}</p>
            <p v-if="diagnostic.hint" class="mt-1.5 text-sm text-warn/90">{{ diagnostic.hint }}</p>
          </li>
        </ul>
      </section>

      <section v-if="result.fatal" class="border-b border-line p-5">
        <h3 class="mb-2 text-sm font-medium uppercase tracking-wider text-fail">
          Error en ejecución
        </h3>
        <p class="text-base text-fg/90">{{ result.fatal }}</p>
      </section>

      <section v-if="result.tests.length" class="border-b border-line p-5">
        <ul class="space-y-3">
          <li v-for="test in result.tests" :key="test.name" class="flex gap-3">
            <span
              class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs"
              :class="
                test.status === 'pass' ? 'bg-pass/15 text-pass' : 'bg-fail/15 text-fail'
              "
              aria-hidden="true"
            >
              {{ test.status === 'pass' ? '✓' : '✗' }}
            </span>
            <div class="min-w-0">
              <p class="text-base" :class="test.status === 'pass' ? 'text-fg/60' : 'text-fg'">
                {{ test.name }}
              </p>
              <p v-if="test.message" class="mt-1 font-mono text-sm leading-relaxed text-fail">
                {{ test.message }}
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section v-if="result.logs.length" class="p-5">
        <h3 class="mb-2 text-sm font-medium uppercase tracking-wider text-muted">Consola</h3>
        <pre class="overflow-x-auto font-mono text-sm leading-relaxed text-fg/70">{{ result.logs.join('\n') }}</pre>
      </section>
    </template>
  </div>
</template>
