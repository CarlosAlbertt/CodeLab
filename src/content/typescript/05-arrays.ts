import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'ts-05-arrays',
  language: 'typescript',
  title: 'Arrays: filter, map y reduce',
  difficulty: 2,
  concepts: ['arrays', 'filter', 'reduce', 'number[]'],
  theory: `## La idea

Un array es una lista ordenada de valores: las notas de una clase, los productos de un
carrito. Ya sabes recorrerlo con un \`for\`, así que podrías hacerlo todo a mano.

Pero resulta que el 90% de lo que se hace con una lista son tres cosas: **quedarse con
algunos**, **transformarlos todos** o **reducirlos a un único valor**. Y para esas tres hay
métodos ya hechos. Son el bucle de la unidad anterior, con el acumulador bien puesto y sin
posibilidad de equivocarte con los índices.

## Arrays tipados

\`number[]\` es un array de números; \`string[]\`, de textos. El compilador no te dejará
meter un texto donde esperas números.

## Los tres métodos que más se usan

~~~ts
const notas: number[] = [3, 7, 9, 5]

// filter: se queda con los que cumplen la condición
const aprobadas = notas.filter((n) => n >= 5)   // [7, 9, 5]

// map: transforma cada elemento
const sobre10 = notas.map((n) => n * 10)        // [30, 70, 90, 50]

// reduce: acumula todo en un solo valor
const suma = notas.reduce((acc, n) => acc + n, 0) // 24
~~~

En \`reduce\`, el \`0\` final es el **valor inicial** del acumulador. Ponerlo siempre
evita errores cuando el array está vacío.

## Cuidado con la división por cero

Si filtras y no queda ningún elemento, dividir entre \`length\` da \`NaN\`.
Comprueba la longitud antes.

## Encadenar métodos

\`filter\` y \`map\` devuelven un array nuevo, así que se encadenan de forma natural:

~~~ts
const total = productos
  .filter((p) => p.activo)
  .map((p) => p.precio)
  .reduce((suma, precio) => suma + precio, 0)
~~~

Ninguno de los tres modifica el array original: eso es justo lo que los hace seguros.

## Errores típicos

- \`reduce\` sin valor inicial: falla cuando el array está vacío.
- Confundir \`filter\` (los mismos elementos, menos cantidad) con \`map\` (la misma cantidad, elementos transformados).
- Dividir entre \`length\` sin comprobar que no sea cero: el resultado es \`NaN\`.`,
  brief: `Implementa \`mediaAprobados\`, que recibe un array de notas y devuelve la **media de las
notas iguales o mayores que 5**, redondeada a dos decimales.

Si no hay ninguna nota aprobada, devuelve \`0\`.

Ejemplo: \`[3, 7, 9, 5]\` → aprobadas \`[7, 9, 5]\` → media \`7\`.`,
  quiz: [
    {
      kind: 'fill',
      prompt: "Quédate solo con las notas aprobadas.",
      snippet: "const aprobadas = notas.___((n) => n >= 5)",
      answers: ["filter"],
      explanation: "filter devuelve un array nuevo con los elementos que cumplen la condición.",
    },
    {
      kind: 'fill',
      prompt: "Convierte cada nota a base 100.",
      snippet: "const sobre100 = notas.___((n) => n * 10)",
      answers: ["map"],
      explanation: "map transforma cada elemento y mantiene la misma cantidad.",
    },
    {
      kind: 'fill',
      prompt: "Pon el valor inicial que le falta al acumulador.",
      snippet: "const suma = notas.reduce((acc, n) => acc + n, ___)",
      answers: ["0"],
      explanation: "Sin valor inicial, reduce falla cuando el array está vacío.",
    },
    {
      kind: "order",
      prompt: "Ordena la cadena que suma los precios de los productos activos.",
      lines: ["const total = productos", "  .filter((p) => p.activo)", "  .map((p) => p.precio)", "  .reduce((suma, precio) => suma + precio, 0)"],
      explanation: "Primero se descartan los inactivos, luego se queda solo el precio, y al final se acumula todo en un número.",
    },
    {
      kind: "choice",
      prompt: "Sobre un array de 5 elementos, ¿cuántos devuelve map?",
      options: ["Solo los que cumplan una condición", "Siempre 5", "Uno solo"],
      correct: 1,
      explanation: "map transforma cada elemento y mantiene la cantidad. El que cambia la cantidad es filter.",
    },
    {
      kind: "drag",
      prompt: "Coloca el método que toca en cada paso.",
      snippet: "const aprobadas = notas.___((n) => n >= 5)\nconst suma = aprobadas.___((acc, n) => acc + n, 0)",
      blanks: ["filter", "reduce"],
      pool: ["filter", "reduce", "map"],
      explanation: "filter selecciona y reduce acumula. map no pinta nada aquí porque no queremos transformar las notas.",
    },
  ],
  starterCode: `function mediaAprobados(notas: number[]): number {
  // Filtra las aprobadas, calcula la media y redondea a 2 decimales
  return 0
}
`,
  solution: `function mediaAprobados(notas: number[]): number {
  const aprobadas = notas.filter((nota) => nota >= 5)
  if (aprobadas.length === 0) return 0

  const suma = aprobadas.reduce((acumulado, nota) => acumulado + nota, 0)
  return Math.round((suma / aprobadas.length) * 100) / 100
}
`,
  hints: [
    'Primero filtra: notas.filter((n) => n >= 5).',
    'Si el array filtrado está vacío devuelve 0 antes de dividir, o te saldrá NaN.',
    'La suma con reduce necesita valor inicial: reduce((acc, n) => acc + n, 0).',
  ],
  tests: [
    {
      name: 'Calcula la media de las notas aprobadas',
      code: `expect(mediaAprobados([3, 7, 9, 5])).toBe(7)`,
    },
    {
      name: 'Ignora los suspensos',
      code: `expect(mediaAprobados([1, 2, 10])).toBe(10)`,
    },
    {
      name: 'Devuelve 0 si no hay aprobados',
      code: `expect(mediaAprobados([1, 2, 4.9])).toBe(0)`,
    },
    {
      name: 'Devuelve 0 con un array vacío',
      code: `expect(mediaAprobados([])).toBe(0)`,
    },
    {
      name: 'Redondea la media a dos decimales',
      code: `expect(mediaAprobados([5, 6, 8])).toBe(6.33)`,
    },
  ],
}
