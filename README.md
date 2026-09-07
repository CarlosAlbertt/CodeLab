# CodeLab

Aplicación local para aprender a programar. Cada pista se recorre igual:

**teoría → quiz de repaso → caso práctico → ... → proyecto final**

Cada unidad tiene su apartado de teoría (con ejemplos y errores típicos), un quiz de
repaso y, detrás, un caso práctico con editor, tests y solución. La pista empieza desde
cero: la primera unidad explica qué es un programa, un valor, una variable y una función,
sin dar nada por sabido.

El quiz tiene cuatro formatos: escribir lo que falta, elegir una opción, **arrastrar
fichas** a los huecos del código y **ordenar líneas** sueltas. Al final de cada pista hay
un proyecto completo que integra todo lo visto. El código se comprueba de verdad, y los
fallos se explican en castellano.

Seis pistas: **TypeScript**, **SQL**, **HTML**, **CSS**, **Docker** y **Java**.

## Arrancar

```bash
npm install
npm run dev
```

Abre http://localhost:5173.

### En Vercel

La aplicación es estática, así que se despliega tal cual: importa el repositorio en Vercel
y detecta Vite solo. `vercel.json` ya trae lo único que no es automático:

- La **regla de rutas** (`rewrites`), para que recargar en `/pista/docker` no dé 404: el
  router vive en el navegador, así que cualquier ruta desconocida tiene que devolver
  `index.html`.
- Cabeceras de caché para `/assets` (los ficheros llevan hash en el nombre) y para el
  bundle de tipos.

El bundle de tipos no está versionado, pero `npm run build` lo genera antes de compilar,
así que no hay nada que preparar a mano.

### El servicio de Java

Las cinco primeras pistas funcionan solo con el navegador. **Java necesita un JDK**, así que
hay un servicio local que compila y ejecuta. Se arranca con un comando, sin Maven y sin
descargar nada:

```bash
java backend/CodeLabServer.java
```

Déjalo abierto mientras practicas. Si no está, la pista de Java te lo dice en el panel de
resultados en lugar de fallar en silencio; el resto sigue funcionando igual.

Cómo funciona: compila tu clase junto a una clase de pruebas generada, y ejecuta los tests
en un **proceso hijo**, para poder matarlo si tu código se queda colgado. Escucha solo en
`127.0.0.1` a propósito: compila y ejecuta código, así que no debe salir de tu equipo. Está
pensado para practicar en local con tu propio código, no para exponerlo.

### Con Docker

Sin instalar Node en el equipo:

```bash
docker compose up --build
```

Queda en http://localhost:8080. Para desarrollar dentro de un contenedor, con recarga en
caliente:

```bash
docker compose -f docker-compose.dev.yml up
```

El `Dockerfile` es multi-stage: Node construye la aplicación y la imagen final es solo
nginx más la carpeta `dist`. Es, además, el proyecto final de la pista de Docker.

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (genera antes el bundle de tipos). |
| `npm run build` | Typecheck + build de producción en `dist/`. |
| `npm test` | Verifica que **cada solución incluida pasa sus propios tests**, que las plantillas iniciales no, y que los quiz están bien formados. Los casos de Java se saltan solos si el servicio no está arrancado. |
| `npm run typecheck` | Solo `vue-tsc --noEmit`. |

## Cómo se corrige cada pista

Cada lenguaje registra un **motor** en `src/engine/index.ts`; el resto de la aplicación no
cambia.

- **TypeScript** — se compila y se ejecuta de verdad (ver abajo).
- **SQL** — se ejecuta contra una base de datos real: SQLite compilado a WebAssembly
  (`sql.js`), en un worker. Cada ejercicio parte del mismo esquema de clínica, y las
  comprobaciones miran las filas devueltas, no el texto de la consulta.
- **HTML** — se analiza el `Document` que construye el navegador, así que la sangría, las
  comillas o el orden de los atributos dan igual: lo que se comprueba es la estructura.
- **CSS** — se leen las reglas declaradas con un parser propio. El resultado visual se ve
  en la **vista previa en vivo** que hay junto al editor, en un iframe aislado.
- **Java** — la única que no corre en el navegador: se compila y se ejecuta con el JDK de
  tu equipo, a través de un servicio local (ver abajo).
- **Docker** — no hay demonio en el navegador, así que los ejercicios se corrigen
  **leyendo el fichero**: un parser de Dockerfile saca las instrucciones con su número de
  línea, y cada test comprueba una cosa concreta (que `npm ci` vaya antes de `COPY . .`,
  que la segunda etapa copie con `--from`, que `CMD` use la forma de lista...).

## Cómo funciona la pista de TypeScript

No hay trampa ni comparación de textos: se monta un `ts.Program` real dentro de un
Web Worker con `strict: true`, y se compilan tres ficheros juntos.

- `solucion.ts` — lo que escribes tú.
- `tests.ts` — las comprobaciones del ejercicio (las puedes leer en la pestaña *Tests*).
- `harness.d.ts` — declara `console` y `expect` para el compilador.

Si hay errores de tipos, el código **no llega a ejecutarse**: se muestran los errores del
compilador con una explicación en castellano de los códigos más habituales. Si compila,
se ejecutan los tests uno a uno y se muestra qué esperaba cada uno y qué recibió.

