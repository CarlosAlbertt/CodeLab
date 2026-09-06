import type { Exercise } from '@/types/exercise'
import { exercise as estructura } from './01-estructura'
import { exercise as texto } from './02-texto'
import { exercise as semantica } from './03-semantica'
import { exercise as imagenes } from './04-imagenes'
import { exercise as formularios } from './05-formularios'
import { exercise as proyectoFinal } from './99-proyecto-final'

/** Se corrige sobre el DOM que construye el navegador, no sobre el texto escrito. */
export const htmlExercises: Exercise[] = [
  estructura,
  texto,
  semantica,
  imagenes,
  formularios,
  proyectoFinal,
]
