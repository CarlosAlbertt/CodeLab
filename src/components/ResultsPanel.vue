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
  <div class="flex h-full flex-col overflow-y-auto text-sm">
    <p v-if="running" class="p-4 text-muted">Compilando y ejecutando…</p>

    <p v-else-if="!result" class="p-4 text-muted">
      Escribe tu solución y pulsa
      <kbd class="rounded border border-line bg-ink-800 px-1.5 py-0.5 font-mono text-xs">Ctrl</kbd>
      +
      <kbd class="rounded border border-line bg-ink-800 px-1.5 py-0.5 font-mono text-xs">Enter</kbd>
      para ejecutar.
    </p>

    <template v-else>
      <!-- Errores de compilación: si los hay, el código ni siquiera llega a ejecutarse. -->
      <section v-if="errors.length" class="border-b border-line p-4">
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-fail">
          {{ errors.length }} error{{ errors.length === 1 ? '' : 'es' }} de compilación
        </h3>
        <ul class="space-y-3">
          <li
            v-for="(diagnostic, index) in errors"
            :key="index"
            class="border-l-2 border-fail/60 pl-3"
          >
            <!-- En los tests las líneas son de código generado: no se muestran. -->
            <p class="font-mono text-xs text-muted">
              <template v-if="diagnostic.origin === 'solution'">
                línea {{ diagnostic.line }}, columna {{ diagnostic.column }}
              </template>
              <template v-else>al comprobar tu código con los tests</template>
            </p>
            <p class="mt-1 text-fg/90">{{ diagnostic.message }}</p>
            <p v-if="diagnostic.hint" class="mt-1 text-xs text-muted">{{ diagnostic.hint }}</p>
          </li>
        </ul>
      </section>

      <section v-if="result.fatal" class="border-b border-line p-4">
        <h3 class="mb-2 text-xs font-semibold uppercase tracking-wider text-fail">
          Error en ejecución
        </h3>
        <p class="text-fg/90">{{ result.fatal }}</p>
      </section>

      <section v-if="result.tests.length" class="border-b border-line p-4">
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
          Tests
          <span :class="result.ok ? 'text-pass' : 'text-fail'">
            {{ passed }}/{{ result.tests.length }}
          </span>
        </h3>
        <ul class="space-y-2">
          <li v-for="test in result.tests" :key="test.name" class="flex gap-2.5">
            <span
              class="mt-0.5 font-mono text-xs"
              :class="test.status === 'pass' ? 'text-pass' : 'text-fail'"
              aria-hidden="true"
            >
              {{ test.status === 'pass' ? '✓' : '✗' }}
            </span>
            <div class="min-w-0">
              <p :class="test.status === 'pass' ? 'text-fg/70' : 'text-fg/90'">{{ test.name }}</p>
              <p v-if="test.message" class="mt-1 font-mono text-xs leading-relaxed text-fail/90">
                {{ test.message }}
              </p>
            </div>
          </li>
        </ul>
      </section>

      <section v-if="result.logs.length" class="border-b border-line p-4">
        <h3 class="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Consola</h3>
        <pre class="overflow-x-auto font-mono text-xs leading-relaxed text-fg/70">{{ result.logs.join('\n') }}</pre>
      </section>

      <p v-if="result.ok" class="p-4 text-pass">
        Todo correcto. Ejercicio superado en {{ result.durationMs }} ms.
      </p>
    </template>
  </div>
</template>
