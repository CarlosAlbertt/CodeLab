import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'ts-10-async',
  language: 'typescript',
  title: 'async / await y control de errores',
  difficulty: 3,
  concepts: ['async', 'await', 'Promise', 'try/catch', 'genéricos'],
  theory: `## La idea

Casi todo lo que tarda —pedir datos a un servidor, leer un fichero— no puede parar el
programa mientras ocurre. Por eso esas operaciones no devuelven el valor: devuelven una
**promesa**, una especie de resguardo que dice *aquí habrá un valor dentro de un rato, o un
error*.

\`async\` y \`await\` te dejan escribir ese código como si fuese normal, línea a línea,
en vez de la maraña de llamadas anidadas que se usaba antes.

## Promesas

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
puede lanzar cualquier cosa, no solo un \`Error\`.

## Lo que devuelve una función async

Siempre una promesa, aunque dentro escribas \`return 5\`: el tipo es \`Promise<number>\`. Y si lanzas un error, la promesa se rechaza en lugar de propagarse directamente hacia arriba.

## Secuencial o en paralelo

~~~ts
const a = await uno()   // espera a que termine
const b = await dos()   // y solo entonces empieza la segunda

const [c, d] = await Promise.all([uno(), dos()])  // las dos a la vez
~~~

Si las operaciones no dependen entre sí, \`Promise.all\` ahorra tiempo real.

## Errores típicos

- Olvidar el \`await\`: te quedas con la promesa en vez de con el valor.
- Dejar el \`await\` fuera del \`try\` cuando lo que quieres es capturar el fallo.
- Tratar el \`error\` del \`catch\` como si fuese un \`Error\` sin comprobarlo: en modo estricto es \`unknown\`.`,
  brief: `Implementa \`reintentar\`, una función genérica que ejecuta una operación asíncrona y,
si falla, la vuelve a intentar hasta agotar el número de intentos.

- Devuelve el resultado en cuanto una llamada tenga éxito.
- No hace más llamadas de las necesarias: si acierta a la segunda, no hay una tercera.
- Si se agotan todos los intentos, **relanza el último error** recibido.`,
  quiz: [
    {
      kind: 'fill',
      prompt: "Marca la función como asíncrona.",
      snippet: "___ function cargar(): Promise<string> { return 'datos' }",
      answers: ["async"],
      explanation: "async hace que la función devuelva siempre una promesa.",
    },
    {
      kind: 'fill',
      prompt: "Espera a que la promesa termine.",
      snippet: "const datos = ___ cargar()",
      answers: ["await"],
      explanation: "Sin await te quedas con la promesa en lugar de con el valor.",
    },
    {
      kind: 'fill',
      prompt: "Lanza las dos operaciones a la vez.",
      snippet: "const [a, b] = await Promise.___([uno(), dos()])",
      answers: ["all"],
      explanation: "Promise.all las arranca en paralelo y espera a que terminen todas.",
    },
    {
      kind: 'fill',
      prompt: "Escribe el tipo que tiene el error en modo estricto.",
      snippet: "try {} catch (error) {} // error es de tipo ___",
      answers: ["unknown"],
      explanation: "En JavaScript se puede lanzar cualquier cosa, así que hay que comprobarlo antes de usarlo.",
    },
    {
      kind: "choice",
      prompt: "¿Qué contiene datos en esta línea?",
      snippet: "const datos = cargar()   // cargar está declarada como async",
      options: ["El texto que devuelve cargar", "Una promesa: falta el await", "undefined"],
      correct: 1,
      explanation: "Una función async siempre devuelve una promesa. Sin await te quedas con el resguardo, no con el valor.",
    },
    {
      kind: "order",
      prompt: "Ordena la función que captura el fallo.",
      lines: ["async function cargar(): Promise<string> {", "  try {", "    return await pedirDatos()", "  } catch (error) {", "    return 'sin datos'", "  }", "}"],
      explanation: "El await tiene que estar dentro del try; si queda fuera, el catch no llega a ver el error.",
    },
    {
      kind: "drag",
      prompt: "Lanza las dos operaciones a la vez en lugar de una detrás de otra.",
      snippet: "const [a, b] = ___ Promise.___([uno(), dos()])",
      blanks: ["await", "all"],
      pool: ["await", "all", "async", "race"],
      explanation: "Promise.all las arranca en paralelo y await espera a que terminen todas.",
    },
  ],
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
