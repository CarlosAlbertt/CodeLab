# CodeLab

Aplicación local para aprender a programar. Cada pista se recorre igual:

**teoría → caso práctico → ... → proyecto final**

Cada unidad tiene su apartado de teoría (con ejemplos y errores típicos) y, detrás, un
caso práctico con editor, tests y solución. Al final de la pista hay un proyecto completo
que integra todo lo visto. El código se compila y se ejecuta de verdad, y los fallos se
explican en castellano.

Pistas previstas: **TypeScript** (lista), SQL, Java, HTML y CSS.

## Arrancar

```bash
npm install
npm run dev
```

Abre http://localhost:5173.

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (genera antes el bundle de tipos). |
| `npm run build` | Typecheck + build de producción en `dist/`. |
| `npm test` | Verifica que **cada solución incluida pasa sus propios tests**. |
| `npm run typecheck` | Solo `vue-tsc --noEmit`. |

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

Ocho unidades — tipos y funciones, parámetros por defecto, `filter`/`map`/`reduce`,
interfaces, uniones y narrowing, genéricos, clases y `async`/`await` — y un proyecto
final, **Agenda de una clínica**, que junta las seis piezas: interfaces para los datos,
unión discriminada para el resultado de reservar, una utilidad genérica, una clase con
estado privado, arrays para consultarlo y `async` para importar pacientes.

## Añadir una unidad

1. Crea `src/content/typescript/09-lo-que-sea.ts` copiando la forma de cualquier otra.
2. Regístrala en `src/content/typescript/index.ts`.
3. `npm test` comprueba que la solución pasa sus tests y que la plantilla inicial no.

Campos: `theory` (el apartado previo) y `brief` (el enunciado) admiten Markdown ligero
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
  views/LessonView.vue     Apartado de teoría (previo al caso práctico)
  views/ExerciseView.vue   Caso práctico: enunciado, editor y resultados
  components/              Editor, Markdown y panel de resultados
```

Para añadir un lenguaje basta con escribir sus ejercicios y registrar un `Runner` en
`src/engine/index.ts`. El resto de la aplicación no cambia.

## Siguientes pasos

- **Java**: backend Spring Boot local que compile en memoria y ejecute JUnit; el motor
  del navegador será un `Runner` que hable con él por HTTP.
- **SQL**: SQLite compilado a WebAssembly, comparando el resultado de la consulta.
- **HTML / CSS**: vista previa en un iframe y comprobaciones sobre el DOM resultante.
