import type { Exercise } from '@/types/exercise'
import { exercise as select } from './01-select'
import { exercise as where } from './02-where'
import { exercise as orden } from './03-orden'
import { exercise as agregacion } from './04-agregacion'
import { exercise as groupBy } from './05-group-by'
import { exercise as join } from './06-join'
import { exercise as leftJoin } from './07-left-join'
import { exercise as subconsultas } from './08-subconsultas'
import { exercise as modificar } from './09-modificar'
import { exercise as proyectoFinal } from './99-proyecto-final'

/** Todos los ejercicios parten del mismo esquema de clínica: ver `schema.ts`. */
export const sqlExercises: Exercise[] = [
  select,
  where,
  orden,
  agregacion,
  groupBy,
  join,
  leftJoin,
  subconsultas,
  modificar,
  proyectoFinal,
]
