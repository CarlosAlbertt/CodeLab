import type { Exercise } from '@/types/exercise'
import { returnsColumns, returnsRows, usesSql } from '@/engine/sql/checks'
import { SCHEMA, SCHEMA_BRIEF } from './schema'

export const exercise: Exercise = {
  id: 'sql-02-where',
  language: 'sql',
  title: 'WHERE: quedarse con las filas que interesan',
  difficulty: 1,
  concepts: ['WHERE', 'operadores', 'AND', 'OR', 'IN', 'LIKE', 'NULL'],
  theory: `## La idea

\`SELECT\` elige **columnas**. \`WHERE\` elige **filas**: se queda solo con las que cumplen
una condición.

~~~sql
SELECT nombre, edad
FROM pacientes
WHERE edad >= 40;
~~~

El orden de las cláusulas es fijo: \`SELECT\`, \`FROM\`, \`WHERE\`. No se pueden barajar.

## Los operadores

~~~sql
WHERE edad = 34          -- igual (un solo =, no como en TypeScript)
WHERE edad <> 34         -- distinto (también vale !=)
WHERE edad BETWEEN 30 AND 50
WHERE ciudad IN ('Madrid', 'Valencia')
WHERE nombre LIKE 'A%'   -- empieza por A
~~~

Dos cosas que sorprenden viniendo de programar:

- La igualdad es **un solo** \`=\`. En SQL no existe \`===\`.
- Los textos van entre **comillas simples**. Las dobles significan otra cosa (nombres de
  columnas), así que no las uses para valores.

En \`LIKE\`, el \`%\` es "cualquier cosa" y el \`_\` es "un carácter cualquiera".

## Combinar condiciones

~~~sql
WHERE ciudad = 'Valencia' AND edad > 30
WHERE ciudad = 'Madrid' OR ciudad = 'Bilbao'
WHERE NOT ciudad = 'Madrid'
~~~

\`AND\` se evalúa antes que \`OR\`, igual que la multiplicación antes que la suma. Si
mezclas los dos, pon paréntesis aunque creas que no hacen falta: es una fuente clásica de
resultados raros.

## NULL no es cero ni cadena vacía

\`NULL\` significa *no se sabe*. Y lo desconocido no se puede comparar:

~~~sql
WHERE telefono = NULL     -- nunca es cierto, ni siquiera para los NULL
WHERE telefono IS NULL    -- así sí
WHERE telefono IS NOT NULL
~~~

Es de los errores que más tiempo hacen perder, porque no da error: simplemente devuelve
cero filas.

## Errores típicos

- Usar \`==\` para comparar.
- Poner los textos entre comillas dobles.
- Mezclar \`AND\` y \`OR\` sin paréntesis.
- Comparar con \`= NULL\` en vez de \`IS NULL\`.`,
  brief: `Saca el nombre y la edad de los pacientes de **Valencia** que tengan **más de 30 años**.

Las dos condiciones se tienen que cumplir a la vez.

${SCHEMA_BRIEF}`,
  fileName: 'consulta.sql',
  setup: SCHEMA,
  starterCode: `SELECT nombre, edad
FROM pacientes;
`,
  solution: `SELECT nombre, edad
FROM pacientes
WHERE ciudad = 'Valencia' AND edad > 30;
`,
  hints: [
    'El WHERE va después del FROM, en su propia línea.',
    "Los textos van entre comillas simples: ciudad = 'Valencia'.",
    'Las dos condiciones se unen con AND. Ojo: "más de 30" es > 30, no >= 30.',
  ],
  tests: [
    {
      name: 'Devuelve las columnas nombre y edad',
      code: 'columnas: nombre, edad',
      check: returnsColumns('nombre', 'edad'),
    },
    {
      name: 'Filtra con WHERE',
      code: 'la consulta usa WHERE',
      check: usesSql(/\bwhere\b/i, 'Sin WHERE no hay filtro: la consulta devuelve toda la tabla.'),
    },
    {
      name: 'Solo queda Ana',
      code: "('Ana', 34)",
      check: returnsRows([['Ana', 34]]),
    },
  ],
  quiz: [
    {
      kind: "fill",
      prompt: "Compara la ciudad con un texto.",
      snippet: "WHERE ciudad ___ 'Valencia'",
      answers: ["="],
      explanation: "En SQL la igualdad es un solo =. No existe === ni ==.",
    },
    {
      kind: "choice",
      prompt: "¿Cuál encuentra a los que no tienen teléfono?",
      options: ["WHERE telefono = NULL", "WHERE telefono IS NULL", "WHERE telefono == NULL"],
      correct: 1,
      explanation: "NULL es \"no se sabe\", y lo desconocido no se puede comparar. Con = no da error: devuelve cero filas.",
    },
    {
      kind: "drag",
      prompt: "Los de Valencia con más de 30 años.",
      snippet: "WHERE ciudad = 'Valencia' ___ edad ___ 30",
      blanks: ["AND", ">"],
      pool: ["AND", "OR", ">", ">="],
      explanation: "Las dos condiciones tienen que cumplirse, y \"más de 30\" deja fuera al que tiene exactamente 30.",
    },
    {
      kind: "choice",
      prompt: "¿Qué encuentra LIKE 'A%'?",
      options: ["Los que contienen una A", "Los que empiezan por A", "Los que terminan en A"],
      correct: 1,
      explanation: "El % es \"cualquier cosa\": al final significa que después de la A puede venir lo que sea.",
    },
    {
      kind: "order",
      prompt: "Ordena las cláusulas.",
      lines: ["SELECT nombre, edad", "FROM pacientes", "WHERE edad > 30;"],
      explanation: "El orden es fijo: SELECT, FROM y luego WHERE.",
    },
  ],
}
