import type { Exercise } from '@/types/exercise'
import { exercise as tiposYFunciones } from './01-tipos-y-funciones'
import { exercise as parametrosOpcionales } from './02-parametros-opcionales'
import { exercise as arrays } from './03-arrays'
import { exercise as interfaces } from './04-interfaces'
import { exercise as uniones } from './05-uniones'
import { exercise as genericos } from './06-genericos'
import { exercise as clases } from './07-clases'
import { exercise as asincronia } from './08-async'
import { exercise as proyectoFinal } from './99-proyecto-final'

/** Orden de la pista: cada unidad da por sabido lo anterior, y el proyecto final las junta todas. */
export const typescriptExercises: Exercise[] = [
  tiposYFunciones,
  parametrosOpcionales,
  arrays,
  interfaces,
  uniones,
  genericos,
  clases,
  asincronia,
  proyectoFinal,
]
