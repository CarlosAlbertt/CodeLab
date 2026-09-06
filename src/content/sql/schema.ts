/**
 * Shared schema for the SQL track. Every exercise starts from the same clinic
 * database, so the student learns one model instead of six.
 */
export const SCHEMA = `
CREATE TABLE pacientes (
  id     INTEGER PRIMARY KEY,
  nombre TEXT    NOT NULL,
  ciudad TEXT    NOT NULL,
  edad   INTEGER NOT NULL
);

CREATE TABLE citas (
  id          INTEGER PRIMARY KEY,
  paciente_id INTEGER NOT NULL REFERENCES pacientes(id),
  fecha       TEXT    NOT NULL,
  minutos     INTEGER NOT NULL,
  estado      TEXT    NOT NULL
);

INSERT INTO pacientes (id, nombre, ciudad, edad) VALUES
  (1, 'Ana',   'Valencia',  34),
  (2, 'Luis',  'Madrid',    51),
  (3, 'Zoe',   'Valencia',  28),
  (4, 'Marc',  'Barcelona', 45),
  (5, 'Nuria', 'Madrid',    67),
  (6, 'Iker',  'Bilbao',    39);

INSERT INTO citas (id, paciente_id, fecha, minutos, estado) VALUES
  (1, 1, '2026-03-02', 30, 'confirmada'),
  (2, 1, '2026-03-09', 30, 'pendiente'),
  (3, 2, '2026-03-02', 45, 'confirmada'),
  (4, 3, '2026-03-03', 60, 'cancelada'),
  (5, 4, '2026-03-04', 30, 'confirmada'),
  (6, 5, '2026-03-05', 30, 'pendiente'),
  (7, 2, '2026-03-11', 15, 'confirmada');
`

/** Bloque de Markdown con el esquema, para pegar al final de los enunciados. */
export const SCHEMA_BRIEF = `## Las tablas

~~~
pacientes(id, nombre, ciudad, edad)
citas(id, paciente_id, fecha, minutos, estado)
~~~

Hay 6 pacientes y 7 citas. El \`estado\` de una cita es \`'confirmada'\`, \`'pendiente'\` o
\`'cancelada'\`, y \`paciente_id\` apunta al \`id\` de un paciente.`
