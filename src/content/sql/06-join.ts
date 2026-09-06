import type { Exercise } from '@/types/exercise'
import { returnsColumns, returnsRows, usesSql } from '@/engine/sql/checks'
import { SCHEMA, SCHEMA_BRIEF } from './schema'

export const exercise: Exercise = {
  id: 'sql-06-join',
  language: 'sql',
  title: 'JOIN: cruzar dos tablas',
  difficulty: 2,
  concepts: ['JOIN', 'ON', 'clave foránea', 'alias de tabla'],
  theory: `## Por qué los datos están repartidos

La tabla \`citas\` no guarda el nombre del paciente: guarda su \`paciente_id\`. Podría
parecer incómodo, pero es lo correcto. Si el nombre estuviera copiado en cada cita, al
corregir una errata habría que cambiarlo en siete sitios, y alguno se quedaría sin
actualizar.

Esa columna que apunta a otra tabla es una **clave foránea**. Y \`JOIN\` es la forma de
volver a juntarlas cuando las necesitas a la vez.

## La sintaxis

~~~sql
SELECT pacientes.nombre, citas.fecha
FROM pacientes
JOIN citas ON citas.paciente_id = pacientes.id;
~~~

- \`FROM pacientes\` — la tabla de partida.
- \`JOIN citas\` — con cuál se cruza.
- \`ON ...\` — **cómo** se emparejan las filas de una con las de la otra.

El resultado tiene una fila por cada pareja que cumple el \`ON\`. Un paciente con tres
citas aparece tres veces, una por cita. No es un fallo: es lo que has pedido.

## Alias

Escribir el nombre completo de la tabla cansa. Se les pone un alias justo después del
nombre:

~~~sql
SELECT p.nombre, c.fecha
FROM pacientes p
JOIN citas c ON c.paciente_id = p.id
WHERE c.estado = 'confirmada';
~~~

Cuando las dos tablas tienen columnas que se llaman igual (aquí las dos tienen \`id\`), el
prefijo deja de ser una comodidad y pasa a ser obligatorio.

## Nunca olvides el ON

Un \`JOIN\` sin condición cruza **todas** las filas con todas: seis pacientes por siete
citas son cuarenta y dos filas sin ningún sentido. Con tablas grandes eso tumba el
servidor; aquí solo verás un resultado absurdo.

## Dónde va el filtro

\`WHERE\` se aplica al resultado del cruce, así que puede usar columnas de cualquiera de las
dos tablas. Es lo normal: cruzas y luego te quedas con lo que te interesa.

## Errores típicos

- Olvidar el \`ON\`.
- Emparejar por la columna equivocada (\`c.id = p.id\` en vez de \`c.paciente_id = p.id\`):
  parece que funciona y devuelve datos falsos.
- Sorprenderse de que un paciente salga repetido cuando tiene varias citas.
- No poner el prefijo en una columna ambigua.`,
  brief: `Saca el **nombre del paciente y la fecha** de todas las citas **confirmadas**, ordenadas
por fecha de la más antigua a la más reciente.

Las columnas se tienen que llamar \`nombre\` y \`fecha\`.

${SCHEMA_BRIEF}`,
  fileName: 'consulta.sql',
  setup: SCHEMA,
  starterCode: `SELECT
FROM pacientes p
`,
  solution: `SELECT p.nombre, c.fecha
FROM pacientes p
JOIN citas c ON c.paciente_id = p.id
WHERE c.estado = 'confirmada'
ORDER BY c.fecha;
`,
  hints: [
    'El ON empareja la clave foránea con la clave primaria: c.paciente_id = p.id.',
    'Con alias se escribe mucho menos: FROM pacientes p JOIN citas c ...',
    'El WHERE va después del JOIN y puede usar columnas de las dos tablas.',
  ],
  tests: [
    {
      name: 'Las columnas se llaman nombre y fecha',
      code: 'columnas: nombre, fecha',
      check: returnsColumns('nombre', 'fecha'),
    },
    {
      name: 'Cruza las dos tablas con JOIN',
      code: 'la consulta usa JOIN ... ON',
      check: usesSql(/\bjoin\b[\s\S]*\bon\b/i, 'Falta el JOIN con su ON para emparejar las dos tablas.'),
    },
    {
      name: 'Trae las cuatro citas confirmadas con su paciente',
      code: "('Ana', '2026-03-02'), ('Luis', '2026-03-02'), ('Marc', '2026-03-04'), ('Luis', '2026-03-11')",
      check: returnsRows([
        ['Ana', '2026-03-02'],
        ['Luis', '2026-03-02'],
        ['Marc', '2026-03-04'],
        ['Luis', '2026-03-11'],
      ]),
    },
  ],
  quiz: [
    {
      kind: "fill",
      prompt: "Empareja la clave foránea con la primaria.",
      snippet: "JOIN citas c ___ c.paciente_id = p.id",
      answers: ["ON"],
      explanation: "El ON dice cómo se corresponden las filas de las dos tablas.",
    },
    {
      kind: "choice",
      prompt: "Un paciente con tres citas, en el resultado del JOIN...",
      options: ["Aparece una sola vez", "Aparece tres veces, una por cita", "Provoca un error"],
      correct: 1,
      explanation: "El JOIN devuelve una fila por pareja. No es un fallo: es lo que has pedido.",
    },
    {
      kind: "drag",
      prompt: "Ponle alias a cada tabla.",
      snippet: "FROM pacientes ___\nJOIN citas ___ ON c.paciente_id = p.id",
      blanks: ["p", "c"],
      pool: ["p", "c", "ON"],
      explanation: "El alias va justo después del nombre de la tabla, y luego se usa como prefijo.",
    },
    {
      kind: "choice",
      prompt: "¿Qué pasa si olvidas el ON?",
      options: ["Da error de sintaxis", "Cruza todas las filas con todas: 6 x 7 = 42 filas sin sentido", "Se comporta como un LEFT JOIN"],
      correct: 1,
      explanation: "Con tablas grandes eso tumba el servidor; aquí solo verás un resultado absurdo.",
    },
    {
      kind: "order",
      prompt: "Ordena la consulta completa.",
      lines: ["SELECT p.nombre, c.fecha", "FROM pacientes p", "JOIN citas c ON c.paciente_id = p.id", "WHERE c.estado = 'confirmada';"],
      explanation: "El WHERE se aplica al resultado del cruce, así que va después del JOIN.",
    },
  ],
}
