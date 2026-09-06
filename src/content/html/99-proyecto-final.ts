import type { Exercise } from '@/types/exercise'
import { checkHtml, countElements, everyElement, isInside } from '@/engine/html/checks'

export const exercise: Exercise = {
  id: 'html-99-proyecto-final',
  language: 'html',
  title: 'Una página completa y accesible',
  kind: 'project',
  difficulty: 3,
  concepts: ['estructura', 'semántica', 'imágenes', 'formularios', 'accesibilidad'],
  theory: `## Qué vas a construir

La página de inicio de la clínica, entera y de una pieza: esqueleto, cabecera con
navegación, contenido principal con una figura, un formulario de contacto y pie.

Nada nuevo. Lo que se practica aquí es **juntarlo bien**, que es donde se ve si has
entendido para qué sirve cada etiqueta.

## El orden en que conviene montarlo

1. El esqueleto: \`DOCTYPE\`, \`html lang\`, \`head\` con \`charset\` y \`title\`, \`body\`.
2. Los tres bloques grandes: \`header\`, \`main\` y \`footer\`, vacíos de momento.
3. Rellena la cabecera: \`h1\` y \`nav\`.
4. Rellena el contenido: \`article\`, con su \`h2\`, su párrafo, su lista y su figura.
5. El formulario, con su \`label\` asociado.

Ejecuta a cada paso. Los tests que ya pasan te confirman que vas bien, y la vista previa te
enseña cómo va quedando.

## La lista de la accesibilidad

Cinco cosas que no cuestan nada y cambian mucho:

- \`lang\` en el \`html\`.
- Un solo \`h1\`, y los \`h2\` colgando de él sin saltarse niveles.
- \`alt\` en todas las imágenes: descriptivo si aporta, vacío si es decorativa.
- Un \`label\` asociado a cada campo del formulario.
- Texto de enlace que diga a dónde lleva.

Ninguna se ve en la pantalla. Todas cambian la experiencia de quien no navega como tú.

## Lo que no toca aquí

El aspecto. Va a salir en blanco y negro, con la letra por defecto y todo apilado. Es lo
normal: el HTML dice **qué es** cada cosa y el CSS dice **cómo se ve**. Eso es la pista
siguiente.`,
  brief: `Escribe la página completa. Tiene que llevar:

**Esqueleto**

- \`DOCTYPE\`, \`html\` en español, y \`head\` con UTF-8 y el título \`Clínica Vitsync\`.

**Cabecera**

- \`header\` con un \`h1\` que diga \`Clínica Vitsync\`.
- Dentro del header, un \`nav\` con dos enlaces: \`Citas\` a \`/citas\` y \`Contacto\` a \`/contacto\`.

**Contenido**

- Un \`main\` con un \`article\` dentro.
- En el article: un \`h2\`, un párrafo y una lista sin orden con tres elementos.
- Una \`figure\` con una imagen \`consulta.jpg\` (con \`alt\` descriptivo) y su \`figcaption\`.

**Formulario**

- Un \`form\` con un campo de correo (\`label\` asociado, \`type="email"\`, \`name\` y \`required\`)
  y un \`button\` de tipo \`submit\`.

**Pie**

- Un \`footer\` con un párrafo.`,
  fileName: 'index.html',
  starterCode: `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Clínica Vitsync</title>
  </head>
  <body>
    <!-- header, main y footer -->
  </body>
</html>
`,
  solution: `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Clínica Vitsync</title>
  </head>
  <body>
    <header>
      <h1>Clínica Vitsync</h1>
      <nav>
        <a href="/citas">Citas</a>
        <a href="/contacto">Contacto</a>
      </nav>
    </header>

    <main>
      <article>
        <h2>Cómo pedir cita</h2>
        <p>Puedes reservar por teléfono, en recepción o desde esta misma web.</p>

        <ul>
          <li>Consulta general</li>
          <li>Revisión anual</li>
          <li>Urgencias</li>
        </ul>

        <figure>
          <img src="consulta.jpg" alt="Sala de espera con seis butacas junto a la ventana" />
          <figcaption>La sala de espera tras la reforma</figcaption>
        </figure>
      </article>

      <form action="/contacto" method="post">
        <label for="correo">Correo</label>
        <input type="email" id="correo" name="correo" required />
        <button type="submit">Enviar</button>
      </form>
    </main>

    <footer>
      <p>2026 Clínica Vitsync</p>
    </footer>
  </body>
</html>
`,
  hints: [
    'Monta primero header, main y footer vacíos, y ve rellenándolos.',
    'El nav va dentro del header; el article, dentro del main.',
    'El for del label y el id del input tienen que coincidir exactamente.',
    'La imagen necesita un alt que describa lo que se ve, no el nombre del fichero.',
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "La página se ve en blanco y negro y todo apilado. ¿Está mal?",
      options: ["Sí, falta algo en el HTML", "No: el HTML dice qué es cada cosa, y el aspecto es cosa del CSS", "Sí, falta el DOCTYPE"],
      correct: 1,
      explanation: "Separar estructura y presentación es lo que permite cambiar el diseño sin tocar el contenido.",
    },
    {
      kind: "drag",
      prompt: "Coloca cada bloque en su sitio.",
      snippet: "<body>\n  <___>...</header>\n  <___>...</main>\n  <___>...</footer>\n</body>",
      blanks: ["header", "main", "footer"],
      pool: ["header", "main", "footer", "nav"],
      explanation: "Los tres bloques grandes cuelgan directamente del body, uno detrás de otro.",
    },
    {
      kind: "choice",
      prompt: "De la lista de accesibilidad, ¿cuál se nota mirando la pantalla?",
      options: ["El lang del html", "El alt de las imágenes", "Ninguna: no se ven, pero cambian la experiencia de quien no navega como tú"],
      correct: 2,
      explanation: "Por eso se olvidan tanto: nadie las echa de menos mirando la página.",
    },
    {
      kind: "fill",
      prompt: "Declara el idioma de la página.",
      snippet: "<html ___=\"es\">",
      answers: ["lang"],
      explanation: "Hace que el lector de pantalla pronuncie en español y que el navegador ofrezca traducir.",
    },
    {
      kind: "order",
      prompt: "Ordena el montaje que menos dolores de cabeza da.",
      lines: ["Escribir el esqueleto: DOCTYPE, html, head y body", "Crear header, main y footer vacíos", "Rellenar la cabecera con el h1 y el nav", "Rellenar el article y el formulario"],
      explanation: "De fuera hacia dentro: primero el contenedor y luego el contenido, ejecutando a cada paso.",
    },
  ],
  tests: [
    {
      name: 'El esqueleto esta completo y en espanol',
      code: 'DOCTYPE, html lang="es", meta charset y title',
      check: checkHtml((doc) => {
        if (!doc.doctype) return 'Falta el <!DOCTYPE html>.'
        if (doc.documentElement.getAttribute('lang') !== 'es') return 'Falta lang="es" en el html.'
        if (!doc.querySelector('head meta[charset]')) return 'Falta el meta charset en el head.'
        return (doc.querySelector('title')?.textContent ?? '').trim() === 'Clínica Vitsync'
          ? null
          : 'El title tiene que decir "Clínica Vitsync".'
      }),
    },
    {
      name: 'La cabecera lleva el h1 y el menu',
      code: 'header > h1 y header nav con dos enlaces',
      check: checkHtml((doc) => {
        if (!doc.querySelector('header h1')) return 'Falta el h1 dentro del header.'
        const enlaces = doc.querySelectorAll('header nav a')
        return enlaces.length === 2
          ? null
          : `El nav del header debe tener dos enlaces (hay ${enlaces.length}).`
      }),
    },
    {
      name: 'Hay un unico h1 en toda la pagina',
      code: 'un solo <h1>',
      check: countElements('h1', 1, 'Solo puede haber un h1 por pagina.'),
    },
    {
      name: 'El contenido va en un article dentro del main',
      code: 'main > article con h2, p y ul de tres elementos',
      check: checkHtml((doc) => {
        if (!doc.querySelector('main article')) return 'Falta el article dentro del main.'
        if (!doc.querySelector('main article h2')) return 'Al article le falta su h2.'
        if (!doc.querySelector('main article p')) return 'Al article le falta un parrafo.'
        const items = doc.querySelectorAll('main article ul > li')
        return items.length === 3
          ? null
          : `La lista tiene que tener tres elementos (hay ${items.length}).`
      }),
    },
    {
      name: 'La figura tiene imagen con alt descriptivo y su pie',
      code: 'figure > img[alt] + figcaption',
      check: checkHtml((doc) => {
        const image = doc.querySelector('figure img')
        if (!image) return 'Falta la imagen dentro de un figure.'
        const alt = (image.getAttribute('alt') ?? '').trim()
        if (alt.split(/\s+/).filter(Boolean).length < 3) {
          return 'El alt de la foto tiene que describir lo que se ve.'
        }
        return doc.querySelector('figure figcaption')
          ? null
          : 'Falta el figcaption dentro del figure.'
      }),
    },
    {
      name: 'El formulario es usable: label asociado, tipo y required',
      code: 'label[for] + input[type=email][name][required] + button[type=submit]',
      check: checkHtml((doc) => {
        const input = doc.querySelector('form input[type="email"]')
        if (!input) return 'Falta el campo de correo con type="email".'
        const id = input.getAttribute('id')
        if (!id || !doc.querySelector(`label[for="${id}"]`)) {
          return 'El campo necesita un label asociado por for/id.'
        }
        if (!input.hasAttribute('name') || !input.hasAttribute('required')) {
          return 'Al campo le falta el name o el required.'
        }
        return doc.querySelector('form button[type="submit"]')
          ? null
          : 'Falta el boton de envio con type="submit".'
      }),
    },
    {
      name: 'Hay un pie de pagina',
      code: 'footer con un parrafo',
      check: isInside('p', 'footer', 'Falta el footer con un parrafo dentro.'),
    },
    {
      name: 'Todas las imagenes tienen alt',
      code: 'ninguna img sin alt',
      check: everyElement(
        'img',
        (element) => element.hasAttribute('alt'),
        'Alguna imagen se ha quedado sin alt.',
      ),
    },
    {
      name: 'La estructura usa etiquetas semanticas',
      code: 'header, main y footer',
      check: checkHtml((doc) => {
        for (const tag of ['header', 'main', 'footer']) {
          if (!doc.querySelector(tag)) return `Falta el elemento ${tag}.`
        }
        return null
      }),
    },
  ],
}
