import type { LanguageId, Runner } from '@/types/exercise'
import { TypeScriptRunner } from './runners/typescript'

/**
 * Runner registry. Adding a language means adding a factory here — the views
 * and the exercise engine stay untouched. Java will register an HTTP-backed
 * runner that talks to the local Spring Boot service.
 */
const FACTORIES: Partial<Record<LanguageId, () => Runner>> = {
  typescript: () => new TypeScriptRunner(),
}

export function createRunner(language: LanguageId): Runner | null {
  const factory = FACTORIES[language]
  return factory ? factory() : null
}

export function hasRunner(language: LanguageId): boolean {
  return language in FACTORIES
}
