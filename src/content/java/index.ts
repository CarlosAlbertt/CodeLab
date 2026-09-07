import type { Exercise } from '@/types/exercise'
import { exercise as tiposYMetodos } from './01-tipos-y-metodos'
import { exercise as condicionalesYBucles } from './02-condicionales-y-bucles'
import { exercise as clasesYObjetos } from './03-clases-y-objetos'
import { exercise as colecciones } from './04-colecciones'
import { exercise as interfaces } from './05-interfaces'
import { exercise as excepciones } from './06-excepciones'
import { exercise as proyectoFinal } from './99-proyecto-final'

/** Es la única pista que necesita un servicio local: ver backend/CodeLabServer.java. */
export const javaExercises: Exercise[] = [
  tiposYMetodos,
  condicionalesYBucles,
  clasesYObjetos,
  colecciones,
  interfaces,
  excepciones,
  proyectoFinal,
]
