import type { Exercise } from '@/types/exercise'
import { check, copiesFromStage, hasStages, requires } from '@/engine/docker/checks'
import { instructionsOf } from '@/engine/docker/dockerfile'

export const exercise: Exercise = {
  id: 'docker-04-multi-stage',
  language: 'docker',
  title: 'Multi-stage: imágenes pequeñas',
  difficulty: 3,
  concepts: ['multi-stage', 'FROM AS', 'COPY --from', '.dockerignore', 'USER'],
  theory: `## El problema

Para construir una aplicación de frontend necesitas Node, npm y varios cientos de megas de
dependencias. Para **servirla** solo necesitas los ficheros que salen del build y un
servidor web.

Si lo haces todo en un Dockerfile de una sola etapa, la imagen final se lleva también el
compilador, las dependencias de desarrollo y el código fuente. Más peso, más tiempo de
despliegue y más superficie de ataque, todo para nada.

## Dos etapas, una imagen

Un Dockerfile puede tener varios \`FROM\`. Cada uno abre una **etapa** nueva y descarta lo
anterior; solo la última acaba siendo la imagen final. Y de las etapas anteriores puedes
rescatar lo que te interese:

~~~dockerfile
# ---- Etapa 1: construir ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Etapa 2: servir ----
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
~~~

La clave son dos piezas:

- \`AS build\` le pone nombre a la etapa.
- \`COPY --from=build /app/dist ...\` copia desde esa etapa en lugar de desde tu equipo.

La imagen final es nginx más una carpeta de ficheros estáticos: unos pocos megas. Node no
aparece por ningún lado, aunque hiciera falta para construirla.

## .dockerignore

Antes de empezar, Docker le envía al motor toda la carpeta del contexto. Si dentro está
\`node_modules\`, son cientos de megas viajando en cada build para nada, porque las
dependencias se instalan dentro del contenedor.

\`.dockerignore\` funciona igual que \`.gitignore\`:

~~~
node_modules
dist
.git
~~~

Además evita el accidente clásico: que un \`COPY . .\` se lleve dentro de la imagen tu
fichero \`.env\` con las credenciales.

## No ejecutes como root

Por defecto el proceso del contenedor va como \`root\`. Si alguien encuentra un agujero en
tu aplicación, se encuentra con el usuario más poderoso del sistema. Las imágenes de Node
ya traen un usuario \`node\` preparado:

~~~dockerfile
USER node
CMD ["node", "server.js"]
~~~

\`USER\` va **después** de instalar y copiar (esos pasos necesitan permisos) y **antes** de
\`CMD\`.

## Errores típicos

- Una sola etapa, y una imagen de 1,2 GB para servir cuatro ficheros estáticos.
- Olvidar el \`.dockerignore\` y copiar \`node_modules\` del equipo dentro de la imagen.
- Poner \`USER\` demasiado pronto y que falle la instalación por permisos.
- Copiar de la etapa anterior una ruta que no existe: revisa dónde deja el build sus
  ficheros.`,
  brief: `Convierte en multi-stage el Dockerfile de una aplicación de frontend.

**Etapa 1**, llamada \`build\`:

1. Parte de \`node:22-alpine\` y ponle el nombre \`build\` con \`AS\`.
2. \`WORKDIR /app\`, copia los manifiestos, \`npm ci\`, copia el resto y \`npm run build\`.
   El resultado queda en \`/app/dist\`.

**Etapa 2**, la imagen final:

3. Parte de \`nginx:1.27-alpine\`.
4. Copia \`/app/dist\` **desde la etapa build** a \`/usr/share/nginx/html\`.
5. Documenta el puerto \`80\`.
6. Arranca con \`CMD ["nginx", "-g", "daemon off;"]\`.`,
  fileName: 'Dockerfile',
  starterCode: `# Etapa 1: construir la aplicación
FROM node:22-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: servir el resultado con nginx
# (te falta todo esto)
`,
  solution: `# ---- Etapa 1: construir ----
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Etapa 2: servir ----
# Solo llega aquí lo que se copie explícitamente: ni node_modules ni el código fuente.
FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
`,
  hints: [
    'Ponle nombre a la primera etapa añadiendo AS build al final del FROM.',
    'La segunda etapa empieza con otro FROM: a partir de ahí, lo anterior se descarta.',
    'COPY --from=build /app/dist /usr/share/nginx/html trae la carpeta construida.',
    'El comando de nginx lleva punto y coma dentro de las comillas: "daemon off;".',
  ],
  tests: [
    {
      name: 'Tiene exactamente dos etapas',
      code: 'Dos instrucciones FROM',
      check: hasStages(2, 'Se esperan dos etapas: una para construir y otra para servir.'),
    },
    {
      name: 'La primera etapa se llama build',
      code: 'FROM node:22-alpine AS build',
      check: check((doc) => {
        const first = doc.stages[0]
        if (!first) return 'Falta el primer FROM.'
        if (!/^node:22-alpine\b/.test(first.image)) return 'La primera etapa parte de node:22-alpine.'
        return first.name === 'build' ? null : 'Ponle nombre a la etapa con AS build.'
      }),
    },
    {
      name: 'La imagen final es nginx',
      code: 'FROM nginx:1.27-alpine',
      check: check((doc) => {
        const last = doc.stages[doc.stages.length - 1]
        return last && /^nginx:/.test(last.image)
          ? null
          : 'La última etapa tiene que partir de nginx:1.27-alpine.'
      }),
    },
    {
      name: 'Copia el resultado desde la etapa build',
      code: 'COPY --from=build /app/dist /usr/share/nginx/html',
      check: copiesFromStage(
        'build',
        'Falta COPY --from=build /app/dist /usr/share/nginx/html en la segunda etapa.',
      ),
    },
    {
      name: 'La copia va a la carpeta que sirve nginx',
      code: '/usr/share/nginx/html',
      check: check((doc) =>
        instructionsOf(doc, 'COPY').some((item) => /\/usr\/share\/nginx\/html/.test(item.args))
          ? null
          : 'nginx sirve /usr/share/nginx/html: ahí es donde tienen que acabar los ficheros.',
      ),
    },
    {
      name: 'Documenta el puerto 80',
      code: 'EXPOSE 80',
      check: requires('EXPOSE', /\b80\b/, 'Falta EXPOSE 80.'),
    },
    {
      name: 'Arranca nginx en primer plano',
      code: 'CMD ["nginx", "-g", "daemon off;"]',
      check: requires(
        'CMD',
        /"nginx"[\s\S]*daemon off;/,
        'Falta CMD ["nginx", "-g", "daemon off;"]. Sin daemon off, nginx se va al fondo y el contenedor se para.',
      ),
    },
    {
      name: 'El build sigue ocurriendo en la primera etapa',
      code: 'RUN npm run build',
      check: check((doc) => {
        const build = instructionsOf(doc, 'RUN').find((item) => /npm\s+run\s+build/.test(item.args))
        if (!build) return 'Falta RUN npm run build.'
        return build.stage === 0 ? null : 'RUN npm run build va en la primera etapa, la que tiene Node.'
      }),
    },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "De un Dockerfile con dos etapas, ¿qué acaba en la imagen final?",
      options: ["Todo lo de las dos etapas", "Solo la última etapa, más lo que copies con --from", "Solo la primera etapa"],
      correct: 1,
      explanation: "Cada FROM descarta lo anterior. Esa es justo la gracia: el compilador se queda fuera.",
    },
    {
      kind: "drag",
      prompt: "Ponle nombre a la etapa y copia desde ella.",
      snippet: "FROM node:22-alpine ___ build\nFROM nginx:1.27-alpine\nCOPY ___=build /app/dist /usr/share/nginx/html",
      blanks: ["AS", "--from"],
      pool: ["AS", "--from", "FROM", "COPY"],
      explanation: "AS bautiza la etapa y --from le dice a COPY que traiga los ficheros de ahí en vez de de tu equipo.",
    },
    {
      kind: "choice",
      prompt: "¿Para qué sirve el fichero .dockerignore?",
      options: ["Para que Docker se salte instrucciones del Dockerfile", "Para no enviar al build cosas como node_modules o .env", "Para ocultar capas de la imagen"],
      correct: 1,
      explanation: "Ahorra cientos de megas por build y evita que un COPY . . se lleve dentro tus credenciales.",
    },
    {
      kind: "order",
      prompt: "Ordena la etapa que sirve la aplicación.",
      lines: ["FROM nginx:1.27-alpine", "COPY --from=build /app/dist /usr/share/nginx/html", "EXPOSE 80", "CMD [\"nginx\", \"-g\", \"daemon off;\"]"],
      explanation: "Nueva base, se traen los ficheros construidos, se documenta el puerto y se arranca.",
    },
    {
      kind: "fill",
      prompt: "Deja de ejecutar como root justo antes del arranque.",
      snippet: "___ node\nCMD [\"node\", \"server.js\"]",
      answers: ["USER"],
      explanation: "USER va después de instalar y copiar, que necesitan permisos, y antes de CMD.",
    },
  ],
}
