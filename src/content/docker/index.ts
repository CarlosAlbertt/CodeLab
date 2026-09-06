import type { Exercise } from '@/types/exercise'
import { exercise as queEsUnContenedor } from './01-que-es-un-contenedor'
import { exercise as capasYCache } from './02-capas-y-cache'
import { exercise as ejecutar } from './03-ejecutar'
import { exercise as multiStage } from './04-multi-stage'
import { exercise as compose } from './05-compose'
import { exercise as proyectoFinal } from './99-proyecto-final'

/** Los ejercicios se corrigen leyendo el fichero: en el navegador no hay demonio de Docker. */
export const dockerExercises: Exercise[] = [
  queEsUnContenedor,
  capasYCache,
  ejecutar,
  multiStage,
  compose,
  proyectoFinal,
]
