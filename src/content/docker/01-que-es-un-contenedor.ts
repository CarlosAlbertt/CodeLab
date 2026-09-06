import type { Exercise } from '@/types/exercise'
import { check, inOrder, requires } from '@/engine/docker/checks'
import { instructionsOf } from '@/engine/docker/dockerfile'

export const exercise: Exercise = {
  id: 'docker-01-que-es-un-contenedor',
  language: 'docker',
  title: 'Qué es un contenedor',
  difficulty: 1,
  concepts: ['imagen', 'contenedor', 'FROM', 'WORKDIR', 'COPY', 'CMD'],
  theory: `## El problema que resuelve

"En mi máquina funciona". Tu aplicación necesita una versión concreta de Node, unas
variables de entorno, unos ficheros en su sitio. En el portátil de al lado falta algo y
deja de arrancar.

Un **contenedor** es tu aplicación empaquetada con todo lo que necesita para ejecutarse:
el sistema de ficheros, las dependencias, las variables. Se ejecuta igual en tu portátil,
en el de un compañero y en el servidor, porque es literalmente el mismo paquete.

## Imagen y contenedor no son lo mismo

Es la distinción que más cuesta al principio:

- Una **imagen** es la plantilla: un paquete de solo lectura, construido una vez.
- Un **contenedor** es una imagen en marcha. De una misma imagen puedes arrancar veinte
  contenedores a la vez, y cada uno vive su vida.

Si vienes de programar: la imagen es la clase y el contenedor es el objeto. Si no: la
imagen es la receta impresa y el contenedor es el plato que sale de ella.

## No es una máquina virtual

Una máquina virtual lleva dentro un sistema operativo entero, con su propio arranque. Un
contenedor comparte el núcleo del sistema anfitrión y solo aísla lo suyo. Por eso pesa
megas en vez de gigas y arranca en un segundo en vez de en un minuto.

## El Dockerfile

Un **Dockerfile** es la receta escrita: una lista de instrucciones, una por línea, en
mayúsculas. Docker las ejecuta en orden para construir la imagen.

~~~dockerfile
FROM node:22-alpine
WORKDIR /app
COPY app.js .
CMD ["node", "app.js"]
~~~

Línea a línea:

- \`FROM node:22-alpine\` — parte de una imagen que ya trae Node 22 instalado. Nunca se
  empieza de cero: siempre se parte de algo. \`alpine\` es una variante de Linux muy
  pequeña, así que la imagen final pesa poco.
- \`WORKDIR /app\` — a partir de aquí, el directorio de trabajo dentro del contenedor es
  \`/app\`. Lo crea si no existe.
- \`COPY app.js .\` — copia el fichero de **tu equipo** al contenedor. El punto es
  "aquí", es decir, \`/app\`.
- \`CMD ["node", "app.js"]\` — el comando que se ejecuta **al arrancar el contenedor**.
  No se ejecuta al construir.

## Construir y ejecutar

Dos comandos, dos momentos distintos:

~~~bash
docker build -t mi-app .      # construye la imagen y le pone el nombre mi-app
docker run mi-app             # arranca un contenedor a partir de ella
~~~

El punto final de \`docker build\` es el **contexto**: la carpeta desde la que se pueden
copiar ficheros. Por eso \`COPY\` solo ve lo que hay dentro de ella.

## De dónde salen las imágenes base

De un **registro**, que por defecto es Docker Hub. Cuando escribes \`FROM node:22-alpine\`,
Docker se la descarga la primera vez y la guarda en tu equipo.

Lo que va detrás de los dos puntos es la **etiqueta**, normalmente la versión. Fíjala
siempre: si pones \`node\` a secas equivale a \`node:latest\`, y "la última" de hoy no es
la misma que la de dentro de tres meses.

## Errores típicos

- Confundir imagen con contenedor: \`docker run\` no construye nada, y \`docker build\` no
  ejecuta la aplicación.
- Esperar que \`CMD\` se ejecute durante el build. Se ejecuta al arrancar.
- Copiar un fichero que está fuera de la carpeta del contexto: \`COPY\` no puede.
- Usar \`:latest\`, y que un día la imagen base cambie y se rompa lo que funcionaba.`,
  brief: `Escribe el Dockerfile de una aplicación Node de un solo fichero.

Tiene que hacer cuatro cosas, en este orden:

1. Partir de la imagen \`node:22-alpine\`.
2. Poner el directorio de trabajo en \`/app\`.
3. Copiar \`app.js\` al directorio de trabajo.
4. Arrancar con \`node app.js\`, usando la **forma de lista**: \`CMD ["node", "app.js"]\`.

Aquí no se ejecuta Docker de verdad: se lee tu Dockerfile y se comprueba que dice lo que
tiene que decir.`,
  fileName: 'Dockerfile',
  starterCode: `# Escribe aquí las cuatro instrucciones
`,
  solution: `FROM node:22-alpine

WORKDIR /app

COPY app.js .

CMD ["node", "app.js"]
`,
  hints: [
    'La primera línea siempre es FROM: sin imagen base no hay dónde ejecutar nada.',
    'WORKDIR /app crea el directorio y se queda dentro; después, el punto de COPY significa /app.',
    'La forma de lista de CMD lleva corchetes y cada palabra entre comillas: CMD ["node", "app.js"].',
  ],
  tests: [
    {
      name: 'Parte de node:22-alpine',
      code: 'FROM node:22-alpine',
      check: requires('FROM', /^node:22-alpine\b/, 'Falta FROM node:22-alpine como primera instrucción.'),
    },
    {
      name: 'El directorio de trabajo es /app',
      code: 'WORKDIR /app',
      check: requires('WORKDIR', /^\/app\/?$/, 'Falta WORKDIR /app.'),
    },
    {
      name: 'Copia app.js al contenedor',
      code: 'COPY app.js .',
      check: requires('COPY', /\bapp\.js\b/, 'Falta COPY app.js . para meter el fichero en la imagen.'),
    },
    {
      name: 'WORKDIR va antes que COPY',
      code: 'El orden importa: primero se entra en /app y luego se copia.',
      check: inOrder(
        { keyword: 'WORKDIR' },
        { keyword: 'COPY' },
        'COPY va después de WORKDIR: si no, el punto no apunta a /app.',
      ),
    },
    {
      name: 'Arranca con CMD en forma de lista',
      code: 'CMD ["node", "app.js"]',
      check: check((doc) => {
        const cmd = instructionsOf(doc, 'CMD')[0]
        if (!cmd) return 'Falta CMD: sin él, el contenedor no sabe qué ejecutar al arrancar.'
        if (!cmd.args.startsWith('[')) {
          return 'Usa la forma de lista, con corchetes: CMD ["node", "app.js"].'
        }
        return /"node"\s*,\s*"app\.js"/.test(cmd.args)
          ? null
          : 'El comando tiene que ser ["node", "app.js"].'
      }),
    },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "¿Qué es exactamente una imagen?",
      options: ["Un contenedor que está en marcha", "Una plantilla de solo lectura desde la que se arrancan contenedores", "Una máquina virtual con su propio sistema operativo"],
      correct: 1,
      explanation: "La imagen es la receta y el contenedor el plato. De una imagen puedes arrancar todos los contenedores que quieras.",
    },
    {
      kind: "drag",
      prompt: "Coloca la instrucción que hace cada cosa.",
      snippet: "___ node:22-alpine\n___ /app\n___ app.js .\n___ [\"node\", \"app.js\"]",
      blanks: ["FROM", "WORKDIR", "COPY", "CMD"],
      pool: ["FROM", "WORKDIR", "COPY", "CMD", "RUN"],
      explanation: "FROM elige la base, WORKDIR entra en el directorio, COPY mete ficheros y CMD dice qué ejecutar al arrancar.",
    },
    {
      kind: "choice",
      prompt: "¿Cuándo se ejecuta lo que pone en CMD?",
      options: ["Al construir la imagen, junto con los RUN", "Al arrancar un contenedor a partir de la imagen", "Cada vez que se copia un fichero"],
      correct: 1,
      explanation: "RUN se ejecuta al construir; CMD solo deja apuntado el comando de arranque.",
    },
    {
      kind: "order",
      prompt: "Ordena el Dockerfile más simple que existe.",
      lines: ["FROM node:22-alpine", "WORKDIR /app", "COPY app.js .", "CMD [\"node\", \"app.js\"]"],
      explanation: "Primero la base, luego el sitio de trabajo, después los ficheros y por último el arranque.",
    },
    {
      kind: "fill",
      prompt: "Construye la imagen y ponle el nombre mi-app.",
      snippet: "docker build ___ mi-app .",
      answers: ["-t", "--tag"],
      explanation: "-t es la etiqueta o nombre. El punto final es el contexto: la carpeta desde la que se puede copiar.",
    },
  ],
}
