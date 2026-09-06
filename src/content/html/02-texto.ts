import type { Exercise } from '@/types/exercise'
import { countElements, everyElement, hasText } from '@/engine/html/checks'

export const exercise: Exercise = {
  id: 'html-02-texto',
  language: 'html',
  title: 'Texto: encabezados, párrafos, listas y enlaces',
  difficulty: 1,
  concepts: ['h1-h6', 'p', 'ul', 'ol', 'li', 'a', 'strong', 'em'],
  theory: `## Encabezados

Van de \`h1\` a \`h6\` y forman el **índice** de la página. No son "letra grande": son
jerarquía.

~~~html
<h1>Título de la página</h1>
<h2>Una sección</h2>
<h3>Algo dentro de esa sección</h3>
~~~

Dos reglas que importan de verdad:

- **Un solo \`h1\` por página**, el que dice de qué va.
- **No te saltes niveles.** De un \`h2\` no se pasa a un \`h4\`.

Quien navega con lector de pantalla se mueve saltando de encabezado en encabezado, igual
que tú ojeas un documento mirando los títulos. Si la jerarquía está mal, esa navegación se
rompe.

## Párrafos

~~~html
<p>Un párrafo cualquiera.</p>
~~~

El navegador **ignora los saltos de línea y los espacios de más** de tu código: tres líneas
en blanco no separan nada. La separación se hace con etiquetas, no con teclas.

## Listas

~~~html
<ul>
  <li>Sin orden</li>
  <li>Otro elemento</li>
</ul>

<ol>
  <li>Primero</li>
  <li>Segundo</li>
</ol>
~~~

\`ul\` cuando el orden da igual, \`ol\` cuando importa (pasos de una receta). Dentro de una
lista **solo puede haber \`li\`**.

## Enlaces

~~~html
<a href="https://ejemplo.com">Ir a ejemplo</a>
<a href="contacto.html">Contacto</a>
<a href="#seccion">Bajar a la sección</a>
~~~

El texto del enlace tiene que decir a dónde lleva. "Haz clic aquí" no dice nada: quien
navega saltando de enlace en enlace oye una lista de "aquí, aquí, aquí".

## Énfasis

~~~html
<strong>importante</strong>   <em>matiz</em>
~~~

\`strong\` y \`em\` tienen significado. \`b\` e \`i\` solo ponen negrita y cursiva sin decir
por qué, así que se prefieren los primeros.

## Errores típicos

- Usar un \`h2\` porque "queda del tamaño que quiero". El tamaño es cosa del CSS.
- Meter texto suelto directamente dentro de un \`ul\`.
- Enlaces que dicen "aquí" o "leer más".
- Intentar separar párrafos con líneas en blanco en el código.`,
  brief: `Monta la parte de texto de una página de recetas, dentro del \`body\`:

1. Un \`h1\` que diga \`Tortilla de patatas\`.
2. Un \`h2\` que diga \`Ingredientes\`, y debajo una lista **sin orden** con tres elementos:
   \`Patatas\`, \`Huevos\` y \`Cebolla\`.
3. Otro \`h2\` que diga \`Pasos\`, y debajo una lista **ordenada** con dos elementos:
   \`Pelar las patatas\` y \`Batir los huevos\`.
4. Un párrafo con un enlace a \`https://es.wikipedia.org/wiki/Tortilla_de_patatas\` cuyo
   texto sea \`Más sobre la tortilla\`.`,
  fileName: 'index.html',
  starterCode: `<h1>Tortilla de patatas</h1>
`,
  solution: `<h1>Tortilla de patatas</h1>

<h2>Ingredientes</h2>
<ul>
  <li>Patatas</li>
  <li>Huevos</li>
  <li>Cebolla</li>
</ul>

<h2>Pasos</h2>
<ol>
  <li>Pelar las patatas</li>
  <li>Batir los huevos</li>
</ol>

<p>
  <a href="https://es.wikipedia.org/wiki/Tortilla_de_patatas">Más sobre la tortilla</a>
</p>
`,
  hints: [
    'La lista sin orden es <ul> y la ordenada <ol>; las dos llevan <li> dentro.',
    'Hay dos h2, uno por cada sección.',
    'El enlace va dentro de un párrafo: <p><a href="...">texto</a></p>',
  ],
  tests: [
    {
      name: 'Hay un único h1 con el nombre de la receta',
      code: '<h1>Tortilla de patatas</h1>',
      check: hasText('h1', 'Tortilla de patatas', 'Falta el h1 con el título de la receta.'),
    },
    {
      name: 'Hay dos secciones con h2',
      code: 'dos elementos h2',
      check: countElements('h2', 2, 'Se esperan dos h2: Ingredientes y Pasos.'),
    },
    {
      name: 'Los ingredientes van en una lista sin orden de tres elementos',
      code: '<ul> con 3 <li>',
      check: countElements('ul > li', 3, 'La lista de ingredientes tiene que ser un ul con tres li.'),
    },
    {
      name: 'Los pasos van en una lista ordenada de dos elementos',
      code: '<ol> con 2 <li>',
      check: countElements('ol > li', 2, 'Los pasos van en un ol con dos li, porque el orden importa.'),
    },
    {
      name: 'El enlace apunta a Wikipedia y está dentro de un párrafo',
      code: '<p><a href="https://es.wikipedia.org/...">Más sobre la tortilla</a></p>',
      check: everyElement(
        'p a',
        (element) =>
          element.getAttribute('href') === 'https://es.wikipedia.org/wiki/Tortilla_de_patatas' &&
          (element.textContent ?? '').trim() === 'Más sobre la tortilla',
        'Falta el enlace dentro de un párrafo, con esa dirección y ese texto.',
      ),
    },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "¿Cuántos h1 debería tener una página?",
      options: ["Tantos como secciones", "Uno solo, el que dice de qué va la página", "Ninguno, es opcional"],
      correct: 1,
      explanation: "Los encabezados forman el índice de la página, y un índice tiene un único título principal.",
    },
    {
      kind: "drag",
      prompt: "Elige la lista adecuada para cada caso.",
      snippet: "<___> <!-- ingredientes: el orden da igual -->\n<___> <!-- pasos de la receta: el orden importa -->",
      blanks: ["ul", "ol"],
      pool: ["ul", "ol", "li", "dl"],
      explanation: "ul es la lista sin orden y ol la ordenada. Dentro de las dos van li.",
    },
    {
      kind: "fill",
      prompt: "Indica a dónde lleva el enlace.",
      snippet: "<a ___=\"contacto.html\">Contacto</a>",
      answers: ["href"],
      explanation: "href es la dirección de destino del enlace.",
    },
    {
      kind: "choice",
      prompt: "¿Por qué \"Haz clic aquí\" es mal texto para un enlace?",
      options: ["Porque es muy largo", "Porque quien navega saltando de enlace en enlace oye \"aquí, aquí, aquí\"", "Porque los buscadores lo penalizan por spam"],
      correct: 1,
      explanation: "El texto del enlace tiene que decir a dónde lleva, porque muchas veces se lee fuera de contexto.",
    },
    {
      kind: "order",
      prompt: "Ordena la lista de ingredientes.",
      lines: ["<ul>", "  <li>Patatas</li>", "  <li>Huevos</li>", "</ul>"],
      explanation: "Dentro de un ul solo pueden ir elementos li, nunca texto suelto.",
    },
  ],
}
