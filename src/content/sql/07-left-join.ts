import type { Exercise } from '@/types/exercise'
import { returnsColumns, returnsRows, usesSql } from '@/engine/sql/checks'
import { SCHEMA, SCHEMA_BRIEF } from './schema'

export const exercise: Exercise = {
  id: 'sql-07-left-join',
  language: 'sql',
  title: 'LEFT JOIN: los que no tienen nada',
  difficulty: 3,
  concepts: ['LEFT JOIN', 'NULL', 'COUNT de columna', 'COALESCE'],
  theory: `## El problema del JOIN normal

\`JOIN\` solo devuelve las filas que **encuentran pareja**. Un paciente sin ninguna cita
desaparece del resultado. Y muchas veces ese es justo el que te interesa: el que todavía no
ha reservado, el producto que nadie ha comprado, el usuario que no ha entrado nunca.

## LEFT JOIN

Conserva **todas** las filas de la tabla de la izquierda (la del \`FROM\`), tengan pareja o
no. Cuando no la tienen, las columnas de la derecha llegan a \`NULL\`:

~~~sql
SELECT p.nombre, c.fecha
FROM pacientes p
LEFT JOIN citas c ON c.paciente_id = p.id;
~~~

Iker, que no tiene citas, aparece con la fecha a \`NULL\`.

## La trampa del COUNT

Aquí está el error clásico de esta unidad:

~~~sql
SELECT p.nombre, COUNT(*) AS citas
FROM pacientes p
LEFT JOIN citas c ON c.paciente_id = p.id
GROUP BY p.id;
~~~

A Iker le sale **1**, no 0. Porque \`COUNT(*)\` cuenta **filas**, y a Iker le corresponde
una fila, aunque venga llena de \`NULL\`.

La solución es contar una columna de la tabla de la derecha, porque \`COUNT(columna)\`
ignora los nulos:

~~~sql
COUNT(c.id) AS citas
~~~

## COALESCE

Con las sumas pasa algo parecido: \`SUM\` de un grupo sin filas reales devuelve \`NULL\`, no
cero. \`COALESCE(SUM(c.minutos), 0)\` devuelve el primer valor que no sea nulo, así que
convierte ese \`NULL\` en un \`0\`.

## La otra trampa: filtrar la tabla derecha

~~~sql
LEFT JOIN citas c ON c.paciente_id = p.id
WHERE c.estado = 'confirmada'
~~~

Esto rompe el \`LEFT JOIN\`. Las filas de Iker tienen \`estado\` a \`NULL\`, y \`NULL\`
comparado con cualquier cosa no es cierto, así que el \`WHERE\` lo elimina y vuelves a
tener un \`JOIN\` normal. La condición sobre la tabla derecha va **dentro del ON**.

## Errores típicos

- \`COUNT(*)\` en un \`LEFT JOIN\`: los que no tienen nada salen con 1.
- Filtrar la tabla derecha en el \`WHERE\` y cargarse el efecto del \`LEFT\`.
- Esperar un 0 donde en realidad hay un \`NULL\`.`,
  brief: `Saca **todos los pacientes** con el número de citas que tiene cada uno, incluidos los que
no tienen ninguna.

Columnas \`nombre\` y \`citas\`, ordenadas de más citas a menos y, en caso de empate, por
nombre alfabéticamente.

${SCHEMA_BRIEF}`,
  fileName: 'consulta.sql',
  setup: SCHEMA,
  starterCode: `SELECT p.nombre, COUNT(*) AS citas
FROM pacientes p
JOIN citas c ON c.paciente_id = p.id
GROUP BY p.id
ORDER BY citas DESC, p.nombre;
`,
  solution: `SELECT p.nombre, COUNT(c.id) AS citas
FROM pacientes p
LEFT JOIN citas c ON c.paciente_id = p.id
GROUP BY p.id, p.nombre
ORDER BY citas DESC, p.nombre;
`,
  hints: [
    'La plantilla usa JOIN: cámbialo por LEFT JOIN para que no se pierda Iker.',
    'COUNT(*) le daría 1 a quien no tiene ninguna. Cuenta una columna de la tabla derecha: COUNT(c.id).',
    'Agrupa por el paciente, no por la cita.',
  ],
  tests: [
    {
      name: 'Las columnas se llaman nombre y citas',
      code: 'columnas: nombre, citas',
      check: returnsColumns('nombre', 'citas'),
    },
    {
      name: 'Conserva a los pacientes sin citas',
      code: 'la consulta usa LEFT JOIN',
      check: usesSql(
        /\bleft\s+(outer\s+)?join\b/i,
        'Con un JOIN normal, quien no tiene citas desaparece del resultado.',
      ),
    },
    {
      name: 'Cuenta bien, y a Iker le corresponde un cero',
      code: "('Ana', 2), ('Luis', 2), ('Marc', 1), ('Nuria', 1), ('Zoe', 1), ('Iker', 0)",
      check: returnsRows(
        [
          ['Ana', 2],
          ['Luis', 2],
          ['Marc', 1],
          ['Nuria', 1],
          ['Zoe', 1],
          ['Iker', 0],
        ],
        { ordered: true },
      ),
    },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "En un LEFT JOIN, a quien no tiene ninguna cita, COUNT(*) le da...",
      options: ["0, que es lo correcto", "1, porque le corresponde una fila llena de NULL", "NULL"],
      correct: 1,
      explanation: "COUNT(*) cuenta filas, y esa fila existe aunque venga vacía. Por eso hay que contar una columna de la tabla derecha.",
    },
    {
      kind: "fill",
      prompt: "Cuenta sin que los nulos sumen.",
      snippet: "___(c.id) AS citas",
      answers: ["COUNT"],
      explanation: "COUNT de una columna ignora los NULL, así que a quien no tiene citas le sale 0.",
    },
    {
      kind: "drag",
      prompt: "Conserva a todos los pacientes.",
      snippet: "FROM pacientes p\n___ ___ citas c ON c.paciente_id = p.id",
      blanks: ["LEFT", "JOIN"],
      pool: ["LEFT", "JOIN", "INNER", "ON"],
      explanation: "LEFT conserva todas las filas de la tabla del FROM, tengan pareja o no.",
    },
    {
      kind: "choice",
      prompt: "Filtrar la tabla derecha en el WHERE de un LEFT JOIN...",
      options: ["No cambia nada", "Lo convierte de hecho en un JOIN normal", "Da error"],
      correct: 1,
      explanation: "Las filas sin pareja tienen NULL, no pasan el filtro y desaparecen. La condición va dentro del ON.",
    },
    {
      kind: "fill",
      prompt: "Convierte en cero el NULL de una suma vacía.",
      snippet: "___(SUM(c.minutos), 0) AS minutos",
      answers: ["COALESCE"],
      explanation: "COALESCE devuelve el primer valor que no sea nulo.",
    },
  ],
}
