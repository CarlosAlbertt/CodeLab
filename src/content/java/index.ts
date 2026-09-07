import type { Exercise } from '@/types/exercise'
import { exercise as tiposYMetodos } from './01-tipos-y-metodos'
import { exercise as condicionalesYBucles } from './02-condicionales-y-bucles'
import { exercise as clasesYObjetos } from './03-clases-y-objetos'
import { exercise as herencia } from './04-herencia'
import { exercise as interfaces } from './05-interfaces'
import { exercise as enumsYRecords } from './06-enums-y-records'
import { exercise as colecciones } from './07-colecciones'
import { exercise as equalsYOrden } from './08-equals-y-orden'
import { exercise as lambdasYStreams } from './09-lambdas-y-streams'
import { exercise as optional } from './10-optional'
import { exercise as excepciones } from './11-excepciones'
import { exercise as genericos } from './12-genericos'
import { exercise as proyectoFinal } from './99-proyecto-final'

/** Es la única pista que necesita un servicio local: ver backend/CodeLabServer.java. */
export const javaExercises: Exercise[] = [
  tiposYMetodos,
  condicionalesYBucles,
  clasesYObjetos,
  herencia,
  interfaces,
  enumsYRecords,
  colecciones,
  equalsYOrden,
  lambdasYStreams,
  optional,
  excepciones,
  genericos,
  proyectoFinal,
]