El worker corre en un hilo aparte, así que un bucle infinito se corta a los 8 segundos
en lugar de colgar la página.

El bundle de tipos (`public/ts-libs/lib.bundle.d.ts`) lo genera `scripts/build-ts-lib.mjs`
aplanando la cadena de `lib.es2020.d.ts`. No se versiona: se regenera en cada `dev`/`build`.

## Contenido de la pista de TypeScript

Once unidades, de menos a más:

| | Unidad | De qué va |
| --- | --- | --- |
| 01 | Qué es programar | valores, variables, tipos, funciones |
| 02 | Tipos básicos y funciones | anotaciones, plantillas, ternario |
| 03 | Parámetros con valor por defecto | opcional vs por defecto, redondeo |
| 04 | Decisiones | `if`/`else`, comparaciones, `&&` y `\|\|` |
| 05 | Bucles | `while`, `for`, `for...of`, acumuladores |
| 06 | Arrays | `filter`, `map`, `reduce` |
| 07 | Interfaces y objetos | modelar datos |
| 08 | Uniones | tipos literales y narrowing |
| 09 | Genéricos | funciones como parámetro, `Record` |
| 10 | Clases | estado privado, getters |
| 11 | async / await | promesas y `try`/`catch` |

Y un proyecto final, **Agenda de una clínica**, que junta las piezas: interfaces para los
datos, unión discriminada para el resultado de reservar, una utilidad genérica, una clase
con estado privado, arrays para consultarlo y `async` para importar pacientes.

## Añadir una unidad

1. Crea `src/content/typescript/09-lo-que-sea.ts` copiando la forma de cualquier otra.
2. Regístrala en `src/content/typescript/index.ts`.
3. `npm test` comprueba que la solución pasa sus tests y que la plantilla inicial no.

Campos: `quiz` son las preguntas de repaso; cada una lleva `kind` (`fill`, `choice`,
`drag` u `order`) y los datos de su formato — en `fill` y `drag` el fragmento marca los
huecos con `___`; `theory` (el apartado previo) y `brief` (el
enunciado) admiten Markdown ligero
—encabezados `##`, listas con viñetas y numeradas, `**negrita**`, código con acentos
graves y bloques con `~~~`—. Con `kind: 'project'` la unidad se lista aparte como cierre
de la pista.

## Estructura

```
src/
  types/exercise.ts        Modelo común a todos los lenguajes
  engine/
    index.ts               Registro de motores por lenguaje
    runners/typescript.ts  Motor de TS (worker + timeout)
    worker/core.ts         Compilar y ejecutar (compartido con los tests)
    worker/harness.ts      expect(), captura de consola, tipos del harness
  content/                 Ejercicios por pista
  views/LessonView.vue     Apartado de teoría + quiz de repaso
  views/ExerciseView.vue   Caso práctico: enunciado, editor y resultados
  components/              Editor, Markdown y panel de resultados
```

Para añadir un lenguaje basta con escribir sus ejercicios y registrar un `Runner` en
`src/engine/index.ts`. El resto de la aplicación no cambia.

## Contenido de la pista de SQL

Nueve unidades — `SELECT`, `WHERE`, `ORDER BY`, agregación, `GROUP BY`, `JOIN`,
`LEFT JOIN`, subconsultas y `INSERT`/`UPDATE`/`DELETE` — y un proyecto final: un informe
de actividad por ciudad que necesita casi todo a la vez.

Todas parten de la misma base de datos (`src/content/sql/schema.ts`): pacientes y citas de
una clínica, con los casos límite metidos a propósito — un paciente sin ninguna cita, dos
ciudades empatadas, citas canceladas que no deben contar.

## Contenido de las pistas de HTML y CSS

**HTML**: estructura de una página, texto y enlaces, semántica, imágenes y formularios, más
un proyecto final con una página completa. La accesibilidad va metida en cada unidad —
`lang`, jerarquía de encabezados, `alt`, `label` asociado — y varios tests la comprueban.

**CSS**: selectores y cascada, modelo de caja, flexbox, grid y diseño adaptable, y un
proyecto final que maqueta la página de la pista de HTML. El marcado de cada ejercicio va
en su campo `setup`, y el alumno solo escribe los estilos.

## Contenido de la pista de Java

Seis unidades — tipos y métodos, condicionales y bucles, clases y objetos, colecciones,
interfaces y polimorfismo, y excepciones — y un proyecto final: la misma agenda de la
clínica que hiciste en TypeScript, ahora en Java. Compararlas es parte del ejercicio: el
problema es idéntico y las decisiones cambian (uniones discriminadas frente a excepciones,
objetos literales frente a campos privados).

## Contenido de la pista de Docker

Cinco unidades — qué es un contenedor, capas y caché, `CMD`/`ENV`/`EXPOSE`, multi-stage y
`docker compose` — y un proyecto final: escribir el Dockerfile de esta misma aplicación,
que luego puedes comparar con el que hay en la raíz.

## Siguientes pasos

- **Java**: backend Spring Boot local que compile en memoria y ejecute JUnit; el motor
  del navegador será un `Runner` que hable con él por HTTP.
- **SQL**: SQLite compilado a WebAssembly, comparando el resultado de la consulta.
- **HTML / CSS**: vista previa en un iframe y comprobaciones sobre el DOM resultante.
