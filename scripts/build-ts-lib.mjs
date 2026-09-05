/**
 * Builds a single concatenated `lib.d.ts` bundle for the in-browser TypeScript
 * compiler. The browser has no filesystem, so instead of shipping the ~60 files
 * that TypeScript resolves through `/// <reference lib="..." />` we flatten the
 * whole dependency chain into one file that the worker fetches at startup.
 */
import { createRequire } from 'node:module'
import { mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const libDir = dirname(require.resolve('typescript/lib/typescript.js'))
const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'ts-libs')
const outFile = join(outDir, 'lib.bundle.d.ts')

// Punto de entrada: ES2020 sin DOM. El runner de ejercicios corre en un Worker,
// asi que las APIs del navegador no deben estar disponibles para el alumno.
const ENTRY = 'es2020'

const REFERENCE = /\/\/\/\s*<reference\s+lib="([^"]+)"\s*\/>/g
const DIRECTIVE = /^\s*\/\/\/\s*<reference[^>]*\/>\s*$/gm

const seen = new Set()
const chunks = []

function visit(libName) {
  if (seen.has(libName)) return
  seen.add(libName)

  const file = join(libDir, `lib.${libName}.d.ts`)
  if (!existsSync(file)) {
    throw new Error(`No encuentro ${file}. Reinstala las dependencias (npm install).`)
  }
  const source = readFileSync(file, 'utf8')

  // Post-order: primero las dependencias, luego el fichero que las referencia.
  for (const match of source.matchAll(REFERENCE)) visit(match[1])

  chunks.push(`// ===== lib.${libName}.d.ts =====\n${source.replace(DIRECTIVE, '')}`)
}

visit(ENTRY)

mkdirSync(outDir, { recursive: true })
const bundle = `/// <reference no-default-lib="true"/>\n${chunks.join('\n')}\n`
writeFileSync(outFile, bundle, 'utf8')

const kb = Math.round(statSync(outFile).size / 1024)
console.log(`[codelab] lib.bundle.d.ts -> ${seen.size} ficheros, ${kb} KB`)
