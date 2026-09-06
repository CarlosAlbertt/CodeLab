import type { Exercise } from '@/types/exercise'
import { returnsColumns, returnsRows, usesSql } from '@/engine/sql/checks'
import { SCHEMA, SCHEMA_BRIEF } from './schema'

export const exercise: Exercise = {
  id: 'sql-08-subconsultas',
  language: 'sql',
  title: 'Subconsultas: una consulta dentro de otra',
  difficulty: 3,
  concepts: ['subconsulta', 'IN', 'EXISTS', 'AVG'],
  theory: `## La idea

A veces para filtrar necesitas un dato que también hay que calcular. *Los pacientes que
superan la media de edad*: la media no la sabes de antemano, hay que consultarla.

Una **subconsulta** es una consulta metida entre paréntesis dentro de otra. Se ejecuta
primero, y su resultado se usa como si fuera un valor más.

## Que devuelve un solo valor

~~~sql
SELECT nombre, edad
FROM pacientes
WHERE edad > (SELECT AVG(edad) FROM pacientes);
~~~

La de dentro devuelve un número. La de fuera lo usa como si hubieras escrito \`> 44\`.

## Que devuelve una lista

Con \`IN\`, la subconsulta puede devolver varias filas de **una sola columna**:

~~~sql
SELECT nombre
FROM pacientes
WHERE id IN (SELECT paciente_id FROM citas WHERE estado = 'cancelada');
~~~

*Los pacientes que tienen alguna cita cancelada.* Fíjate en que el resultado no repite
pacientes, aunque tengan tres citas canceladas: eso es lo que la diferencia de un \`JOIN\`.

## EXISTS

\`EXISTS\` solo mira si la subconsulta devuelve algo, sin importarle el qué:

~~~sql
SELECT nombre
FROM pacientes p
WHERE NOT EXISTS (SELECT 1 FROM citas c WHERE c.paciente_id = p.id);
~~~

*Los pacientes sin ninguna cita.* Es la alternativa al \`LEFT JOIN\` de la unidad anterior,
y se lee bastante mejor cuando lo único que quieres es "existe o no existe".

## Subconsulta o JOIN

Muchas veces las dos valen. La regla práctica:

- Si necesitas **columnas** de la otra tabla → \`JOIN\`.
- Si solo necesitas **filtrar** por algo de la otra tabla → subconsulta.

## Errores típicos

- Que la subconsulta de un \`IN\` devuelva varias columnas: solo puede devolver una.
- Que una subconsulta de comparación devuelva varias filas: \`> (SELECT edad FROM ...)\`
  falla si hay más de una.
- Olvidar los paréntesis.
- No caer en que una subconsulta correlacionada (la que menciona la tabla de fuera, como el
  \`EXISTS\` de arriba) se ejecuta una vez por fila: con tablas grandes hay que vigilarlo.`,
  brief: `Saca los pacientes cuya edad **supera la media de edad de todos los pacientes**.

Columnas \`nombre\` y \`edad\`, del más mayor al más joven. La media no la escribas a mano:
tiene que salir de una subconsulta.

${SCHEMA_BRIEF}`,
  fileName: 'consulta.sql',
  setup: SCHEMA,
  starterCode: `SELECT nombre, edad
FROM pacientes
ORDER BY edad DESC;
`,
  solution: `SELECT nombre, edad
FROM pacientes
WHERE edad > (SELECT AVG(edad) FROM pacientes)
ORDER BY edad DESC;
`,
  hints: [
    'La subconsulta va entre paréntesis, dentro del WHERE.',
    'La media de una columna es AVG(edad), y se calcula sobre la misma tabla.',
    'Comparar con un número escrito a mano funcionaría hoy, pero dejaría de funcionar al añadir un paciente.',
  ],
  tests: [
    {
      name: 'Las columnas se llaman nombre y edad',
      code: 'columnas: nombre, edad',
      check: returnsColumns('nombre', 'edad'),
    },
    {
      name: 'La media sale de una subconsulta',
      code: 'la consulta contiene (SELECT AVG(...))',
      check: usesSql(
        /\(\s*select\s+avg\s*\(/i,
        'Calcula la media con una subconsulta: si la escribes a mano, deja de valer en cuanto cambien los datos.',
      ),
    },
    {
      name: 'Quedan los tres que superan la media de 44',
      code: "('Nuria', 67), ('Luis', 51), ('Marc', 45)",
      check: returnsRows(
        [
          ['Nuria', 67],
          ['Luis', 51],
          ['Marc', 45],
        ],
        { ordered: true },
      ),
    },
  ],
  quiz: [
    {
      kind: "drag",
      prompt: "Compara con la media, sin escribirla a mano.",
      snippet: "WHERE edad > (___ ___(edad) FROM pacientes)",
      blanks: ["SELECT", "AVG"],
      pool: ["SELECT", "AVG", "COUNT", "FROM"],
      explanation: "La subconsulta se ejecuta primero y su resultado se usa como si fuera un número.",
    },
    {
      kind: "choice",
      prompt: "Una subconsulta usada con IN puede devolver...",
      options: ["Varias columnas", "Una sola columna, con las filas que hagan falta", "Como mucho una fila"],
      correct: 1,
      explanation: "IN compara un valor contra una lista, así que la lista tiene que ser de una sola columna.",
    },
    {
      kind: "fill",
      prompt: "Los pacientes que no tienen ninguna cita.",
      snippet: "WHERE NOT ___ (SELECT 1 FROM citas c WHERE c.paciente_id = p.id)",
      answers: ["EXISTS"],
      explanation: "EXISTS solo mira si hay algo o no; da igual lo que devuelva la subconsulta.",
    },
    {
      kind: "choice",
      prompt: "¿Cuándo JOIN y cuándo subconsulta?",
      options: ["Siempre JOIN, es más rápido", "Si necesitas columnas de la otra tabla, JOIN; si solo filtrar por ella, subconsulta", "Siempre subconsulta, se lee mejor"],
      correct: 1,
      explanation: "Con subconsulta el resultado no se duplica, que es la diferencia práctica más visible.",
    },
    {
      kind: "order",
      prompt: "Ordena la consulta.",
      lines: ["SELECT nombre, edad", "FROM pacientes", "WHERE edad > (SELECT AVG(edad) FROM pacientes)", "ORDER BY edad DESC;"],
      explanation: "La subconsulta va dentro del WHERE, entre paréntesis.",
    },
  ],
}
