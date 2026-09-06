import type { Exercise } from '@/types/exercise'
import { returnsColumns, returnsRows, usesSql } from '@/engine/sql/checks'
import { SCHEMA, SCHEMA_BRIEF } from './schema'

export const exercise: Exercise = {
  id: 'sql-03-orden',
  language: 'sql',
  title: 'ORDER BY y LIMIT: ordenar y quedarse con unos pocos',
  difficulty: 1,
  concepts: ['ORDER BY', 'ASC', 'DESC', 'LIMIT', 'DISTINCT'],
  theory: `## Sin ORDER BY no hay orden

Esta es la parte que más cuesta creer: **una consulta sin \`ORDER BY\` no garantiza ningún
orden**. Puede devolverte las filas como estaban insertadas hoy y de otra forma mañana,
según cómo decida resolverlo el motor.

Si el orden te importa, pídelo.

~~~sql
SELECT nombre, edad
FROM pacientes
ORDER BY edad DESC;
~~~

- \`ASC\` de menor a mayor. Es lo que se aplica si no dices nada.
- \`DESC\` de mayor a menor.

## Ordenar por varias columnas

~~~sql
ORDER BY ciudad ASC, edad DESC
~~~

Primero por ciudad; y dentro de cada ciudad, por edad de mayor a menor. La segunda columna
solo decide cuando hay empate en la primera. Es la forma de hacer que el resultado sea
siempre el mismo aunque haya valores repetidos.

## LIMIT

~~~sql
SELECT nombre FROM pacientes ORDER BY edad DESC LIMIT 3;
~~~

Se queda con las 3 primeras filas **del resultado ya ordenado**. \`LIMIT\` sin \`ORDER BY\`
te da tres filas cualesquiera, que casi nunca es lo que quieres.

\`OFFSET\` se salta las primeras: \`LIMIT 3 OFFSET 3\` da de la cuarta a la sexta. Así se
pagina.

## El orden real de las cláusulas

~~~
SELECT   -- qué columnas
FROM     -- de dónde
WHERE    -- qué filas
ORDER BY -- en qué orden
LIMIT    -- cuántas
~~~

Escrito así siempre, aunque el motor por dentro empiece por \`FROM\`.

## DISTINCT

\`SELECT DISTINCT ciudad FROM pacientes\` quita las repetidas: devuelve cada ciudad una
sola vez.

## Errores típicos

- Dar por hecho un orden que no has pedido.
- Poner \`LIMIT\` antes que \`ORDER BY\`: no compila, y aunque compilara no haría lo que
  crees.
- Ordenar por una columna que no está en el \`SELECT\` y luego no entender el resultado
  (se puede hacer, pero se lee peor).`,
  brief: `Saca los **tres pacientes más mayores**: su nombre y su edad, del más mayor al más joven.

${SCHEMA_BRIEF}`,
  fileName: 'consulta.sql',
  setup: SCHEMA,
  starterCode: `SELECT nombre, edad
FROM pacientes;
`,
  solution: `SELECT nombre, edad
FROM pacientes
ORDER BY edad DESC
LIMIT 3;
`,
  hints: [
    'De mayor a menor es DESC; si no pones nada, ordena al revés.',
    'LIMIT va siempre al final, después del ORDER BY.',
    'Los tres más mayores son Nuria, Luis y Marc, en ese orden.',
  ],
  tests: [
    {
      name: 'Devuelve las columnas nombre y edad',
      code: 'columnas: nombre, edad',
      check: returnsColumns('nombre', 'edad'),
    },
    {
      name: 'Pide el orden explícitamente',
      code: 'la consulta usa ORDER BY',
      check: usesSql(/\border\s+by\b/i, 'Sin ORDER BY el orden no está garantizado: pídelo.'),
    },
    {
      name: 'Devuelve los tres primeros, del mayor al menor',
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
      kind: "choice",
      prompt: "Sin ORDER BY, ¿en qué orden llegan las filas?",
      options: ["Siempre por clave primaria", "Siempre como se insertaron", "En ninguno garantizado: puede cambiar"],
      correct: 2,
      explanation: "Si el orden te importa, pídelo. Que hoy salga bien no significa que mañana también.",
    },
    {
      kind: "fill",
      prompt: "Ordena de mayor a menor.",
      snippet: "ORDER BY edad ___",
      answers: ["DESC"],
      explanation: "ASC es lo que se aplica si no dices nada, así que solo hace falta escribir DESC.",
    },
    {
      kind: "drag",
      prompt: "Quédate con los tres más mayores.",
      snippet: "ORDER BY edad ___\n___ 3;",
      blanks: ["DESC", "LIMIT"],
      pool: ["DESC", "LIMIT", "ASC", "OFFSET"],
      explanation: "LIMIT recorta el resultado ya ordenado, así que va siempre al final.",
    },
    {
      kind: "choice",
      prompt: "¿Qué hace ORDER BY ciudad, edad DESC?",
      options: ["Ordena por ciudad y, dentro de cada una, por edad de mayor a menor", "Ordena por edad y luego por ciudad", "Ordena las dos de mayor a menor"],
      correct: 0,
      explanation: "La segunda columna solo decide cuando hay empate en la primera.",
    },
    {
      kind: "order",
      prompt: "Ordena la consulta completa.",
      lines: ["SELECT nombre, edad", "FROM pacientes", "ORDER BY edad DESC", "LIMIT 3;"],
      explanation: "SELECT, FROM, ORDER BY y LIMIT, siempre en ese orden.",
    },
  ],
}
