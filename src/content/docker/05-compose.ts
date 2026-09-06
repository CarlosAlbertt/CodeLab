import type { Exercise } from '@/types/exercise'
import { matchesText } from '@/engine/docker/checks'

export const exercise: Exercise = {
  id: 'docker-05-compose',
  language: 'docker',
  title: 'docker compose: varios servicios a la vez',
  difficulty: 2,
  concepts: ['compose', 'servicios', 'volúmenes', 'redes', 'depends_on'],
  theory: `## Para qué sirve

Una aplicación de verdad no es un contenedor: son varios. La API, la base de datos, quizá
un Redis. Levantarlos a mano con \`docker run\` y acordarse de cada puerto, cada volumen y
cada variable es inviable.

\`docker compose\` describe todo eso en un fichero YAML, y lo levanta entero con un
comando.

## El fichero

~~~yaml
services:
  api:
    build: .
    ports:
      - '8080:3000'
    environment:
      DATABASE_URL: postgres://app:secreto@db:5432/app
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: secreto
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
~~~

Cada entrada de \`services\` es un contenedor. \`build: .\` construye desde tu Dockerfile;
\`image:\` usa una imagen ya hecha.

## Se llaman por su nombre

Esta es la parte que sorprende. Compose crea una red privada y **cada servicio es
alcanzable por su nombre**. Por eso la URL de la base de datos dice \`@db:5432\`: \`db\` es
el nombre del servicio, no un dominio ni una IP.

Y ojo: dentro de esa red se usa el puerto **interno** (5432), no el que hayas publicado
hacia fuera. Los \`ports\` solo hacen falta para llegar desde tu equipo.

## Volúmenes: lo que sobrevive

Un contenedor es desechable: si lo borras, se va con él todo lo que escribió. Para los
datos que tienen que quedarse existen los volúmenes.

- **Volumen con nombre** (\`db-data:/var/lib/...\`) — lo gestiona Docker. Es lo que quieres
  para una base de datos.
- **Bind mount** (\`./src:/app/src\`) — monta una carpeta de tu equipo dentro del
  contenedor. Es lo que quieres en desarrollo, para que los cambios se vean al instante.

En los dos casos se lee igual: **origen a la izquierda, destino dentro del contenedor a la
derecha**.

## depends_on no espera a que esté listo

\`depends_on\` controla el **orden de arranque**, no la disponibilidad. Postgres puede
tardar unos segundos en aceptar conexiones después de que el contenedor exista, y tu API ya
estará intentando conectarse.

Se arregla con un \`healthcheck\` y \`condition: service_healthy\`, o —más sencillo— con
reintentos en la aplicación. Que la API sepa reintentar es buena idea de todas formas.

## Los comandos

~~~bash
docker compose up --build     # construye y levanta todo
docker compose up -d          # en segundo plano
docker compose logs -f api    # seguir los logs de un servicio
docker compose down           # parar y borrar los contenedores
docker compose down -v        # ... y también los volúmenes (borra los datos)
~~~

## Errores típicos

- Usar \`localhost\` para hablar entre servicios. Dentro de la red, \`localhost\` es el
  propio contenedor: hay que usar el nombre del servicio.
- Poner el puerto publicado en vez del interno en la URL de conexión.
- Invertir el orden del volumen y montar el contenedor sobre tu carpeta.
- Ejecutar \`down -v\` en un descuido y llevarte por delante la base de datos.`,
  brief: `Escribe el \`docker-compose.yml\` de una API con su base de datos.

Servicio \`api\`:

- Se construye desde el Dockerfile de la carpeta actual (\`build: .\`).
- Publica el \`8080\` de tu equipo hacia el \`3000\` del contenedor.
- Recibe \`DATABASE_URL\` apuntando a \`postgres://app:secreto@db:5432/app\`.
- Arranca después de \`db\`.

Servicio \`db\`:

- Usa la imagen \`postgres:16-alpine\`.
- Recibe \`POSTGRES_PASSWORD\` con valor \`secreto\`.
- Guarda los datos en un volumen con nombre \`db-data\` montado en
  \`/var/lib/postgresql/data\`.

Y declara \`db-data\` en la sección \`volumes\` de arriba del todo.`,
  fileName: 'docker-compose.yml',
  starterCode: `services:
  api:
    # build, ports, environment y depends_on

  db:
    # image, environment y volumes

# Acuérdate de declarar el volumen con nombre
`,
  solution: `services:
  api:
    build: .
    ports:
      - '8080:3000'
    environment:
      DATABASE_URL: postgres://app:secreto@db:5432/app
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: secreto
    volumes:
      # Volumen con nombre: los datos sobreviven a borrar el contenedor.
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
`,
  hints: [
    'La indentación en YAML es con espacios, nunca con tabulador, y marca la jerarquía.',
    'Las listas van con guion: los puertos y los volúmenes son listas.',
    'En DATABASE_URL el host es db, el nombre del servicio, y el puerto es el interno: 5432.',
    'El volumen con nombre hay que declararlo dos veces: en el servicio que lo monta y en la sección volumes de nivel superior.',
  ],
  tests: [
    {
      name: 'Declara los dos servicios',
      code: 'services: api y db',
      check: matchesText(
        /services:[\s\S]*\bapi:[\s\S]*\bdb:/,
        'Faltan los servicios api y db dentro de services.',
      ),
    },
    {
      name: 'La api se construye desde el Dockerfile local',
      code: 'build: .',
      check: matchesText(/build:\s*\.\s*$/m, 'Falta build: . en el servicio api.'),
    },
    {
      name: 'Publica el 8080 hacia el 3000',
      code: "- '8080:3000'",
      check: matchesText(
        /-\s*['"]?8080:3000['"]?/,
        'Falta el mapeo de puertos 8080:3000 en la lista ports.',
      ),
    },
    {
      name: 'La API apunta al servicio db, no a localhost',
      code: 'DATABASE_URL: postgres://app:secreto@db:5432/app',
      check: matchesText(
        /DATABASE_URL:\s*postgres:\/\/app:secreto@db:5432\/app/,
        'DATABASE_URL tiene que apuntar a @db:5432, el nombre del servicio y su puerto interno.',
      ),
    },
    {
      name: 'La api arranca después de la base de datos',
      code: 'depends_on: [db]',
      check: matchesText(/depends_on:[\s\S]{0,40}?\bdb\b/, 'Falta depends_on con db en el servicio api.'),
    },
    {
      name: 'La base de datos usa postgres:16-alpine',
      code: 'image: postgres:16-alpine',
      check: matchesText(/image:\s*postgres:16-alpine/, 'Falta image: postgres:16-alpine en el servicio db.'),
    },
    {
      name: 'Monta el volumen con nombre en la ruta de datos',
      code: '- db-data:/var/lib/postgresql/data',
      check: matchesText(
        /-\s*db-data:\/var\/lib\/postgresql\/data/,
        'Falta montar db-data en /var/lib/postgresql/data.',
      ),
    },
    {
      name: 'Declara el volumen db-data arriba del todo',
      code: 'volumes:\n  db-data:',
      check: matchesText(
        /^volumes:\s*\n\s+db-data:/m,
        'Un volumen con nombre hay que declararlo también en la sección volumes de nivel superior.',
      ),
    },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "Desde el contenedor de la API, ¿cómo se llega a la base de datos?",
      options: ["localhost:5432", "db:5432, el nombre del servicio y su puerto interno", "127.0.0.1:8080"],
      correct: 1,
      explanation: "Compose crea una red donde cada servicio responde por su nombre. localhost sería el propio contenedor de la API.",
    },
    {
      kind: "fill",
      prompt: "Declara que la api arranca después de la base de datos.",
      snippet: "    ___:\n      - db",
      answers: ["depends_on"],
      explanation: "Controla el orden de arranque, pero no espera a que la base de datos acepte conexiones.",
    },
    {
      kind: "drag",
      prompt: "Monta el volumen con nombre en la carpeta de datos de Postgres.",
      snippet: "    volumes:\n      - ___:___",
      blanks: ["db-data", "/var/lib/postgresql/data"],
      pool: ["db-data", "/var/lib/postgresql/data", "./src"],
      explanation: "Origen a la izquierda, destino dentro del contenedor a la derecha. Un volumen con nombre es lo que quieres para datos.",
    },
    {
      kind: "choice",
      prompt: "¿Qué hace docker compose down -v?",
      options: ["Para los contenedores y ya está", "Para los contenedores y borra los volúmenes: se van los datos", "Reinicia los servicios uno a uno"],
      correct: 1,
      explanation: "Es el comando con el que más gente ha perdido su base de datos de desarrollo.",
    },
    {
      kind: "order",
      prompt: "Ordena el servicio de la API.",
      lines: ["  api:", "    build: .", "    ports:", "      - '8080:3000'"],
      explanation: "En YAML la indentación es la jerarquía: los puertos cuelgan del servicio, y la lista va con guion.",
    },
  ],
}
