import type { Exercise } from '@/types/exercise'
import { exercise as selectores } from './01-selectores'
import { exercise as caja } from './02-caja'
import { exercise as flexbox } from './03-flexbox'
import { exercise as gridResponsive } from './04-grid-responsive'
import { exercise as proyectoFinal } from './99-proyecto-final'

/**
 * Se corrige leyendo las reglas declaradas; el resultado visual se ve en la
 * vista previa que hay junto al editor.
 */
export const cssExercises: Exercise[] = [selectores, caja, flexbox, gridResponsive, proyectoFinal]
