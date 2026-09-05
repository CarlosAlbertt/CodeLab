import type { Exercise } from '@/types/exercise'
import { exercise as queEsProgramar } from './00-que-es-programar'
import { exercise as tiposYFunciones } from './01-tipos-y-funciones'
import { exercise as parametrosOpcionales } from './02-parametros-opcionales'
import { exercise as decisiones } from './03-decisiones'
import { exercise as bucles } from './04-bucles'
import { exercise as arrays } from './05-arrays'
import { exercise as interfaces } from './06-interfaces'
import { exercise as uniones } from './07-uniones'
import { exercise as genericos } from './08-genericos'
import { exercise as clases } from './09-clases'
import { exercise as asincronia } from './10-async'
import { exercise as proyectoFinal } from './99-proyecto-final'

/** Orden de la pista: cada unidad da por sabido lo anterior, y el proyecto final las junta todas. */
export const typescriptExercises: Exercise[] = [
  queEsProgramar,
  tiposYFunciones,
  parametrosOpcionales,
  decisiones,
  bucles,
  arrays,
  interfaces,
  uniones,
  genericos,
  clases,
  asincronia,
  proyectoFinal,
]
