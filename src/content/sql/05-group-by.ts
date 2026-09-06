import type { Exercise } from '@/types/exercise'
import { returnsColumns, returnsRows, usesSql } from '@/engine/sql/checks'
import { SCHEMA, SCHEMA_BRIEF } from './schema'

export const exercise: Exercise = {
  id: 'sql-05-group-by',
  language: 'sql',
  title: 'GROUP BY: agregar por grupos',
  difficulty: 2,
  concepts: ['GROUP BY', 'HAVING', 'COUNT por grupo'],
  theory: `## La idea

En la unidad anterior contabas **todo**. \`GROUP BY\` cuenta **por grupos**: parte las filas
en montones según una columna y aplica la agregación a cada montón por separado.

~~~sql
SELECT ciudad, COUNT(*) AS pacientes
FROM pacientes
GROUP BY ciudad;
~~~

De seis filas salen cuatro: una por ciudad distinta. Ya no devuelve pacientes, devuelve
**ciudades con su cuenta**.

## La regla que hay que recordar

Todo lo que pongas en el \`SELECT\` tiene que ser, o bien una columna por la que agrupas, o
bien una función de agregación. No hay más opciones, y tiene sentido: dentro de un grupo
hay varios valores de las demás columnas, así que no se puede elegir uno.

~~~sql
SELECT ciudad, nombre, COUNT(*)   -- mal: ¿qué nombre, si en Madrid hay dos?
FROM pacientes
GROUP BY ciudad;
~~~

## WHERE filtra filas, HAVING filtra grupos

Es la distinción clave de esta unidad:

~~~sql
SELECT ciudad, COUNT(*) AS pacientes
FROM pacientes
WHERE edad >= 30          -- descarta filas ANTES de agrupar
GROUP BY ciudad
HAVING COUNT(*) > 1;      -- descarta grupos DESPUÉS de agrupar
~~~

\`WHERE\` no puede usar \`COUNT(*)\`, porque en ese momento los grupos todavía no existen.
Y \`HAVING\` sin \`GROUP BY\` no tiene mucho sentido.

## El orden completo

~~~
SELECT
FROM
WHERE      -- filtra filas
GROUP BY   -- hace los montones
HAVING     -- filtra montones
ORDER BY   -- ordena el resultado
LIMIT
~~~

## Agrupar por varias columnas

\`GROUP BY ciudad, estado\` hace un grupo por cada combinación que exista. Cuidado: el
número de filas del resultado se dispara enseguida.

## Errores típicos

- Poner en el \`SELECT\` una columna que no está en el \`GROUP BY\`.
- Usar \`WHERE COUNT(*) > 1\` en vez de \`HAVING\`.
- Agrupar por una columna con valores casi únicos: sale un grupo por fila y no resume nada.`,
  brief: `Cuenta cuántas citas hay **de cada estado**.

Dos columnas, \`estado\` y \`total\`, ordenadas de más citas a menos.

${SCHEMA_BRIEF}`,
  fileName: 'consulta.sql',
  setup: SCHEMA,
  starterCode: `SELECT estado
FROM citas;
`,
  solution: `SELECT estado, COUNT(*) AS total
FROM citas
GROUP BY estado
ORDER BY total DESC;
`,
  hints: [
    'Agrupa por la columna que quieres ver: GROUP BY estado.',
    'La cuenta de cada grupo es COUNT(*), y necesita AS total.',
    'El ORDER BY puede usar el nombre que le diste: ORDER BY total DESC.',
  ],
  tests: [
    {
      name: 'Las columnas se llaman estado y total',
      code: 'columnas: estado, total',
      check: returnsColumns('estado', 'total'),
    },
    {
      name: 'Agrupa en vez de contar todo junto',
      code: 'la consulta usa GROUP BY',
      check: usesSql(/\bgroup\s+by\b/i, 'Falta el GROUP BY: sin él sale una sola fila con el total.'),
    },
    {
      name: 'Cuenta bien cada estado, de más a menos',
      code: "('confirmada', 4), ('pendiente', 2), ('cancelada', 1)",
      check: returnsRows(
        [
          ['confirmada', 4],
          ['pendiente', 2],
          ['cancelada', 1],
        ],
        { ordered: true },
      ),
    },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "¿En qué se diferencian WHERE y HAVING?",
      options: ["Son sinónimos", "WHERE filtra filas antes de agrupar; HAVING filtra grupos después", "HAVING va siempre antes que WHERE"],
      correct: 1,
      explanation: "Por eso WHERE no puede usar COUNT(*): cuando se ejecuta, los grupos todavía no existen.",
    },
    {
      kind: "drag",
      prompt: "Cuenta las citas de cada estado, de más a menos.",
      snippet: "SELECT estado, COUNT(*) AS total\nFROM citas\n___ estado\nORDER BY total ___;",
      blanks: ["GROUP BY", "DESC"],
      pool: ["GROUP BY", "DESC", "HAVING", "ASC"],
      explanation: "GROUP BY hace los montones y el ORDER BY puede usar el nombre que le diste a la cuenta.",
    },
    {
      kind: "fill",
      prompt: "Quédate solo con los grupos que tengan más de una cita.",
      snippet: "GROUP BY estado ___ COUNT(*) > 1",
      answers: ["HAVING"],
      explanation: "HAVING filtra grupos ya formados; WHERE no podría porque el COUNT aún no existe.",
    },
    {
      kind: "choice",
      prompt: "Con GROUP BY, ¿qué puede aparecer en el SELECT?",
      options: ["Cualquier columna de la tabla", "Solo las columnas del GROUP BY y funciones de agregación", "Solo funciones de agregación"],
      correct: 1,
      explanation: "Dentro de un grupo hay varios valores de las demás columnas: no habría forma de elegir uno.",
    },
    {
      kind: "order",
      prompt: "Ordena la consulta.",
      lines: ["SELECT ciudad, COUNT(*) AS total", "FROM pacientes", "GROUP BY ciudad", "HAVING COUNT(*) > 1;"],
      explanation: "Primero se agrupa y después se filtran los grupos.",
    },
  ],
}
