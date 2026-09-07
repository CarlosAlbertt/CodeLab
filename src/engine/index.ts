import type { LanguageId, Runner } from '@/types/exercise'
import { TypeScriptRunner } from './runners/typescript'
import { DockerfileRunner } from './runners/dockerfile'
import { SqlRunner } from './runners/sql'
import { HtmlRunner } from './runners/html'
import { CssRunner } from './runners/css'
import { JavaRunner } from './runners/java'

/**
 * Runner registry. Adding a language means adding a factory here — the views
 * and the exercise engine stay untouched. Java will register an HTTP-backed
 * runner that talks to the local Spring Boot service.
 */
const FACTORIES: Partial<Record<LanguageId, () => Runner>> = {
  typescript: () => new TypeScriptRunner(),
  docker: () => new DockerfileRunner(),
  sql: () => new SqlRunner(),
  html: () => new HtmlRunner(),
  css: () => new CssRunner(),
  java: () => new JavaRunner(),
}

export function createRunner(language: LanguageId): Runner | null {
  const factory = FACTORIES[language]
  return factory ? factory() : null
}

export function hasRunner(language: LanguageId): boolean {
  return language in FACTORIES
}
