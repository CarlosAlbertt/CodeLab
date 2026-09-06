import type { Exercise } from '@/types/exercise'
import { returnsColumns, returnsRows } from '@/engine/sql/checks'
import { SCHEMA, SCHEMA_BRIEF } from './schema'

export const exercise: Exercise = {
  id: 'sql-04-agregacion',
  language: 'sql',
  title: 'Contar y sumar: funciones de agregación',
  difficulty: 2,
  concepts: ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'AS'],
  theory: `## De muchas filas a una

Hasta ahora cada fila de la tabla daba una fila del resultado. Las **funciones de
agregación** hacen lo contrario: cogen muchas filas y devuelven **un único valor**.

~~~sql
SELECT COUNT(*) AS total
FROM citas;
~~~

Devuelve una sola fila con un solo número.

## Las cinco de siempre

~~~sql
COUNT(*)          -- cuántas filas hay
COUNT(columna)    -- cuántas tienen valor (los NULL no cuentan)
SUM(minutos)      -- la suma
AVG(edad)         -- la media
MIN(edad), MAX(edad)
~~~

La diferencia entre \`COUNT(*)\` y \`COUNT(columna)\` importa: la primera cuenta filas, la
segunda cuenta valores que no son \`NULL\`. Si la columna nunca es nula, dan lo mismo.

## Ponles nombre

Sin \`AS\`, la columna del resultado se llama literalmente \`COUNT(*)\`. Feo de leer y
molesto de usar desde código:

~~~sql
SELECT COUNT(*) AS total_citas, SUM(minutos) AS minutos_totales
FROM citas;
~~~

## Se pueden filtrar antes

\`WHERE\` se aplica **antes** de agregar, así que sirve para decidir qué filas entran en la
cuenta:

~~~sql
SELECT COUNT(*) AS confirmadas
FROM citas
WHERE estado = 'confirmada';
~~~

## No mezcles agregados con columnas sueltas

~~~sql
SELECT nombre, COUNT(*) FROM pacientes;   -- ¿el nombre de cuál?
~~~

No tiene sentido: el \`COUNT\` resume seis filas en una, y \`nombre\` tiene seis valores
distintos. Otros motores directamente dan error; SQLite escoge uno cualquiera, que es peor
porque parece que funciona. Para eso está \`GROUP BY\`, que viene en la unidad siguiente.

## Cuidado con la media

\`AVG\` ignora los \`NULL\`: la media de \`(10, 20, NULL)\` es 15, no 10. Y devuelve
decimales, así que a veces querrás \`ROUND(AVG(edad), 1)\`.

## Errores típicos

- Olvidar el \`AS\` y acabar con columnas llamadas \`SUM(minutos)\`.
- Contar con \`COUNT(columna)\` sin darte cuenta de que los \`NULL\` no entran.
- Esperar que \`AVG\` devuelva un entero.`,
  brief: `Saca de una sola consulta el **número total de citas** y la **suma de sus minutos**.

Las columnas se tienen que llamar \`total\` y \`minutos\`.

${SCHEMA_BRIEF}`,
  fileName: 'consulta.sql',
  setup: SCHEMA,
  starterCode: `SELECT
FROM citas;
`,
  solution: `SELECT COUNT(*) AS total,
       SUM(minutos) AS minutos
FROM citas;
`,
  hints: [
    'COUNT(*) cuenta filas; SUM(minutos) suma esa columna.',
    'Las dos van en el mismo SELECT, separadas por coma.',
    'Sin AS, las columnas se llamarían COUNT(*) y SUM(minutos): ponles nombre.',
  ],
  tests: [
    {
      name: 'Las columnas se llaman total y minutos',
      code: 'columnas: total, minutos',
      check: returnsColumns('total', 'minutos'),
    },
    {
      name: 'Hay 7 citas que suman 240 minutos',
      code: '(7, 240)',
      check: returnsRows([[7, 240]]),
    },
  ],
  quiz: [
    {
      kind: "drag",
      prompt: "Cuenta las filas y suma los minutos.",
      snippet: "SELECT ___(*) AS total, ___(minutos) AS minutos\nFROM citas;",
      blanks: ["COUNT", "SUM"],
      pool: ["COUNT", "SUM", "AVG", "MAX"],
      explanation: "COUNT cuenta filas y SUM suma los valores de una columna.",
    },
    {
      kind: "choice",
      prompt: "¿En qué se diferencian COUNT(*) y COUNT(columna)?",
      options: ["En nada", "COUNT(columna) no cuenta las filas donde esa columna es NULL", "COUNT(*) es más lento"],
      correct: 1,
      explanation: "Esa diferencia es justo lo que salva el LEFT JOIN de más adelante.",
    },
    {
      kind: "fill",
      prompt: "Ponle nombre a la columna calculada.",
      snippet: "SELECT AVG(edad) ___ media FROM pacientes;",
      answers: ["AS"],
      explanation: "Sin AS, la columna se llamaría literalmente AVG(edad).",
    },
    {
      kind: "choice",
      prompt: "SELECT nombre, COUNT(*) FROM pacientes; ¿qué problema tiene?",
      options: ["Ninguno", "No tiene sentido: COUNT resume las seis filas en una, pero nombre tiene seis valores", "Da error de sintaxis en cualquier motor"],
      correct: 1,
      explanation: "Algunos motores dan error y SQLite escoge un nombre cualquiera, que es peor porque parece que funciona.",
    },
    {
      kind: "order",
      prompt: "Ordena la consulta que cuenta solo las confirmadas.",
      lines: ["SELECT COUNT(*) AS confirmadas", "FROM citas", "WHERE estado = 'confirmada';"],
      explanation: "El WHERE se aplica antes de contar, así que decide qué filas entran.",
    },
  ],
}
