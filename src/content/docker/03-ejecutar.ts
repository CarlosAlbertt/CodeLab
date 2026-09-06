import type { Exercise } from '@/types/exercise'
import { check, requires } from '@/engine/docker/checks'
import { instructionsOf } from '@/engine/docker/dockerfile'

export const exercise: Exercise = {
  id: 'docker-03-ejecutar',
  language: 'docker',
  title: 'Arrancar: CMD, ENTRYPOINT, ENV y EXPOSE',
  difficulty: 2,
  concepts: ['CMD', 'ENTRYPOINT', 'ENV', 'EXPOSE', 'forma exec'],
  theory: `## Construir y arrancar son dos momentos

Es la confusión número uno. \`RUN\` se ejecuta **mientras se construye la imagen**, y lo
que hace queda grabado en una capa. \`CMD\` no se ejecuta al construir: solo deja apuntado
lo que habrá que lanzar **cuando alguien arranque un contenedor**.

## Forma de lista y forma de texto

Las dos funcionan, pero no son equivalentes:

~~~dockerfile
CMD ["node", "server.js"]        # forma de lista (exec): la buena
CMD node server.js               # forma de texto (shell)
~~~

Con la forma de texto, Docker arranca una shell y esta lanza tu programa como hijo. El
proceso principal del contenedor pasa a ser la shell, y cuando Docker pide parar, la señal
se la queda ella: tu programa no se entera y acaba muriendo a la fuerza a los diez
segundos, sin cerrar nada bien.

Con la forma de lista, tu programa es el proceso principal y recibe la señal directamente.
**Usa siempre corchetes.**

## CMD y ENTRYPOINT

- \`CMD\` da el comando **por defecto**, y quien arranca el contenedor puede sustituirlo:
  \`docker run mi-app node otro.js\`.
- \`ENTRYPOINT\` fija el ejecutable, y lo que se pasa en \`docker run\` se le añade como
  argumentos en vez de reemplazarlo.

Juntos son el patrón habitual de una herramienta de línea de comandos:

~~~dockerfile
ENTRYPOINT ["node", "cli.js"]
CMD ["--help"]
~~~

Así \`docker run mi-cli\` muestra la ayuda, y \`docker run mi-cli --version\` ejecuta
\`node cli.js --version\`. Si solo vas a arrancar un servidor, con \`CMD\` te sobra.

## Variables de entorno: ENV y ARG

~~~dockerfile
ARG VERSION=1.0          # solo existe durante el build
ENV NODE_ENV=production  # queda en la imagen y la ve la aplicación al ejecutarse
~~~

\`ENV\` es la forma correcta de configurar la aplicación: el mismo código, distinta
configuración según el entorno. Y se puede cambiar al arrancar sin reconstruir nada:
\`docker run -e NODE_ENV=development mi-app\`.

Ni \`ARG\` ni \`ENV\` valen para secretos: quedan escritos en las capas de la imagen y
cualquiera que la tenga puede leerlos con \`docker history\`.

## EXPOSE no abre nada

\`EXPOSE 3000\` es **documentación**. Dice "este contenedor escucha en el 3000", y no hace
nada más. Lo que de verdad publica el puerto es la opción de arranque:

~~~bash
docker run -p 8080:3000 mi-app
~~~

Se lee de fuera hacia dentro: el puerto **8080 de tu equipo** lleva al **3000 del
contenedor**. Escribir \`EXPOSE\` igualmente merece la pena: es lo primero que mira quien
va a usar tu imagen.

## Errores típicos

- \`CMD\` en forma de texto, y contenedores que tardan diez segundos en parar.
- Creer que \`EXPOSE\` publica el puerto y no poner \`-p\` al arrancar.
- Escribir en el Dockerfile la contraseña de la base de datos con \`ENV\`.
- Poner dos \`CMD\`: solo vale el último, los anteriores se ignoran en silencio.`,
  brief: `Escribe el Dockerfile de un servidor web Node que se configure por entorno.

1. Base \`node:22-alpine\` y directorio de trabajo \`/app\`.
2. Copia primero los manifiestos e instala con \`npm ci\` (como en la unidad anterior),
   y luego el resto del código.
3. Declara dos variables de entorno: \`NODE_ENV\` con valor \`production\` y \`PORT\`
   con valor \`3000\`.
4. Documenta que el contenedor escucha en el \`3000\`.
5. Arranca con \`node server.js\` **en forma de lista**.`,
  fileName: 'Dockerfile',
  starterCode: `FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Faltan las variables de entorno, el puerto documentado y el arranque
`,
  solution: `FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

# Documenta el puerto; publicarlo es cosa de docker run -p
EXPOSE 3000

CMD ["node", "server.js"]
`,
  hints: [
    'ENV se escribe con un igual: ENV NODE_ENV=production.',
    'Puedes poner un ENV por línea, o varios pares en la misma instrucción.',
    'EXPOSE lleva solo el número del puerto, sin nada más.',
    'La forma de lista de CMD lleva corchetes y comillas dobles en cada palabra.',
  ],
  tests: [
    {
      name: 'Define NODE_ENV como production',
      code: 'ENV NODE_ENV=production',
      check: requires('ENV', /NODE_ENV[= ]production/, 'Falta ENV NODE_ENV=production.'),
    },
    {
      name: 'Define PORT como 3000',
      code: 'ENV PORT=3000',
      check: requires('ENV', /PORT[= ]3000/, 'Falta ENV PORT=3000.'),
    },
    {
      name: 'Documenta el puerto 3000',
      code: 'EXPOSE 3000',
      check: requires('EXPOSE', /\b3000\b/, 'Falta EXPOSE 3000.'),
    },
    {
      name: 'Arranca en forma de lista, no de texto',
      code: 'CMD ["node", "server.js"]',
      check: check((doc) => {
        const cmd = instructionsOf(doc, 'CMD')
        if (cmd.length === 0) return 'Falta CMD.'
        if (cmd.length > 1) return 'Hay más de un CMD: solo se aplica el último, quita los demás.'
        if (!cmd[0]!.args.startsWith('[')) {
          return 'Usa la forma de lista: CMD ["node", "server.js"]. Con la forma de texto, tu proceso no recibe las señales de parada.'
        }
        return /"node"\s*,\s*"server\.js"/.test(cmd[0]!.args)
          ? null
          : 'El comando tiene que ser ["node", "server.js"].'
      }),
    },
    {
      name: 'Sigue instalando las dependencias antes de copiar el código',
      code: 'COPY package*.json  ->  RUN npm ci  ->  COPY . .',
      check: check((doc) => {
        const manifest = instructionsOf(doc, 'COPY').find((item) => /package/.test(item.args))
        const install = instructionsOf(doc, 'RUN').find((item) => /npm\s+ci/.test(item.args))
        const rest = instructionsOf(doc, 'COPY').find((item) => /^\.\s+\.?$/.test(item.args.trim()))
        if (!manifest || !install || !rest) return 'Se han perdido los pasos de instalación de la unidad anterior.'
        return manifest.line < install.line && install.line < rest.line
          ? null
          : 'El orden tiene que seguir siendo: manifiestos, npm ci y luego el resto del código.'
      }),
    },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "¿Qué hace exactamente EXPOSE 3000?",
      options: ["Abre el puerto 3000 en tu equipo", "Documenta que el contenedor escucha ahí; publicarlo es cosa de -p", "Redirige el tráfico del 80 al 3000"],
      correct: 1,
      explanation: "EXPOSE es documentación. Sin -p al arrancar, desde fuera no se llega al contenedor.",
    },
    {
      kind: "drag",
      prompt: "Publica el 8080 de tu equipo hacia el 3000 del contenedor.",
      snippet: "docker run -p ___:___ mi-app",
      blanks: ["8080", "3000"],
      pool: ["8080", "3000"],
      explanation: "Se lee de fuera hacia dentro: primero el puerto de tu equipo, después el del contenedor.",
    },
    {
      kind: "choice",
      prompt: "¿Por qué conviene la forma de lista en CMD?",
      options: ["Porque arranca más rápido", "Porque tu proceso es el principal y recibe las señales de parada", "Porque la forma de texto no existe en Docker"],
      correct: 1,
      explanation: "Con la forma de texto manda una shell, se queda ella la señal y tu programa muere a la fuerza a los diez segundos.",
    },
    {
      kind: "fill",
      prompt: "Define una variable que la aplicación verá al ejecutarse.",
      snippet: "___ NODE_ENV=production",
      answers: ["ENV"],
      explanation: "ARG solo existe durante el build; ENV queda en la imagen y se puede cambiar al arrancar con -e.",
    },
    {
      kind: "order",
      prompt: "Ordena el final del Dockerfile.",
      lines: ["ENV NODE_ENV=production", "EXPOSE 3000", "CMD [\"node\", \"server.js\"]"],
      explanation: "La configuración y la documentación del puerto van antes del arranque, que siempre es lo último.",
    },
  ],
}
