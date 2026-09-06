<script setup lang="ts">
defineProps<{ html: string }>()
</script>

<template>
  <!--
    sandbox vacío: el HTML del alumno se pinta, pero no puede ejecutar scripts
    ni acceder a la página que lo contiene.
  -->
  <iframe
    :srcdoc="html"
    sandbox=""
    title="Vista previa de la página"
    class="h-full w-full border-0 bg-white"
  />
</template>
