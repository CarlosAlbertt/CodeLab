import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'ts-03-arrays',
  language: 'typescript',
  title: 'Arrays: filter, map y reduce',
  difficulty: 2,
  concepts: ['arrays', 'filter', 'reduce', 'number[]'],
  theory: `## Arrays tipados

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
Comprueba la longitud antes.`,
  brief: `Implementa \`mediaAprobados\`, que recibe un array de notas y devuelve la **media de las
notas iguales o mayores que 5**, redondeada a dos decimales.

Si no hay ninguna nota aprobada, devuelve \`0\`.

Ejemplo: \`[3, 7, 9, 5]\` → aprobadas \`[7, 9, 5]\` → media \`7\`.`,
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
