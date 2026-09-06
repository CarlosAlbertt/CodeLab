import type { Exercise, LanguageId, Track } from '@/types/exercise'
import { dockerExercises } from './docker'
import { sqlExercises } from './sql'
import { typescriptExercises } from './typescript'

/**
 * Catalogue of learning tracks. A track with `status: 'soon'` is listed in the
 * home page but has no runner yet; adding one means writing its exercises and
 * registering a runner in `@/engine`.
 */
export const tracks: Track[] = [
  {
    id: 'typescript',
    name: 'TypeScript',
    tagline: 'JavaScript con tipos comprobados',
    description:
      'Desde qué es una variable hasta async/await: once unidades con teoría, quiz y caso ' +
      'práctico, más un proyecto final. Todo se compila con el compilador real de TypeScript.',
    status: 'ready',
    exercises: typescriptExercises,
  },
  {
    id: 'docker',
    name: 'Docker',
    tagline: 'Empaquetar y ejecutar aplicaciones',
    description:
      'Imágenes, capas y caché, multi-stage y compose. Los ejercicios se corrigen leyendo el ' +
      'Dockerfile que escribes, y el proyecto final es el de esta misma aplicación.',
    status: 'ready',
    exercises: dockerExercises,
  },
  {
    id: 'sql',
    name: 'SQL',
    tagline: 'Consultar y modelar datos',
    description:
      'SELECT, WHERE, agregaciones, JOIN y subconsultas sobre una base de datos real: SQLite ' +
      'compilado a WebAssembly, corriendo entero en el navegador.',
    status: 'ready',
    exercises: sqlExercises,
  },
  {
    id: 'java',
    name: 'Java',
    tagline: 'Orientación a objetos y colecciones',
    description: 'Clases, interfaces, colecciones, streams y excepciones, compilados y probados con JUnit.',
    status: 'soon',
    exercises: [],
  },
  {
    id: 'html',
    name: 'HTML',
    tagline: 'Estructura y semántica',
    description: 'Etiquetas semánticas, formularios y accesibilidad, comprobados sobre el DOM que generas.',
    status: 'soon',
    exercises: [],
  },
  {
    id: 'css',
    name: 'CSS',
    tagline: 'Maquetación y diseño',
    description: 'Selectores, box model, flexbox, grid y responsive, con vista previa en vivo.',
    status: 'soon',
    exercises: [],
  },
]

export function findTrack(id: string): Track | undefined {
  return tracks.find((track) => track.id === id)
}

export function findExercise(trackId: string, exerciseId: string): Exercise | undefined {
  return findTrack(trackId)?.exercises.find((exercise) => exercise.id === exerciseId)
}

/** Ejercicio siguiente dentro de la misma pista, o undefined si es el último. */
export function nextExercise(trackId: LanguageId, exerciseId: string): Exercise | undefined {
  return neighbours(trackId, exerciseId).next
}

/** Unidades anterior y siguiente, para navegar sin volver al índice. */
export function neighbours(
  trackId: string,
  exerciseId: string,
): { previous?: Exercise; next?: Exercise } {
  const exercises = findTrack(trackId)?.exercises ?? []
  const index = exercises.findIndex((exercise) => exercise.id === exerciseId)
  if (index === -1) return {}
  return { previous: exercises[index - 1], next: exercises[index + 1] }
}
