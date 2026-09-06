import type { Exercise } from '@/types/exercise'
import { hasDeclaration } from '@/engine/css/checks'

export const exercise: Exercise = {
  id: 'css-03-flexbox',
  language: 'css',
  title: 'Flexbox: colocar cosas en una fila',
  difficulty: 2,
  concepts: ['display: flex', 'justify-content', 'align-items', 'gap'],
  theory: `## El problema que resuelve

Poner tres cosas en fila, separadas y alineadas, era históricamente un dolor: floats,
posiciones absolutas, trucos con \`display: inline-block\` y espacios en blanco que
aparecían de la nada. Flexbox lo convierte en una línea.

## Contenedor y elementos

Flexbox siempre son **dos niveles**: le pones \`display: flex\` al **padre**, y sus hijos
directos se colocan en fila.

~~~css
.menu {
  display: flex;
  gap: 1rem;
}
~~~

Eso es todo: los hijos dejan de apilarse y se ponen uno al lado del otro, con un hueco de
1rem entre ellos.

## Los dos ejes

- El **eje principal** es la fila (por defecto, de izquierda a derecha).
- El **eje cruzado** es el perpendicular: arriba y abajo.

Y hay una propiedad para cada uno:

~~~css
justify-content: space-between;   /* reparte en el eje principal */
align-items: center;              /* alinea en el eje cruzado */
~~~

Esta es la parte que cuesta recordar. Una regla mnemotécnica: *justify* reparte a lo largo
de la fila; *align* centra respecto a la altura.

## Los valores que se usan de verdad

~~~css
justify-content: flex-start;      /* todo a la izquierda (por defecto) */
justify-content: center;
justify-content: space-between;   /* primero a un extremo, último al otro */

align-items: stretch;             /* misma altura todos (por defecto) */
align-items: center;              /* centrados verticalmente */
~~~

\`space-between\` es la que resuelve la cabecera típica: logo a la izquierda, menú a la
derecha, sin margins mágicos.

## gap

\`gap: 1rem\` pone el hueco **solo entre** los elementos, no en los extremos. Antes se hacía
con márgenes y siempre sobraba uno al final. Úsalo.

## Cambiar de dirección

~~~css
flex-direction: column;   /* apilados en vertical */
flex-wrap: wrap;          /* si no caben, saltan de línea */
~~~

Con \`column\` los ejes se intercambian: entonces \`justify-content\` reparte en vertical y
\`align-items\` en horizontal.

## Errores típicos

- Poner \`display: flex\` al hijo en vez de al padre.
- Confundir \`justify-content\` con \`align-items\`.
- Separar con \`margin\` cuando \`gap\` lo hace mejor.
- Olvidar quitar los puntos y el relleno de una lista al convertirla en menú.`,
  brief: `Convierte la lista en un menú horizontal:

1. En \`.menu\`: \`display: flex\`, \`gap\` de \`1rem\` y \`align-items: center\`.
2. Quítale a la lista su aspecto de lista: \`list-style: none\` y \`padding: 0\`.
3. En \`.cabecera\`: \`display: flex\` y \`justify-content: space-between\`, para que el
   título quede a un lado y el menú al otro.`,
  fileName: 'estilos.css',
  setup: `<header class="cabecera">
  <h1>Vitsync</h1>
  <ul class="menu">
    <li><a href="/citas">Citas</a></li>
    <li><a href="/contacto">Contacto</a></li>
    <li><a href="/ayuda">Ayuda</a></li>
  </ul>
</header>`,
  starterCode: `/* La cabecera y el menú */
`,
  solution: `.cabecera {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu {
  display: flex;
  gap: 1rem;
  align-items: center;
  list-style: none;
  padding: 0;
}
`,
  hints: [
    'display: flex va en el contenedor, no en los hijos.',
    'justify-content reparte a lo largo de la fila; align-items alinea en vertical.',
    'Una lista trae puntos y sangría de fábrica: list-style: none y padding: 0.',
  ],
  tests: [
    {
      name: 'El menú es un contenedor flex',
      code: '.menu { display: flex; }',
      check: hasDeclaration('.menu', 'display', 'flex', 'Falta display: flex en .menu.'),
    },
    {
      name: 'Los elementos del menú se separan con gap',
      code: '.menu { gap: 1rem; }',
      check: hasDeclaration('.menu', 'gap', /1rem/, 'Falta gap: 1rem en .menu.'),
    },
    {
      name: 'El menú ya no parece una lista',
      code: '.menu { list-style: none; padding: 0; }',
      check: (source, output) => {
        const estilo = hasDeclaration(
          '.menu',
          'list-style',
          /none/,
          'Falta list-style: none para quitar los puntos.',
        )(source, output)
        if (estilo) return estilo
        return hasDeclaration(
          '.menu',
          'padding',
          /^0/,
          'Falta padding: 0 para quitar la sangría que traen las listas.',
        )(source, output)
      },
    },
    {
      name: 'La cabecera reparte título y menú a los extremos',
      code: '.cabecera { display: flex; justify-content: space-between; }',
      check: (source, output) => {
        const flex = hasDeclaration(
          '.cabecera',
          'display',
          'flex',
          'Falta display: flex en .cabecera.',
        )(source, output)
        if (flex) return flex
        return hasDeclaration(
          '.cabecera',
          'justify-content',
          /space-between/,
          'Falta justify-content: space-between en .cabecera.',
        )(source, output)
      },
    },
    {
      name: 'Todo queda alineado verticalmente',
      code: 'align-items: center',
      check: hasDeclaration(
        '.cabecera',
        'align-items',
        /center/,
        'Falta align-items: center en .cabecera: es lo que alinea en el eje cruzado.',
      ),
    },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "¿A quién se le pone display: flex?",
      options: ["A los elementos que quieres colocar", "Al padre que los contiene", "A los dos"],
      correct: 1,
      explanation: "Flexbox son siempre dos niveles: el contenedor manda y los hijos directos se colocan.",
    },
    {
      kind: "drag",
      prompt: "Título a un lado, menú al otro, y todo alineado.",
      snippet: ".cabecera {\n  display: flex;\n  ___: space-between;\n  ___: center;\n}",
      blanks: ["justify-content", "align-items"],
      pool: ["justify-content", "align-items", "gap", "flex-direction"],
      explanation: "justify-content reparte a lo largo de la fila; align-items alinea en el eje cruzado.",
    },
    {
      kind: "fill",
      prompt: "Separa los elementos sin usar márgenes.",
      snippet: ".menu { display: flex; ___: 1rem; }",
      answers: ["gap"],
      explanation: "gap pone el hueco solo entre elementos, no en los extremos, que es lo que fallaba con los márgenes.",
    },
    {
      kind: "choice",
      prompt: "Con flex-direction: column, ¿qué hace justify-content?",
      options: ["Sigue repartiendo en horizontal", "Reparte en vertical, porque el eje principal ha cambiado", "Deja de tener efecto"],
      correct: 1,
      explanation: "Las propiedades se refieren a los ejes, no a las direcciones fijas de la pantalla.",
    },
    {
      kind: "order",
      prompt: "Ordena la regla del menú.",
      lines: [".menu {", "  display: flex;", "  gap: 1rem;", "  list-style: none;", "}"],
      explanation: "Una lista trae puntos y sangría de fábrica: al convertirla en menú hay que quitárselos.",
    },
  ],
}
