import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'ts-08-async',
  language: 'typescript',
  title: 'async / await y control de errores',
  difficulty: 3,
  concepts: ['async', 'await', 'Promise', 'try/catch', 'genéricos'],
  theory: `## Promesas

Una \`Promise<T>\` representa un valor que todavía no está: llegará (se resuelve) o
fallará (se rechaza). Una función \`async\` devuelve siempre una promesa.

~~~ts
async function cargar(): Promise<string> {
  return 'datos'   // se envuelve en Promise<string> automáticamente
}
~~~

## await

\`await\` espera a que la promesa termine y devuelve su valor. Solo se puede usar dentro
de una función \`async\`:

~~~ts
const datos = await cargar()
~~~

## Capturar el fallo

Si la promesa se rechaza, \`await\` lanza el error, así que se captura con try/catch:

~~~ts
try {
  const datos = await cargar()
} catch (error) {
  // error es de tipo unknown: hay que comprobarlo antes de usarlo
}
~~~

En modo estricto el \`error\` del catch es \`unknown\`. Es intencionado: en JavaScript se
puede lanzar cualquier cosa, no solo un \`Error\`.`,
  brief: `Implementa \`reintentar\`, una función genérica que ejecuta una operación asíncrona y,
si falla, la vuelve a intentar hasta agotar el número de intentos.

- Devuelve el resultado en cuanto una llamada tenga éxito.
- No hace más llamadas de las necesarias: si acierta a la segunda, no hay una tercera.
- Si se agotan todos los intentos, **relanza el último error** recibido.`,
  starterCode: `async function reintentar<T>(operacion: () => Promise<T>, intentos: number): Promise<T> {
  // Intenta la operación hasta "intentos" veces
  return operacion()
}
`,
  solution: `async function reintentar<T>(operacion: () => Promise<T>, intentos: number): Promise<T> {
  let ultimoError: unknown

  for (let intento = 0; intento < intentos; intento++) {
    try {
      return await operacion()
    } catch (error) {
      ultimoError = error
    }
  }

  throw ultimoError
}
`,
  hints: [
    'Un for normal te vale: repite "intentos" veces y sal con return en cuanto funcione.',
    'Guarda el error del catch en una variable declarada fuera del bucle para relanzarlo al final.',
    'Escribe return await operacion() dentro del try, para que el catch llegue a ver el fallo.',
  ],
  tests: [
    {
      name: 'Devuelve el valor a la primera si no falla',
      code: `let llamadas = 0
    const operacion = async () => {
      llamadas++
      return 'listo'
    }
    expect(await reintentar(operacion, 3)).toBe('listo')
    expect(llamadas).toBe(1)`,
    },
    {
      name: 'Reintenta hasta que la operación funciona',
      code: `let llamadas = 0
    const operacion = async () => {
      llamadas++
      if (llamadas < 3) throw new Error('todavia no')
      return 'listo'
    }
    expect(await reintentar(operacion, 5)).toBe('listo')
    expect(llamadas).toBe(3)`,
    },
    {
      name: 'Relanza el último error cuando se agotan los intentos',
      code: `let llamadas = 0
    const operacion = async (): Promise<string> => {
      llamadas++
      throw new Error('fallo ' + llamadas)
    }
    let mensaje = ''
    try {
      await reintentar(operacion, 2)
    } catch (error) {
      mensaje = error instanceof Error ? error.message : String(error)
    }
    expect(llamadas).toBe(2)
    expect(mensaje).toBe('fallo 2')`,
    },
  ],
}
