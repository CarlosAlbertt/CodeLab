import type { Exercise } from '@/types/exercise'
import { returnsColumns, returnsRowCount, returnsRows } from '@/engine/sql/checks'
import { SCHEMA, SCHEMA_BRIEF } from './schema'

export const exercise: Exercise = {
  id: 'sql-01-select',
  language: 'sql',
  title: 'SELECT: sacar datos de una tabla',
  difficulty: 1,
  concepts: ['tabla', 'fila', 'columna', 'SELECT', 'FROM'],
  theory: `## Qué es una base de datos relacional

Una hoja de cálculo enorme, ordenada y con reglas. Los datos viven en **tablas**; cada
tabla tiene **columnas** (los campos, siempre los mismos) y **filas** (cada registro
concreto).

~~~
pacientes
 id | nombre | ciudad    | edad
----+--------+-----------+------
  1 | Ana    | Valencia  |   34
  2 | Luis   | Madrid    |   51
~~~

Cada columna tiene un tipo (\`INTEGER\`, \`TEXT\`...) y la tabla tiene una **clave
primaria**, normalmente \`id\`, que identifica cada fila sin ambigüedad.

## SQL no es un lenguaje de programación normal

En TypeScript le dices al ordenador **cómo** hacer algo, paso a paso. En SQL le dices
**qué** quieres, y el motor decide cómo conseguirlo. Por eso no hay bucles: describes el
resultado y la base de datos se encarga.

## La consulta mínima

~~~sql
SELECT nombre, edad
FROM pacientes;
~~~

Se lee de abajo arriba: *de la tabla \`pacientes\`, dame las columnas \`nombre\` y
\`edad\`*.

- \`SELECT\` — qué columnas quieres.
- \`FROM\` — de qué tabla.
- El punto y coma cierra la consulta.

El resultado es **otra tabla**: tantas filas como tenga la original y solo las columnas que
pediste.

## El asterisco

\`SELECT * FROM pacientes\` devuelve todas las columnas. Va bien para curiosear, pero en
código de verdad se evita: si mañana alguien añade una columna, tu consulta empieza a traer
cosas que no esperabas.

## Renombrar con AS

~~~sql
SELECT nombre AS paciente, edad AS anios
FROM pacientes;
~~~

Cambia el nombre de la columna **en el resultado**, no en la tabla. Es imprescindible en
cuanto empiezas a calcular cosas, porque si no la columna se llama \`COUNT(*)\` o cosas
peores.

## Mayúsculas y formato

Las palabras clave se escriben en mayúsculas por costumbre, no por obligación: \`select\`
funciona igual. Y una consulta larga se parte en varias líneas, una por cláusula. Se lee
mucho mejor.

## Errores típicos

- Escribir mal el nombre de una columna: el error dice \`no such column\`.
- Olvidar la coma entre columnas, o ponerla de más antes del \`FROM\`.
- Confundir el nombre de la tabla con el de la columna.`,
  brief: `Saca el nombre y la ciudad de todos los pacientes, en ese orden.

El resultado tiene que traer exactamente dos columnas, \`nombre\` y \`ciudad\`, y una fila
por cada paciente.

${SCHEMA_BRIEF}`,
  fileName: 'consulta.sql',
  setup: SCHEMA,
  starterCode: `-- Escribe aquí tu consulta
`,
  solution: `SELECT nombre, ciudad
FROM pacientes;
`,
  hints: [
    'El esqueleto es SELECT <columnas> FROM <tabla>;',
    'Las columnas se separan con coma: SELECT nombre, ciudad.',
    'La tabla se llama pacientes, en plural y en minúsculas.',
  ],
  tests: [
    {
      name: 'Devuelve las columnas nombre y ciudad',
      code: 'columnas: nombre, ciudad',
      check: returnsColumns('nombre', 'ciudad'),
    },
    {
      name: 'Trae los seis pacientes',
      code: '6 filas',
      check: returnsRowCount(6),
    },
    {
      name: 'Los datos son los correctos',
      code: "('Ana', 'Valencia'), ('Luis', 'Madrid'), ...",
      check: returnsRows([
        ['Ana', 'Valencia'],
        ['Luis', 'Madrid'],
        ['Zoe', 'Valencia'],
        ['Marc', 'Barcelona'],
        ['Nuria', 'Madrid'],
        ['Iker', 'Bilbao'],
      ]),
    },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "¿Qué devuelve una consulta SELECT?",
      options: ["Un valor suelto", "Otra tabla: sus filas y sus columnas", "Un fichero con los datos"],
      correct: 1,
      explanation: "Por eso se pueden encadenar: el resultado de una consulta puede alimentar a otra.",
    },
    {
      kind: "drag",
      prompt: "Completa las dos cláusulas básicas.",
      snippet: "___ nombre, ciudad\n___ pacientes;",
      blanks: ["SELECT", "FROM"],
      pool: ["SELECT", "FROM", "WHERE"],
      explanation: "SELECT dice qué columnas y FROM de qué tabla.",
    },
    {
      kind: "fill",
      prompt: "Haz que la columna se llame paciente en el resultado.",
      snippet: "SELECT nombre ___ paciente FROM pacientes;",
      answers: ["AS"],
      explanation: "AS solo cambia el nombre en el resultado; la tabla no se toca.",
    },
    {
      kind: "choice",
      prompt: "¿Por qué se evita SELECT * en código de verdad?",
      options: ["Porque siempre es más lento", "Porque si mañana añaden una columna, la consulta empieza a traer cosas que nadie espera", "Porque no se puede combinar con WHERE"],
      correct: 1,
      explanation: "Pedir las columnas por su nombre hace que la consulta siga significando lo mismo dentro de un año.",
    },
    {
      kind: "order",
      prompt: "Ordena la consulta.",
      lines: ["SELECT nombre, edad", "FROM pacientes;"],
      explanation: "Primero qué columnas quieres y después de dónde salen.",
    },
  ],
}
