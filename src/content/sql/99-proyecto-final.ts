import type { Exercise } from '@/types/exercise'
import { returnsColumns, returnsRows, usesSql } from '@/engine/sql/checks'
import { SCHEMA, SCHEMA_BRIEF } from './schema'

export const exercise: Exercise = {
  id: 'sql-99-proyecto-final',
  language: 'sql',
  title: 'Informe de actividad por ciudad',
  kind: 'project',
  difficulty: 3,
  concepts: ['LEFT JOIN', 'GROUP BY', 'CASE', 'COALESCE', 'ORDER BY'],
  theory: `## Qué vas a construir

El informe que pediría la dirección de la clínica: **por cada ciudad, cuántos pacientes hay
y cuántos minutos de consulta confirmada suman**.

Es una sola consulta, pero necesita casi todo lo de la pista a la vez.

## Las piezas

- **LEFT JOIN**, porque Bilbao tiene un paciente sin ninguna cita y tiene que aparecer con
  un cero, no desaparecer.
- **GROUP BY** por ciudad.
- Una suma **condicional**, porque solo cuentan las citas confirmadas.
- **COALESCE**, porque un grupo sin citas suma \`NULL\`, no cero.
- **ORDER BY** con desempate, porque hay dos ciudades con los mismos minutos.

## Sumar solo algunas filas

Este es el truco nuevo. Podrías filtrar con \`WHERE c.estado = 'confirmada'\`, pero ya
sabes de la unidad de \`LEFT JOIN\` que eso se cargaría a Bilbao.

La solución es **contar cero** para las que no cuentan, en vez de eliminarlas:

~~~sql
SUM(CASE WHEN c.estado = 'confirmada' THEN c.minutos ELSE 0 END)
~~~

\`CASE WHEN\` es el "si esto, entonces aquello" de SQL. Aquí devuelve los minutos cuando la
cita está confirmada y un \`0\` cuando no, así que la suma sale correcta sin perder filas.

## Contar sin duplicar

Ojo con contar pacientes después de un \`JOIN\`: Ana tiene dos citas, así que aparece en
dos filas. \`COUNT(p.id)\` diría que en Valencia hay tres pacientes.

\`COUNT(DISTINCT p.id)\` cuenta cada paciente una sola vez.

## Cómo abordarlo

Por partes, ejecutando a cada paso:

1. Primero el \`LEFT JOIN\` y el \`GROUP BY\` con un \`COUNT(*)\` cualquiera. Comprueba que
   salen cuatro ciudades.
2. Cambia la cuenta por \`COUNT(DISTINCT p.id)\` y comprueba los números.
3. Añade la suma condicional.
4. Y por último el orden.

## Errores típicos

- Filtrar las confirmadas en el \`WHERE\` y perder Bilbao.
- \`COUNT(p.id)\` en vez de \`COUNT(DISTINCT p.id)\`.
- Ordenar solo por minutos y que dos ciudades empatadas salgan en orden aleatorio.`,
  brief: `Escribe **una sola consulta** que devuelva, por cada ciudad:

- \`ciudad\` — el nombre de la ciudad.
- \`pacientes\` — cuántos pacientes hay en ella, contando cada uno una vez.
- \`minutos\` — la suma de los minutos de sus citas **confirmadas**, o \`0\` si no tiene.

Tienen que salir **las cuatro ciudades**, incluida la que no tiene ninguna cita.

Ordénalas de más minutos a menos y, cuando dos empaten, por nombre de ciudad
alfabéticamente.

El resultado esperado es:

~~~
Madrid     2   60
Barcelona  1   30
Valencia   2   30
Bilbao     1    0
~~~

${SCHEMA_BRIEF}`,
  fileName: 'consulta.sql',
  setup: SCHEMA,
  starterCode: `SELECT p.ciudad
FROM pacientes p
GROUP BY p.ciudad;
`,
  solution: `SELECT p.ciudad,
       COUNT(DISTINCT p.id) AS pacientes,
       COALESCE(SUM(CASE WHEN c.estado = 'confirmada' THEN c.minutos ELSE 0 END), 0) AS minutos
FROM pacientes p
LEFT JOIN citas c ON c.paciente_id = p.id
GROUP BY p.ciudad
ORDER BY minutos DESC, p.ciudad;
`,
  hints: [
    'Empieza por el LEFT JOIN y el GROUP BY p.ciudad, y comprueba que salen cuatro filas.',
    'Cuenta con COUNT(DISTINCT p.id): con el JOIN, quien tiene dos citas aparece dos veces.',
    "Para sumar solo las confirmadas: SUM(CASE WHEN c.estado = 'confirmada' THEN c.minutos ELSE 0 END).",
    'El desempate se escribe como segunda columna del ORDER BY: ORDER BY minutos DESC, p.ciudad.',
  ],
  tests: [
    {
      name: 'Las columnas se llaman ciudad, pacientes y minutos',
      code: 'columnas: ciudad, pacientes, minutos',
      check: returnsColumns('ciudad', 'pacientes', 'minutos'),
    },
    {
      name: 'Conserva las ciudades sin citas',
      code: 'la consulta usa LEFT JOIN',
      check: usesSql(
        /\bleft\s+(outer\s+)?join\b/i,
        'Sin LEFT JOIN, Bilbao desaparece del informe.',
      ),
    },
    {
      name: 'Cuenta cada paciente una sola vez',
      code: 'COUNT(DISTINCT ...)',
      check: usesSql(
        /count\s*\(\s*distinct\b/i,
        'Con el JOIN, quien tiene varias citas aparece varias veces: hace falta COUNT(DISTINCT ...).',
      ),
    },
    {
      name: 'El informe cuadra, en el orden pedido',
      code: "('Madrid', 2, 60), ('Barcelona', 1, 30), ('Valencia', 2, 30), ('Bilbao', 1, 0)",
      check: returnsRows(
        [
          ['Madrid', 2, 60],
          ['Barcelona', 1, 30],
          ['Valencia', 2, 30],
          ['Bilbao', 1, 0],
        ],
        { ordered: true },
      ),
    },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "¿Por qué no filtrar las confirmadas con WHERE c.estado = 'confirmada'?",
      options: ["Porque el WHERE no admite esa columna", "Porque eliminaría las filas con NULL y perderías las ciudades sin citas confirmadas", "Porque es más lento"],
      correct: 1,
      explanation: "Es la trampa del LEFT JOIN: filtrar la tabla derecha en el WHERE lo convierte en un JOIN normal.",
    },
    {
      kind: "drag",
      prompt: "Suma solo los minutos de las citas confirmadas.",
      snippet: "SUM(___ WHEN c.estado = 'confirmada' ___ c.minutos ELSE 0 ___)",
      blanks: ["CASE", "THEN", "END"],
      pool: ["CASE", "THEN", "END", "WHERE"],
      explanation: "En vez de eliminar filas, se les hace valer cero. Así la suma sale bien sin perder ciudades.",
    },
    {
      kind: "fill",
      prompt: "Cuenta cada paciente una sola vez, aunque tenga varias citas.",
      snippet: "COUNT(___ p.id) AS pacientes",
      answers: ["DISTINCT"],
      explanation: "Después del JOIN, quien tiene dos citas aparece en dos filas.",
    },
    {
      kind: "choice",
      prompt: "Dos ciudades empatan a minutos. ¿Cómo se decide cuál va antes?",
      options: ["No se puede decidir", "Añadiendo una segunda columna al ORDER BY", "Con LIMIT"],
      correct: 1,
      explanation: "Sin desempate, el orden entre las empatadas no está garantizado y el informe cambia entre ejecuciones.",
    },
    {
      kind: "order",
      prompt: "Ordena el esqueleto del informe.",
      lines: ["SELECT p.ciudad, COUNT(DISTINCT p.id) AS pacientes", "FROM pacientes p", "LEFT JOIN citas c ON c.paciente_id = p.id", "GROUP BY p.ciudad", "ORDER BY p.ciudad;"],
      explanation: "SELECT, FROM con su JOIN, GROUP BY y por último el orden.",
    },
  ],
}
