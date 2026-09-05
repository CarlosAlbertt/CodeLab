import type { Exercise } from '@/types/exercise'
import { exercise as tiposYFunciones } from './01-tipos-y-funciones'
import { exercise as parametrosOpcionales } from './02-parametros-opcionales'
import { exercise as arrays } from './03-arrays'
import { exercise as interfaces } from './04-interfaces'
import { exercise as uniones } from './05-uniones'
import { exercise as genericos } from './06-genericos'
import { exercise as clases } from './07-clases'
import { exercise as asincronia } from './08-async'

/** Orden de la pista: cada ejercicio da por sabido lo anterior. */
export const typescriptExercises: Exercise[] = [
  tiposYFunciones,
  parametrosOpcionales,
  arrays,
  interfaces,
  uniones,
  genericos,
  clases,
  asincronia,
]
