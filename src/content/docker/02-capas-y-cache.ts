import type { Exercise } from '@/types/exercise'
import { check, inOrder, requires } from '@/engine/docker/checks'
import { instructionsOf } from '@/engine/docker/dockerfile'

export const exercise: Exercise = {
  id: 'docker-02-capas-y-cache',
  language: 'docker',
  title: 'Capas y caché',
  difficulty: 2,
  concepts: ['capas', 'caché de build', 'RUN', 'orden de instrucciones'],
  theory: `## Una imagen es una pila de capas

Cada instrucción del Dockerfile crea una **capa**: una foto de lo que cambió en el sistema
de ficheros respecto a la anterior. La imagen final es todas esas capas apiladas.

Esto tiene una consecuencia enorme: Docker **guarda cada capa en caché**. Si vuelves a
construir y una instrucción no ha cambiado nada, no la ejecuta otra vez, reutiliza la capa
que ya tenía.

## La caché se rompe hacia abajo

La regla que hay que interiorizar: en cuanto una instrucción cambia, **esa capa y todas las
de debajo se vuelven a construir**. Las de arriba se conservan.

Por eso el orden del Dockerfile no es cuestión de gusto: lo que cambia poco va arriba, y lo
que cambia a todas horas va abajo.

## El caso que verás siempre

Mira este Dockerfile, que es correcto pero lento:

~~~dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm ci
CMD ["node", "server.js"]
~~~

\`COPY . .\` copia todo tu proyecto. Cambias una coma en cualquier fichero y esa capa
cambia, así que \`npm ci\` se vuelve a ejecutar entero: descarga otra vez todas las
dependencias. Cada build, minutos perdidos.

La versión buena separa las dos cosas:

~~~dockerfile
FROM node:22-alpine
WORKDIR /app

# Solo el manifiesto: cambia pocas veces
COPY package.json package-lock.json ./
RUN npm ci

# Y ahora sí, el código, que cambia constantemente
COPY . .

CMD ["node", "server.js"]
~~~

Mientras no toques las dependencias, \`npm ci\` sale de la caché y el build tarda segundos.
Es el truco más rentable de todo Docker.

## Encadenar los RUN

Cada \`RUN\` es una capa. Y una capa no puede borrar lo que hay en las anteriores: aunque
elimines un fichero después, sigue ocupando en la imagen final.

~~~dockerfile
# Mal: la caché de apk se queda dentro de la imagen para siempre
RUN apk add --no-cache curl
RUN rm -rf /var/cache/apk/*

# Bien: se instala y se limpia en la misma capa
RUN apk add --no-cache curl && rm -rf /var/cache/apk/*
~~~

## npm ci, no npm install

\`npm ci\` instala exactamente lo que dice \`package-lock.json\` y falla si no cuadra.
\`npm install\` puede actualizar versiones por su cuenta, y entonces dos builds del mismo
código dan imágenes distintas. En un Dockerfile quieres siempre lo reproducible.

## Errores típicos

- Poner \`COPY . .\` antes de instalar dependencias, y perder la caché en cada build.
- Encadenar cosas que no tienen nada que ver en un solo \`RUN\` gigante: entonces
  cualquier cambio invalida todo el bloque.
- Creer que borrar un fichero en una capa posterior lo quita de la imagen. No lo quita.`,
  brief: `Reescribe el Dockerfile de un servidor Node para que aproveche la caché.

El orden que se pide:

1. \`FROM node:22-alpine\`
2. \`WORKDIR /app\`
3. Copiar **solo** \`package.json\` y \`package-lock.json\`
4. \`RUN npm ci\`
5. Copiar el resto del proyecto con \`COPY . .\`
6. \`CMD ["node", "server.js"]\`

Los pasos 3 y 4 tienen que ir antes del 5: ahí está toda la gracia.`,
  fileName: 'Dockerfile',
  starterCode: `FROM node:22-alpine
WORKDIR /app

# Este Dockerfile funciona, pero reinstala las dependencias en cada build.
# Reordénalo para que npm ci salga de la caché mientras no toques el package.json.
COPY . .
RUN npm ci

CMD ["node", "server.js"]
`,
  solution: `FROM node:22-alpine

WORKDIR /app

# Solo el manifiesto: mientras no cambie, la capa siguiente sale de la caché.
COPY package.json package-lock.json ./
RUN npm ci

# El código, que cambia en cada commit, va lo más abajo posible.
COPY . .

CMD ["node", "server.js"]
`,
  hints: [
    'Necesitas dos COPY distintos: uno solo para los manifiestos y otro para el resto.',
    'RUN npm ci tiene que quedar entre los dos COPY.',
    'COPY package.json package-lock.json ./ copia los dos ficheros al directorio de trabajo.',
  ],
  tests: [
    {
      name: 'Copia los manifiestos por separado',
      code: 'COPY package.json package-lock.json ./',
      check: requires(
        'COPY',
        /package(\.json|-lock\.json|\*\.json)/,
        'Falta un COPY solo para package.json y package-lock.json.',
      ),
    },
    {
      name: 'Instala las dependencias con npm ci',
      code: 'RUN npm ci',
      check: requires('RUN', /npm\s+ci/, 'Falta RUN npm ci (npm install no es reproducible).'),
    },
    {
      name: 'El manifiesto se copia antes de instalar',
      code: 'COPY package*.json  ->  RUN npm ci',
      check: inOrder(
        { keyword: 'COPY', pattern: /package/ },
        { keyword: 'RUN', pattern: /npm\s+ci/ },
        'El COPY de los manifiestos tiene que ir antes de RUN npm ci.',
      ),
    },
    {
      name: 'El código se copia después de instalar',
      code: 'RUN npm ci  ->  COPY . .',
      check: inOrder(
        { keyword: 'RUN', pattern: /npm\s+ci/ },
        { keyword: 'COPY', pattern: /^\.\s+\.?/ },
        'COPY . . tiene que ir después de RUN npm ci: si va antes, la caché no sirve de nada.',
      ),
    },
    {
      name: 'Sigue copiando todo el proyecto',
      code: 'COPY . .',
      check: check((doc) =>
        instructionsOf(doc, 'COPY').some((item) => /^\.\s+\.?$/.test(item.args.trim()))
          ? null
          : 'Falta COPY . . para meter el código de la aplicación.',
      ),
    },
    {
      name: 'Arranca el servidor',
      code: 'CMD ["node", "server.js"]',
      check: requires('CMD', /"node"\s*,\s*"server\.js"/, 'Falta CMD ["node", "server.js"].'),
    },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "Cambias una línea de tu código. ¿Qué se reconstruye?",
      options: ["Solo la capa de esa instrucción", "Esa capa y todas las que van por debajo", "La imagen entera, siempre"],
      correct: 1,
      explanation: "La caché se invalida hacia abajo. Por eso lo que cambia mucho va lo más abajo posible.",
    },
    {
      kind: "order",
      prompt: "Ordena el Dockerfile para aprovechar la caché.",
      lines: ["COPY package.json package-lock.json ./", "RUN npm ci", "COPY . .", "CMD [\"node\", \"server.js\"]"],
      explanation: "Los manifiestos cambian poco, así que van antes de instalar; el código cambia siempre y va después.",
    },
    {
      kind: "choice",
      prompt: "¿Por qué npm ci y no npm install en un Dockerfile?",
      options: ["Porque es más corto de escribir", "Porque instala exactamente lo del package-lock, así que dos builds dan lo mismo", "Porque npm install no funciona dentro de un contenedor"],
      correct: 1,
      explanation: "npm install puede subir versiones por su cuenta; en una imagen quieres siempre lo reproducible.",
    },
    {
      kind: "fill",
      prompt: "Instala y limpia en la misma capa, para que la caché no se quede dentro.",
      snippet: "RUN apk add --no-cache curl ___ rm -rf /var/cache/apk/*",
      answers: ["&&"],
      explanation: "Si el borrado va en otro RUN, la basura ya está grabada en la capa anterior y sigue ocupando.",
    },
    {
      kind: "choice",
      prompt: "Un fichero que borras en una capa posterior, ¿desaparece de la imagen?",
      options: ["Sí, deja de ocupar", "No: la capa anterior lo sigue conteniendo", "Solo si usas --squash"],
      correct: 1,
      explanation: "Las capas se apilan, no se reescriben. Por eso los secretos copiados por error no se arreglan borrándolos después.",
    },
  ],
}
