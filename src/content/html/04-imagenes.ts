import type { Exercise } from '@/types/exercise'
import { checkHtml, everyElement, hasElement, hasText } from '@/engine/html/checks'

export const exercise: Exercise = {
  id: 'html-04-imagenes',
  language: 'html',
  title: 'Imágenes y el texto alternativo',
  difficulty: 1,
  concepts: ['img', 'alt', 'figure', 'figcaption', 'accesibilidad'],
  theory: `## La etiqueta

~~~html
<img src="consulta.jpg" alt="Sala de espera de la clínica" />
~~~

\`img\` no tiene contenido, así que se cierra sola. Dos atributos importan:

- \`src\` — dónde está el fichero.
- \`alt\` — qué se ve en la imagen, en palabras.

## El alt no es opcional

Es el atributo que más se olvida y el que más consecuencias tiene. El \`alt\` se usa:

- Cuando alguien navega con lector de pantalla y no ve la imagen.
- Cuando la imagen no carga, que pasa más de lo que parece.
- Cuando un buscador intenta entender de qué va la página.

Cómo se escribe: describe **lo que aporta la imagen**, no lo que es.

~~~html
<img src="grafico.png" alt="imagen" />                        <!-- inútil -->
<img src="grafico.png" alt="foto de un gráfico" />            <!-- redundante -->
<img src="grafico.png" alt="Las citas suben un 20% en marzo" /> <!-- útil -->
~~~

No empieces con "imagen de": el lector de pantalla ya anuncia que es una imagen.

## La excepción

Si la imagen es puramente decorativa y no aporta nada (una línea, un adorno), se pone el
\`alt\` **vacío**:

~~~html
<img src="adorno.svg" alt="" />
~~~

Así el lector de pantalla la salta. Ojo: \`alt=""\` es correcto; **no poner \`alt\`** no lo
es, porque entonces el lector lee el nombre del fichero.

## figure y figcaption

Cuando la imagen lleva un pie visible:

~~~html
<figure>
  <img src="consulta.jpg" alt="Sala de espera con seis butacas" />
  <figcaption>La sala de espera tras la reforma</figcaption>
</figure>
~~~

El \`figcaption\` es el pie que **se ve**; el \`alt\` sigue describiendo la imagen para
quien no puede verla. No son lo mismo y no se repiten: si el pie ya lo dice todo, el \`alt\`
puede quedarse vacío.

## Tamaño

~~~html
<img src="consulta.jpg" alt="..." width="800" height="600" />
~~~

Poner las medidas hace que el navegador reserve el hueco antes de descargar la imagen, y
así el texto no pega un salto cuando termina de cargar.

## Errores típicos

- Olvidar el \`alt\`.
- Poner \`alt="imagen"\` o el nombre del fichero.
- Usar una imagen con texto dentro en vez de escribir el texto.
- Meter el \`figcaption\` fuera del \`figure\`.`,
  brief: `Monta una figura con su pie:

1. Un \`figure\` que contenga:
2. Una imagen \`consulta.jpg\` con un texto alternativo **descriptivo** (que diga qué se ve,
   con al menos tres palabras, y sin empezar por "imagen").
3. Un \`figcaption\` que diga \`La sala de espera tras la reforma\`.

Y debajo, fuera del figure, una imagen decorativa \`linea.svg\` con el \`alt\` vacío.`,
  fileName: 'index.html',
  starterCode: `<figure>
  <img src="consulta.jpg" />
</figure>
`,
  solution: `<figure>
  <img src="consulta.jpg" alt="Sala de espera con seis butacas junto a la ventana" />
  <figcaption>La sala de espera tras la reforma</figcaption>
</figure>

<img src="linea.svg" alt="" />
`,
  hints: [
    'El alt va dentro de la propia etiqueta img, como un atributo más.',
    'Describe lo que se ve, sin empezar por "imagen de": el lector de pantalla ya lo dice.',
    'La decorativa lleva alt="" (vacío, pero presente): así el lector de pantalla la salta.',
  ],
  tests: [
    {
      name: 'La imagen está dentro de un figure',
      code: 'figure > img',
      check: hasElement('figure img', 'La imagen tiene que ir dentro de un figure.'),
    },
    {
      name: 'Todas las imágenes tienen atributo alt',
      code: 'ninguna img sin alt',
      check: everyElement(
        'img',
        (element) => element.hasAttribute('alt'),
        'Alguna imagen no tiene alt. Aunque sea decorativa, el atributo tiene que estar (vacío).',
      ),
    },
    {
      name: 'El alt de la foto describe lo que se ve',
      code: 'alt con al menos tres palabras',
      check: checkHtml((doc) => {
        const image = doc.querySelector('figure img')
        if (!image) return 'Falta la imagen dentro del figure.'
        const alt = (image.getAttribute('alt') ?? '').trim()
        if (alt === '') return 'Esta imagen no es decorativa: necesita un alt que la describa.'
        if (/^imagen|^foto/i.test(alt)) {
          return 'No empieces el alt por "imagen" o "foto": el lector de pantalla ya anuncia que lo es.'
        }
        return alt.split(/\s+/).length >= 3
          ? null
          : 'El alt se queda corto: describe qué se ve, no lo que es.'
      }),
    },
    {
      name: 'El pie visible dice lo que se pide',
      code: '<figcaption>La sala de espera tras la reforma</figcaption>',
      check: hasText(
        'figure figcaption',
        'La sala de espera tras la reforma',
        'Falta el figcaption dentro del figure, con ese texto.',
      ),
    },
    {
      name: 'La imagen decorativa lleva el alt vacío',
      code: '<img src="linea.svg" alt="" />',
      check: checkHtml((doc) => {
        const decorative = doc.querySelector('img[src="linea.svg"]')
        if (!decorative) return 'Falta la imagen decorativa linea.svg.'
        return decorative.getAttribute('alt') === ''
          ? null
          : 'La decorativa lleva alt="" para que el lector de pantalla la salte.'
      }),
    },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "¿Cuál de estos alt es útil?",
      options: ["alt=\"imagen\"", "alt=\"Las citas suben un 20% en marzo\"", "alt=\"grafico.png\""],
      correct: 1,
      explanation: "El alt describe lo que la imagen aporta, no lo que es. El lector de pantalla ya anuncia que es una imagen.",
    },
    {
      kind: "fill",
      prompt: "Marca una imagen decorativa para que el lector de pantalla la salte.",
      snippet: "<img src=\"adorno.svg\" alt=___ />",
      answers: ["\"\"", "''"],
      explanation: "El alt vacío la salta. Quitarlo del todo es peor: entonces se lee el nombre del fichero.",
    },
    {
      kind: "drag",
      prompt: "Monta la figura con su pie.",
      snippet: "<___>\n  <img src=\"consulta.jpg\" alt=\"Sala de espera\" />\n  <___>La sala tras la reforma</figcaption>\n</figure>",
      blanks: ["figure", "figcaption"],
      pool: ["figure", "figcaption", "caption"],
      explanation: "El figcaption es el pie que se ve; el alt sigue siendo para quien no ve la imagen.",
    },
    {
      kind: "choice",
      prompt: "¿Para qué sirve poner width y height en una imagen?",
      options: ["Para que se vea más nítida", "Para que el navegador reserve el hueco y el texto no dé un salto al cargar", "Para comprimirla"],
      correct: 1,
      explanation: "Sin las medidas, la página se recoloca de golpe cuando la imagen termina de descargarse.",
    },
    {
      kind: "choice",
      prompt: "La imagen no carga porque el servidor está caído. ¿Qué ve el usuario?",
      options: ["Un hueco vacío", "El texto del alt", "El nombre del fichero"],
      correct: 1,
      explanation: "Es la segunda razón para escribirlo bien: pasa más veces de las que parece.",
    },
  ],
}
