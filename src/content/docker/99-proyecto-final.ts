import type { Exercise } from '@/types/exercise'
import { check, copiesFromStage, requires } from '@/engine/docker/checks'
import { instructionsOf } from '@/engine/docker/dockerfile'

export const exercise: Exercise = {
  id: 'docker-99-proyecto-final',
  language: 'docker',
  title: 'Contenerizar esta misma aplicación',
  kind: 'project',
  difficulty: 3,
  concepts: ['multi-stage', 'caché', 'nginx', 'HEALTHCHECK', 'buenas prácticas'],
  theory: `## Qué vas a construir

El Dockerfile de CodeLab, la aplicación que estás usando ahora mismo. No es un ejercicio
inventado: es el fichero que hay en la raíz del repositorio, así que al terminar puedes
abrirlo y comparar.

## Lo que hay que tener en cuenta

CodeLab es una aplicación de frontend con Vite:

- Para **construirla** hacen falta Node y todas las dependencias de desarrollo.
- Para **servirla** solo hacen falta los ficheros que salen en \`dist\` y un servidor web.

Justo el caso de un multi-stage: Node aparece en la primera etapa y desaparece de la imagen
final.

## Las piezas que ya conoces

- Orden pensado para la **caché**: manifiestos, \`npm ci\`, y el código después.
- Dos etapas, la primera con nombre, y \`COPY --from\` para rescatar el resultado.
- \`EXPOSE\` para documentar el puerto y \`CMD\` en forma de lista.

## Lo nuevo: HEALTHCHECK

Un contenedor puede estar arrancado y no responder: el proceso vive, pero la aplicación
está colgada. \`HEALTHCHECK\` le dice a Docker cómo comprobarlo de verdad. El comando tiene
que salir con \`0\` si todo va bien y con otra cosa si no:

~~~dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --spider -q http://localhost/ || exit 1
~~~

Compose y los orquestadores usan ese estado para reiniciar el contenedor, o para no
mandarle tráfico todavía.

## La configuración de nginx

Una aplicación con router necesita que **cualquier ruta desconocida devuelva
\`index.html\`**. Si no, al recargar en \`/pista/typescript\` nginx busca una carpeta que
no existe y devuelve un 404. Esa regla vive en \`nginx.conf\`, que hay que copiar dentro de
la imagen.

## Cómo se prueba de verdad

Con el repositorio delante:

~~~bash
docker compose up --build
~~~

y la aplicación queda en http://localhost:8080.`,
  brief: `Escribe el Dockerfile completo de CodeLab.

**Etapa \`build\`**, a partir de \`node:22-alpine\`:

1. \`WORKDIR /app\`.
2. Copia \`package.json\` y \`package-lock.json\`, y ejecuta \`npm ci\`.
3. Copia el resto del proyecto y ejecuta \`npm run build\`.

**Etapa final**, a partir de \`nginx:1.27-alpine\`:

4. Copia \`nginx.conf\` a \`/etc/nginx/conf.d/default.conf\`.
5. Copia \`/app/dist\` desde la etapa \`build\` a \`/usr/share/nginx/html\`.
6. \`EXPOSE 80\`.
7. Añade un \`HEALTHCHECK\` que pida \`http://localhost/\`.
8. Arranca con \`CMD ["nginx", "-g", "daemon off;"]\`.`,
  fileName: 'Dockerfile',
  starterCode: `# syntax=docker/dockerfile:1

# ---------- Etapa 1: construir la aplicación ----------


# ---------- Etapa 2: servir los ficheros ya construidos ----------

`,
  solution: `# syntax=docker/dockerfile:1

# ---------- Etapa 1: construir la aplicación ----------
FROM node:22-alpine AS build

WORKDIR /app

# Solo el manifiesto primero: mientras no cambie, npm ci sale de la caché.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Etapa 2: servir los ficheros ya construidos ----------
# La imagen final no lleva ni node_modules ni el código fuente.
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget --spider -q http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
`,
  hints: [
    'Empieza copiando la estructura de la unidad de multi-stage: es el mismo esqueleto.',
    'nginx.conf se copia desde tu equipo (sin --from) a /etc/nginx/conf.d/default.conf.',
    'El HEALTHCHECK necesita un comando que devuelva 0 si va bien: wget --spider -q ... || exit 1.',
    'Si una instrucción se te hace larga, puedes partirla poniendo una barra al final de la línea.',
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "¿Por qué la imagen final de CodeLab no lleva Node?",
      options: ["Porque nginx ya incluye Node", "Porque Node solo hace falta para construir, y esa etapa se descarta", "Porque Node no funciona sobre alpine"],
      correct: 1,
      explanation: "La imagen final es nginx más la carpeta dist: unos pocos megas en vez de más de un giga.",
    },
    {
      kind: "drag",
      prompt: "Copia la configuración de nginx a su sitio.",
      snippet: "COPY nginx.conf ___",
      blanks: ["/etc/nginx/conf.d/default.conf"],
      pool: ["/etc/nginx/conf.d/default.conf", "/usr/share/nginx/html"],
      explanation: "La configuración va a conf.d; /usr/share/nginx/html es donde van los ficheros que se sirven.",
    },
    {
      kind: "choice",
      prompt: "¿Qué pasa si falta la regla try_files de nginx.conf?",
      options: ["La aplicación no llega a arrancar", "Al recargar en una ruta como /pista/typescript sale un 404", "Los ficheros se sirven sin comprimir"],
      correct: 1,
      explanation: "El router vive en el navegador; nginx tiene que devolver index.html para cualquier ruta que no sea un fichero.",
    },
    {
      kind: "fill",
      prompt: "Haz que el healthcheck termine con un código distinto de cero cuando falle.",
      snippet: "CMD wget --spider -q http://localhost/ ___ exit 1",
      answers: ["||"],
      explanation: "Docker mira el código de salida: 0 es sano y cualquier otro es enfermo.",
    },
    {
      kind: "order",
      prompt: "Ordena el final de la imagen.",
      lines: ["COPY --from=build /app/dist /usr/share/nginx/html", "EXPOSE 80", "HEALTHCHECK CMD wget --spider -q http://localhost/ || exit 1", "CMD [\"nginx\", \"-g\", \"daemon off;\"]"],
      explanation: "Primero los ficheros, luego la documentación del puerto y la comprobación de salud, y el arranque al final.",
    },
  ],
  tests: [
    {
      name: 'Tiene dos etapas y la primera se llama build',
      code: 'FROM node:22-alpine AS build  +  FROM nginx:1.27-alpine',
      check: check((doc) => {
        if (doc.stages.length !== 2) return 'Se esperan exactamente dos etapas.'
        const [first, last] = doc.stages
        if (!/^node:22-alpine\b/.test(first!.image)) return 'La primera etapa parte de node:22-alpine.'
        if (first!.name !== 'build') return 'Ponle nombre a la primera etapa con AS build.'
        return /^nginx:1\.27-alpine\b/.test(last!.image)
          ? null
          : 'La segunda etapa parte de nginx:1.27-alpine.'
      }),
    },
    {
      name: 'Respeta el orden de cache: manifiestos, npm ci y luego el codigo',
      code: 'COPY package*.json  ->  RUN npm ci  ->  COPY . .',
      check: check((doc) => {
        const manifest = instructionsOf(doc, 'COPY').find((item) => /package/.test(item.args))
        const install = instructionsOf(doc, 'RUN').find((item) => /npm\s+ci/.test(item.args))
        const rest = instructionsOf(doc, 'COPY').find((item) => /^\.\s+\.?$/.test(item.args.trim()))
        if (!manifest) return 'Falta el COPY de package.json y package-lock.json.'
        if (!install) return 'Falta RUN npm ci.'
        if (!rest) return 'Falta COPY . . para el resto del proyecto.'
        return manifest.line < install.line && install.line < rest.line
          ? null
          : 'El orden tiene que ser: manifiestos, npm ci y despues el codigo.'
      }),
    },
    {
      name: 'Construye la aplicacion en la etapa de Node',
      code: 'RUN npm run build',
      check: check((doc) => {
        const build = instructionsOf(doc, 'RUN').find((item) => /npm\s+run\s+build/.test(item.args))
        if (!build) return 'Falta RUN npm run build.'
        return build.stage === 0 ? null : 'El build va en la primera etapa, que es la que tiene Node.'
      }),
    },
    {
      name: 'Copia la configuracion de nginx',
      code: 'COPY nginx.conf /etc/nginx/conf.d/default.conf',
      check: check((doc) =>
        instructionsOf(doc, 'COPY').some(
          (item) =>
            /nginx\.conf/.test(item.args) && /\/etc\/nginx\/conf\.d\/default\.conf/.test(item.args),
        )
          ? null
          : 'Falta copiar nginx.conf a /etc/nginx/conf.d/default.conf; sin eso, recargar una ruta da 404.',
      ),
    },
    {
      name: 'Rescata dist de la etapa build',
      code: 'COPY --from=build /app/dist /usr/share/nginx/html',
      check: copiesFromStage('build', 'Falta COPY --from=build /app/dist /usr/share/nginx/html.'),
    },
    {
      name: 'Documenta el puerto 80',
      code: 'EXPOSE 80',
      check: requires('EXPOSE', /\b80\b/, 'Falta EXPOSE 80.'),
    },
    {
      name: 'Comprueba que la aplicacion responde de verdad',
      code: 'HEALTHCHECK ... CMD wget --spider -q http://localhost/ || exit 1',
      check: check((doc) => {
        const healthcheck = instructionsOf(doc, 'HEALTHCHECK')[0]
        if (!healthcheck) return 'Falta HEALTHCHECK: un proceso vivo no significa una aplicacion sana.'
        if (!/localhost/.test(healthcheck.args)) {
          return 'El HEALTHCHECK tiene que pedir http://localhost/ desde dentro del contenedor.'
        }
        return /exit\s+1/.test(healthcheck.args)
          ? null
          : 'El comando debe salir con un codigo distinto de 0 si falla: termina con || exit 1.'
      }),
    },
    {
      name: 'Arranca nginx en primer plano',
      code: 'CMD ["nginx", "-g", "daemon off;"]',
      check: requires('CMD', /"nginx"[\s\S]*daemon off;/, 'Falta CMD ["nginx", "-g", "daemon off;"].'),
    },
  ],
}
