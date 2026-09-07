<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { EditorState } from '@codemirror/state'
import { EditorView, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { bracketMatching, indentOnInput } from '@codemirror/language'
import { autocompletion, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'
import { javascript } from '@codemirror/lang-javascript'
import { css } from '@codemirror/lang-css'
import { html } from '@codemirror/lang-html'
import { StreamLanguage } from '@codemirror/language'
import { dockerFile } from '@codemirror/legacy-modes/mode/dockerfile'
import { yaml } from '@codemirror/legacy-modes/mode/yaml'
import { sqlite } from '@codemirror/legacy-modes/mode/sql'
import { java } from '@codemirror/legacy-modes/mode/clike'
import { oneDark } from '@codemirror/theme-one-dark'

const props = withDefaults(
  defineProps<{
    modelValue: string
    readonly?: boolean
    language?: 'typescript' | 'dockerfile' | 'yaml' | 'sql' | 'html' | 'css' | 'java'
  }>(),
  { readonly: false, language: 'typescript' },
)

function languageExtension() {
  if (props.language === 'dockerfile') return StreamLanguage.define(dockerFile)
  if (props.language === 'yaml') return StreamLanguage.define(yaml)
  if (props.language === 'sql') return StreamLanguage.define(sqlite)
  if (props.language === 'java') return StreamLanguage.define(java)
  if (props.language === 'html') return html()
  if (props.language === 'css') return css()
  return javascript({ typescript: true })
}

const emit = defineEmits<{
  'update:modelValue': [value: string]
  run: []
}>()

const host = ref<HTMLDivElement | null>(null)
let view: EditorView | null = null

function buildExtensions() {
  return [
    lineNumbers(),
    highlightActiveLine(),
    highlightActiveLineGutter(),
    history(),
    indentOnInput(),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    languageExtension(),
    oneDark,
    EditorView.lineWrapping,
    EditorState.readOnly.of(props.readonly),
    EditorView.editable.of(!props.readonly),
    keymap.of([
      // Ctrl/Cmd+Enter ejecuta sin tener que soltar el teclado.
      { key: 'Mod-Enter', preventDefault: true, run: () => (emit('run'), true) },
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...historyKeymap,
      indentWithTab,
    ]),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) emit('update:modelValue', update.state.doc.toString())
    }),
  ]
}

onMounted(() => {
  view = new EditorView({
    state: EditorState.create({ doc: props.modelValue, extensions: buildExtensions() }),
    parent: host.value!,
  })
})

// Cambios que vienen de fuera (reiniciar, cargar solucion, cambiar de ejercicio).
watch(
  () => props.modelValue,
  (value) => {
    if (!view || value === view.state.doc.toString()) return
    view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } })
  },
)

onBeforeUnmount(() => {
  view?.destroy()
  view = null
})
</script>

<template>
  <div ref="host" class="h-full overflow-hidden" />
</template>
