import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'ts-00-que-es-programar',
  language: 'typescript',
  title: 'Qué es programar',
  difficulty: 1,
  concepts: ['valores', 'variables', 'tipos', 'funciones'],
  theory: `## Qué es un programa

Un programa es una lista de instrucciones que el ordenador ejecuta **una detrás de otra, de
arriba abajo**. No interpreta lo que querías decir: hace exactamente lo que pone, en el orden
en que está escrito. Casi todos los fallos de un principiante vienen de ahí.

## Valores

Todo lo que maneja un programa son **valores**. De momento te bastan tres clases:

~~~ts
42        // un número
'Ana'     // un texto (va entre comillas)
true      // un sí; su contrario es false
~~~

Las comillas importan: \`42\` es el número cuarenta y dos, con el que puedes hacer cuentas.
\`'42'\` es un texto de dos caracteres, con el que no.

## Variables: ponerle nombre a un valor

Un valor suelto se pierde. Para poder usarlo después se le pone nombre:

~~~ts
const nombre = 'Ana'
~~~

Se lee: *guarda el valor \`'Ana'\` con el nombre \`nombre\`*. A partir de ahí, escribir
\`nombre\` es lo mismo que escribir \`'Ana'\`.

Hay dos formas de declarar:

~~~ts
const iva = 21      // no va a cambiar en toda su vida
let contador = 0    // sí va a cambiar
contador = contador + 1
~~~

Empieza siempre por \`const\`. Cambia a \`let\` solo cuando compruebes que necesitas
modificarlo: así el compilador te protege del resto de casos.

## Tipos: qué clase de valor cabe

Aquí es donde TypeScript se diferencia de JavaScript. En JavaScript puedes sumar un texto
con un número y obtener un resultado absurdo sin que nadie te avise. TypeScript te deja
declarar de qué clase es cada cosa, y te lo dice **antes de ejecutar nada**:

~~~ts
const nombre: string = 'Ana'    // texto
const edad: number = 30         // número, con o sin decimales
const activo: boolean = true    // verdadero o falso
~~~

Los dos puntos se leen como *"de tipo"*: \`edad\` es de tipo \`number\`.

## Funciones: darle nombre a un trozo de trabajo

Una función es una operación con nombre, que recibe datos y devuelve un resultado:

~~~ts
function doble(n: number): number {
  return n * 2
}

doble(5)   // 10
~~~

Léela pieza a pieza:

- \`function\` — voy a definir una operación.
- \`doble\` — se llamará así.
- \`(n: number)\` — recibe un número; aquí dentro lo llamaré \`n\`.
- \`: number\` — lo que devuelve es un número.
- \`return\` — este es el valor que sale.

Definir una función **no la ejecuta**. Se ejecuta cuando la llamas escribiendo su nombre
con paréntesis: \`doble(5)\`.

## Los símbolos que vas a ver todo el rato

- \`//\` un comentario: es para ti, el ordenador lo ignora.
- \`{ }\` agrupan un bloque de instrucciones.
- \`( )\` los datos que entran en una función.
- \`=\` asigna un valor. \`===\` compara dos valores. No son lo mismo.
- \`+\` suma números, pero entre textos los pega: \`'Hola' + ', ' + 'Ana'\`.

## Cómo se practica aquí

Escribes tu código y pulsas **Ejecutar**. Entonces se comprueban unos **tests**: frases del
tipo *"si llamo a \`doble(5)\`, tiene que salir \`10\`"*. Si algo no cuadra, te dice qué
esperaba y qué recibió, y esa diferencia suele señalar el error directamente.

## Errores típicos

- Confundir \`=\` (asignar) con \`===\` (comparar).
- Escribir el nombre con otra mayúscula: \`Nombre\` y \`nombre\` son dos cosas distintas.
- Olvidar el \`return\`: la función se ejecuta, pero no devuelve nada.
- Olvidar las comillas en un texto: sin ellas, TypeScript cree que es el nombre de una variable.`,
  brief: `Tu primer programa. Hay dos cosas que completar en el editor.

1. La constante \`SALUDO\` tiene que valer el texto \`'Hola'\`.
2. \`presentar(nombre)\` devuelve el saludo, una coma, un espacio y el nombre:
   con \`'Ana'\` devuelve \`'Hola, Ana'\`. Úsalo montando el texto con \`+\`.
3. \`doble(n)\` devuelve el número recibido multiplicado por dos.

Fíjate en los detalles del texto: la coma va pegada al saludo y el espacio va después.`,
  quiz: [
    {
      kind: 'choice',
      prompt: '¿Cuál de estos valores es un texto?',
      options: ['42', "'42'", 'true', 'edad'],
      correct: 1,
      explanation: 'Las comillas son lo que convierte algo en texto. Sin ellas, 42 es un número y edad es el nombre de una variable.',
    },
    {
      kind: 'fill',
      prompt: 'Guarda el número 30 con el nombre edad, sabiendo que no va a cambiar.',
      snippet: '___ edad = 30',
      answers: ['const'],
      explanation: 'const es para lo que no cambia; let, para lo que sí. Empieza siempre por const.',
    },
    {
      kind: 'drag',
      prompt: 'Coloca el tipo que le corresponde a cada valor.',
      snippet: "const nombre: ___ = 'Ana'\nconst edad: ___ = 30\nconst activo: ___ = true",
      blanks: ['string', 'number', 'boolean'],
      pool: ['string', 'number', 'boolean'],
      explanation: 'string para textos, number para números y boolean para verdadero o falso.',
    },
    {
      kind: 'order',
      prompt: 'Ordena las piezas de una función que devuelve el doble de un número.',
      lines: ['function doble(n: number): number {', '  return n * 2', '}'],
      explanation: 'Primero la cabecera con el nombre y los tipos, luego el cuerpo, y la llave cierra el bloque.',
    },
    {
      kind: 'choice',
      prompt: '¿Qué hace === en TypeScript?',
      options: ['Guarda un valor en una variable', 'Compara dos valores', 'Define una función'],
      correct: 1,
      explanation: 'Guardar es =. Comparar es ===. Confundirlos es el error más habitual al empezar.',
    },
    {
      kind: 'fill',
      prompt: 'Haz que la función devuelva su resultado.',
      snippet: 'function doble(n: number): number { ___ n * 2 }',
      answers: ['return'],
      explanation: 'Sin return la función hace el cálculo y lo tira: quien la llama no recibe nada.',
    },
  ],
  starterCode: `const SALUDO: string = ''

function presentar(nombre: string): string {
  return ''
}

function doble(n: number): number {
  return 0
}
`,
  solution: `const SALUDO: string = 'Hola'

function presentar(nombre: string): string {
  return SALUDO + ', ' + nombre
}

function doble(n: number): number {
  return n * 2
}
`,
  hints: [
    'El texto va entre comillas simples: const SALUDO: string = \'Hola\'.',
    'Para pegar textos se usa +, igual que para sumar números: SALUDO + \', \' + nombre.',
    'doble tiene que devolver el resultado, no imprimirlo: return n * 2.',
  ],
  tests: [
    { name: 'SALUDO guarda el texto Hola', code: `expect(SALUDO).toBe('Hola')` },
    { name: 'presentar saluda por el nombre', code: `expect(presentar('Ana')).toBe('Hola, Ana')` },
    { name: 'presentar funciona con cualquier nombre', code: `expect(presentar('Luis')).toBe('Hola, Luis')` },
    { name: 'doble multiplica por dos', code: `expect(doble(5)).toBe(10)` },
    { name: 'doble funciona con el cero y con negativos', code: `expect(doble(0)).toBe(0)
    expect(doble(-3)).toBe(-6)` },
  ],
}
