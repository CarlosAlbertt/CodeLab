import type { Difficulty, LanguageId } from '@/types/exercise'

/**
 * Per-language and per-difficulty colours. Tailwind scans source files for
 * literal class names, so these have to be written out in full rather than
 * assembled from fragments.
 */
export const LANGUAGE_STYLE: Record<LanguageId, { dot: string; text: string; border: string }> = {
  typescript: {
    dot: 'bg-lang-typescript',
    text: 'text-lang-typescript',
    border: 'hover:border-lang-typescript/50',
  },
  docker: {
    dot: 'bg-lang-docker',
    text: 'text-lang-docker',
    border: 'hover:border-lang-docker/50',
  },
  sql: { dot: 'bg-lang-sql', text: 'text-lang-sql', border: 'hover:border-lang-sql/50' },
  java: { dot: 'bg-lang-java', text: 'text-lang-java', border: 'hover:border-lang-java/50' },
  html: { dot: 'bg-lang-html', text: 'text-lang-html', border: 'hover:border-lang-html/50' },
  css: { dot: 'bg-lang-css', text: 'text-lang-css', border: 'hover:border-lang-css/50' },
}

export const DIFFICULTY: Record<Difficulty, { label: string; badge: string }> = {
  1: { label: 'introducción', badge: 'border-pass/40 bg-pass/10 text-pass' },
  2: { label: 'práctica', badge: 'border-accent/40 bg-accent/10 text-accent' },
  3: { label: 'reto', badge: 'border-warn/40 bg-warn/10 text-warn' },
}

export const PROJECT_BADGE = 'border-lang-sql/40 bg-lang-sql/10 text-lang-sql'

/** Nombre por defecto del fichero que se edita en cada pista. */
export const DEFAULT_FILE_NAME: Record<LanguageId, string> = {
  typescript: 'solucion.ts',
  docker: 'Dockerfile',
  sql: 'consulta.sql',
  java: 'Solucion.java',
  html: 'index.html',
  css: 'estilos.css',
}

/** Resaltado del editor, deducido del nombre del fichero. */
export function editorLanguage(fileName: string): 'typescript' | 'dockerfile' | 'yaml' {
  if (fileName === 'Dockerfile' || fileName.endsWith('.dockerfile')) return 'dockerfile'
  if (fileName.endsWith('.yml') || fileName.endsWith('.yaml')) return 'yaml'
  return 'typescript'
}
