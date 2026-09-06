import type { Exercise } from '@/types/exercise'
import { returnsRows, usesSql } from '@/engine/sql/checks'
import { SCHEMA, SCHEMA_BRIEF } from './schema'

export const exercise: Exercise = {
  id: 'sql-09-modificar',
  language: 'sql',
  title: 'INSERT, UPDATE y DELETE',
  difficulty: 2,
  concepts: ['INSERT', 'UPDATE', 'DELETE', 'transacciones'],
  theory: `## Ahora sí se toca la base

Todo lo anterior solo leía. Estas tres instrucciones **cambian** los datos, y por eso hay
que escribirlas con más cuidado.

## INSERT

~~~sql
INSERT INTO pacientes (id, nombre, ciudad, edad)
VALUES (7, 'Elena', 'Sevilla', 41);
~~~

Se listan las columnas y luego los valores, en el mismo orden. Poner los nombres de las
columnas no es obligatorio, pero hazlo siempre: sin ellos, el día que alguien añada una
columna a la tabla, tu \`INSERT\` empieza a meter los valores en el sitio equivocado.

Se pueden insertar varias filas de golpe separando las tuplas con comas.

## UPDATE

~~~sql
UPDATE citas
SET estado = 'cancelada'
WHERE id = 2;
~~~

\`SET\` dice qué cambia y \`WHERE\` a qué filas. Se pueden cambiar varias columnas a la vez
separándolas con comas.

## La regla de oro

**Un \`UPDATE\` o un \`DELETE\` sin \`WHERE\` afecta a toda la tabla.** No pregunta, no
avisa, y no hay deshacer.

~~~sql
DELETE FROM citas;      -- adiós a las siete citas
~~~

La costumbre que salva carreras: escribe primero la consulta como un \`SELECT\`, mira qué
filas salen, y solo entonces cámbiale el principio por \`UPDATE\` o \`DELETE\`.

## DELETE

~~~sql
DELETE FROM citas
WHERE estado = 'cancelada';
~~~

Borra las filas que cumplen la condición. Si la tabla tiene claves foráneas apuntando a
ella, la base de datos puede impedírtelo: no te deja borrar un paciente que todavía tiene
citas, precisamente para que no queden citas huérfanas.

## Transacciones

Cuando varios cambios tienen que ocurrir todos o ninguno:

~~~sql
BEGIN;
UPDATE cuentas SET saldo = saldo - 100 WHERE id = 1;
UPDATE cuentas SET saldo = saldo + 100 WHERE id = 2;
COMMIT;
~~~

Si algo falla en medio, \`ROLLBACK\` deshace todo el bloque. Sin transacción podrías restar
el dinero de una cuenta y no sumarlo en la otra.

## Errores típicos

- \`UPDATE\` o \`DELETE\` sin \`WHERE\`.
- \`INSERT\` sin nombrar las columnas.
- Repetir una clave primaria que ya existe: la base lo rechaza.
- Olvidar el \`COMMIT\` y que los cambios no se guarden.`,
  brief: `Tres instrucciones, una detrás de otra, en el mismo editor:

1. Da de alta a un paciente nuevo: id \`7\`, nombre \`Elena\`, ciudad \`Sevilla\`, edad \`41\`.
2. Cancela la cita con id \`2\`: su estado pasa a \`'cancelada'\`.
3. Borra todas las citas que estén canceladas.

Después de tus instrucciones se ejecuta una consulta de comprobación que cuenta pacientes,
citas y citas canceladas. Deberían quedar **7 pacientes, 5 citas y 0 canceladas**.

${SCHEMA_BRIEF}`,
  fileName: 'consulta.sql',
  setup: SCHEMA,
  verify: `SELECT (SELECT COUNT(*) FROM pacientes) AS pacientes,
       (SELECT COUNT(*) FROM citas) AS citas,
       (SELECT COUNT(*) FROM citas WHERE estado = 'cancelada') AS canceladas;`,
  starterCode: `-- 1. Alta del paciente


-- 2. Cancelar la cita 2


-- 3. Borrar las citas canceladas

`,
  solution: `INSERT INTO pacientes (id, nombre, ciudad, edad)
VALUES (7, 'Elena', 'Sevilla', 41);

UPDATE citas
SET estado = 'cancelada'
WHERE id = 2;

DELETE FROM citas
WHERE estado = 'cancelada';
`,
  hints: [
    'Cada instrucción termina en punto y coma; se pueden escribir las tres seguidas.',
    "En el UPDATE, el SET va antes del WHERE: SET estado = 'cancelada' WHERE id = 2.",
    'El DELETE borra dos citas: la que acabas de cancelar y la que ya estaba cancelada.',
  ],
  tests: [
    {
      name: 'Da de alta al paciente con INSERT',
      code: 'la consulta usa INSERT INTO pacientes',
      check: usesSql(/\binsert\s+into\s+pacientes\b/i, 'Falta el INSERT INTO pacientes.'),
    },
    {
      name: 'Cancela la cita con UPDATE',
      code: 'la consulta usa UPDATE citas ... SET',
      check: usesSql(/\bupdate\s+citas\b[\s\S]*\bset\b/i, 'Falta el UPDATE citas con su SET.'),
    },
    {
      name: 'Borra con DELETE y con filtro',
      code: 'la consulta usa DELETE FROM citas ... WHERE',
      check: usesSql(
        /\bdelete\s+from\s+citas\b[\s\S]*\bwhere\b/i,
        'Falta el DELETE, o le falta el WHERE: sin él te llevarías todas las citas por delante.',
      ),
    },
    {
      name: 'Quedan 7 pacientes, 5 citas y ninguna cancelada',
      code: 'comprobación: (7, 5, 0)',
      check: returnsRows([[7, 5, 0]]),
    },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "¿Qué hace un UPDATE sin WHERE?",
      options: ["Nada, la base lo rechaza", "Cambia todas las filas de la tabla, sin avisar", "Pide confirmación"],
      correct: 1,
      explanation: "No hay deshacer. La costumbre que salva carreras: escribirlo antes como SELECT y mirar qué filas salen.",
    },
    {
      kind: "drag",
      prompt: "Cancela la cita número 2.",
      snippet: "UPDATE citas\n___ estado = 'cancelada'\n___ id = 2;",
      blanks: ["SET", "WHERE"],
      pool: ["SET", "WHERE", "VALUES"],
      explanation: "SET dice qué cambia y WHERE a qué filas.",
    },
    {
      kind: "fill",
      prompt: "Añade una fila nueva.",
      snippet: "___ INTO pacientes (id, nombre) VALUES (7, 'Elena');",
      answers: ["INSERT"],
      explanation: "Las columnas se listan primero y los valores después, en el mismo orden.",
    },
    {
      kind: "choice",
      prompt: "¿Por qué nombrar las columnas en un INSERT?",
      options: ["Por costumbre, da igual", "Porque si alguien añade una columna a la tabla, los valores dejarían de ir a su sitio", "Porque es obligatorio"],
      correct: 1,
      explanation: "Sin los nombres, el INSERT depende del orden físico de las columnas, que puede cambiar.",
    },
    {
      kind: "order",
      prompt: "Ordena la transferencia para que no se pierda dinero por el camino.",
      lines: ["BEGIN;", "UPDATE cuentas SET saldo = saldo - 100 WHERE id = 1;", "UPDATE cuentas SET saldo = saldo + 100 WHERE id = 2;", "COMMIT;"],
      explanation: "Dentro de una transacción, o pasan las dos cosas o no pasa ninguna.",
    },
  ],
}
