import type { Exercise } from '@/types/exercise'
import { checkHtml, countElements, hasElement, isInside } from '@/engine/html/checks'

export const exercise: Exercise = {
  id: 'html-03-semantica',
  language: 'html',
  title: 'Semántica: decir qué es cada parte',
  difficulty: 2,
  concepts: ['header', 'nav', 'main', 'section', 'article', 'footer', 'accesibilidad'],
  theory: `## El problema de la sopa de divs

Se puede hacer una página entera con \`div\`. Se ve exactamente igual:

~~~html
<div class="cabecera">...</div>
<div class="menu">...</div>
<div class="contenido">...</div>
~~~

Pero para el navegador, el buscador y el lector de pantalla, eso son tres cajas idénticas
sin más información. La clase \`"menu"\` no significa nada: es un nombre que te has
inventado tú.

## Las etiquetas que sí dicen algo

~~~html
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
      <p>...</p>
    </article>
  </main>

  <footer>
    <p>2026 Clínica Vitsync</p>
  </footer>
</body>
~~~

- \`header\` — la cabecera de la página o de una sección.
- \`nav\` — un bloque de navegación. No todos los enlaces van en un \`nav\`: solo los
  menús.
- \`main\` — el contenido principal. **Solo uno por página**, y no se mete dentro de
  ninguno de los otros.
- \`section\` — una sección temática, que normalmente lleva su encabezado.
- \`article\` — algo que tiene sentido por sí solo, aunque lo saques de la página: una
  noticia, una entrada de blog, una ficha de producto.
- \`footer\` — el pie.

## Por qué merece la pena

Quien usa un lector de pantalla puede decir "llévame al contenido principal" y saltarse el
menú, que es idéntico en las veinte páginas del sitio. Con \`div\` eso no existe: hay que
tabular por todo el menú cada vez.

Los buscadores también lo usan para entender qué parte de la página es el contenido de
verdad.

## section o div

La regla práctica: si el bloque **tendría un título** en un índice, es una \`section\`. Si
solo lo estás agrupando para colocarlo con CSS, es un \`div\`. El \`div\` no está prohibido,
solo no significa nada, y para eso está bien.

## Errores típicos

- Varios \`main\` en la misma página, o un \`main\` dentro de un \`article\`.
- Usar \`section\` para todo, incluso para envolver dos botones.
- Meter todos los enlaces de la página en un \`nav\`.
- Pensar que estas etiquetas cambian el aspecto. No cambian nada: eso es el CSS.`,
  brief: `Estructura la página de una clínica usando etiquetas semánticas, dentro del \`body\`:

1. Un \`header\` con el \`h1\` \`Clínica Vitsync\` y, dentro, un \`nav\` con dos enlaces:
   \`Citas\` a \`/citas\` y \`Contacto\` a \`/contacto\`.
2. Un \`main\` con un \`article\` que contenga un \`h2\` y un párrafo.
3. Un \`footer\` con un párrafo.

Solo hace falta el contenido del body: aquí no repitas el esqueleto.`,
  fileName: 'index.html',
  starterCode: `<div class="cabecera">
  <h1>Clínica Vitsync</h1>
  <div class="menu">
    <a href="/citas">Citas</a>
    <a href="/contacto">Contacto</a>
  </div>
</div>

<div class="contenido">
  <div>
    <h2>Cómo pedir cita</h2>
    <p>Puedes reservar por teléfono o desde la web.</p>
  </div>
</div>

<div class="pie">
  <p>2026 Clínica Vitsync</p>
</div>
`,
  solution: `<header>
  <h1>Clínica Vitsync</h1>
  <nav>
    <a href="/citas">Citas</a>
    <a href="/contacto">Contacto</a>
  </nav>
</header>

<main>
  <article>
    <h2>Cómo pedir cita</h2>
    <p>Puedes reservar por teléfono o desde la web.</p>
  </article>
</main>

<footer>
  <p>2026 Clínica Vitsync</p>
</footer>
`,
  hints: [
    'Es traducir cada div a la etiqueta que dice lo que ese bloque es en realidad.',
    'El nav va dentro del header, envolviendo los dos enlaces.',
    'El article va dentro del main, y no al revés.',
  ],
  tests: [
    {
      name: 'La cabecera es un header',
      code: '<header>',
      check: hasElement('header', 'Falta el elemento header.'),
    },
    {
      name: 'El h1 y el menú están dentro de la cabecera',
      code: 'header > h1 y header nav',
      check: checkHtml((doc) => {
        if (!doc.querySelector('header h1')) return 'El h1 tiene que estar dentro del header.'
        return doc.querySelector('header nav') ? null : 'El nav va dentro del header.'
      }),
    },
    {
      name: 'El menú tiene los dos enlaces',
      code: 'nav con 2 enlaces',
      check: countElements('nav a', 2, 'El nav tiene que envolver los dos enlaces.'),
    },
    {
      name: 'Hay un único main',
      code: 'un solo <main>',
      check: countElements('main', 1, 'Tiene que haber exactamente un main por página.'),
    },
    {
      name: 'El contenido va en un article dentro del main',
      code: 'main > article',
      check: isInside('article', 'main', 'El article tiene que estar dentro del main.'),
    },
    {
      name: 'Hay un footer',
      code: '<footer>',
      check: hasElement('footer', 'Falta el elemento footer.'),
    },
    {
      name: 'Ya no queda ningún div de los de antes',
      code: 'sin elementos div',
      check: countElements('div', 0, 'Todavía queda algún div: todos tienen su etiqueta semántica.'),
    },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "¿Qué gana quien usa un lector de pantalla con las etiquetas semánticas?",
      options: ["Nada, es cosa de los buscadores", "Puede saltar directamente al contenido principal en vez de tabular por todo el menú", "La página carga más rápido"],
      correct: 1,
      explanation: "Con divs todos los bloques son iguales y no hay a dónde saltar.",
    },
    {
      kind: "drag",
      prompt: "Pon la etiqueta que corresponde a cada bloque.",
      snippet: "<___> <!-- cabecera con el titulo -->\n<___> <!-- menu de navegacion -->\n<___> <!-- contenido principal -->\n<___> <!-- pie -->",
      blanks: ["header", "nav", "main", "footer"],
      pool: ["header", "nav", "main", "footer", "section"],
      explanation: "Cada una dice qué es ese bloque, y eso es lo que aprovechan el navegador, el buscador y el lector de pantalla.",
    },
    {
      kind: "choice",
      prompt: "¿Cuántos main puede haber en una página?",
      options: ["Uno por sección", "Exactamente uno", "Los que quieras"],
      correct: 1,
      explanation: "Solo hay un contenido principal, y además no se mete dentro de header, article ni footer.",
    },
    {
      kind: "fill",
      prompt: "Envuelve algo que tendría sentido por sí solo fuera de la página.",
      snippet: "<___><h2>Cómo pedir cita</h2><p>...</p></___>",
      answers: ["article"],
      explanation: "article es lo autocontenido: una noticia, una ficha, una entrada de blog.",
    },
    {
      kind: "choice",
      prompt: "¿Cuándo usar div en vez de section?",
      options: ["Nunca, div está obsoleto", "Cuando solo agrupas para colocar con CSS y ese bloque no tendría un título", "Siempre que haya más de dos elementos"],
      correct: 1,
      explanation: "div no está prohibido: simplemente no significa nada, y para agrupar por estilo está bien.",
    },
  ],
}
