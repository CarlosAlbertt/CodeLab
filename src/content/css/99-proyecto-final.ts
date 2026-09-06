import type { Exercise } from '@/types/exercise'
import { checkCss, hasDeclaration, hasMedia } from '@/engine/css/checks'

export const exercise: Exercise = {
  id: 'css-99-proyecto-final',
  language: 'css',
  title: 'Maquetar la página de la clínica',
  kind: 'project',
  difficulty: 3,
  concepts: ['variables', 'box model', 'flexbox', 'grid', 'responsive'],
  theory: `## Qué vas a construir

El diseño de la página que montaste en la pista de HTML. El marcado ya está hecho: aquí
solo escribes los estilos, y en la vista previa ves cómo pasa de una lista de texto en
blanco y negro a algo con aspecto de página.

## Las piezas, todas juntas

- **Variables** para los colores, para no repetir el mismo hexadecimal por todas partes.
- **box-sizing** al principio, como siempre.
- **Flexbox** en la cabecera: título a un lado, menú al otro.
- **Grid** en la galería de servicios.
- **Media query** para que en móvil todo pase a una columna.

## Variables de CSS

~~~css
:root {
  --color-principal: #1d4ed8;
  --color-texto: #27272a;
}

h1 {
  color: var(--color-principal);
}
~~~

\`:root\` es el elemento raíz de la página, así que lo que declares ahí lo hereda todo.
La ventaja no es escribir menos: es que el día que cambies el azul corporativo, lo cambias
en un sitio.

## El orden de la hoja

Una hoja de estilos se lee mejor si sigue siempre el mismo guion:

1. Reinicio y variables (\`*\`, \`:root\`).
2. Elementos base (\`body\`, \`h1\`, \`a\`).
3. Bloques, de arriba abajo de la página (cabecera, contenido, tarjetas, pie).
4. Media queries al final.

## Cómo abordarlo

Igual que en HTML: por partes y mirando la vista previa a cada paso. Primero que se vea
decente en vertical (tipografía, colores, cajas), y solo después la colocación con flex y
grid. Si empiezas por la maquetación, no sabes si lo que ves mal es la caja o la rejilla.

## Errores típicos

- Poner colores a mano por toda la hoja y no poder cambiarlos después.
- Olvidar el \`box-sizing\` y pelearse con anchos que no cuadran.
- Meter la media query en medio de la hoja: al final se lee mejor y hay menos sorpresas.`,
  brief: `Escribe la hoja de estilos completa. Tiene que llevar:

**Base**

- \`*\` con \`box-sizing: border-box\`.
- \`:root\` con la variable \`--color-principal\` valiendo \`#1d4ed8\`.
- \`body\` con \`font-family: sans-serif\` y \`line-height: 1.6\`.

**Cabecera**

- \`.cabecera\`: \`display: flex\`, \`justify-content: space-between\` y \`align-items: center\`.
- \`.menu\`: \`display: flex\`, \`gap: 1rem\`, \`list-style: none\` y \`padding: 0\`.

**Contenido**

- \`.galeria\`: \`display: grid\`, \`grid-template-columns: repeat(3, 1fr)\` y \`gap: 1rem\`.
- \`.tarjeta\`: \`padding: 1rem\` y \`border: 1px solid #d4d4d8\`.
- \`h1\` con \`color: var(--color-principal)\`.

**Adaptable**

- Una media query \`(max-width: 600px)\` donde \`.galeria\` pase a \`1fr\`.`,
  fileName: 'estilos.css',
  setup: `<header class="cabecera">
  <h1>Clínica Vitsync</h1>
  <ul class="menu">
    <li><a href="/citas">Citas</a></li>
    <li><a href="/contacto">Contacto</a></li>
  </ul>
</header>
<main>
  <div class="galeria">
    <article class="tarjeta"><h2>General</h2><p>Consulta diaria.</p></article>
    <article class="tarjeta"><h2>Urgencias</h2><p>24 horas.</p></article>
    <article class="tarjeta"><h2>Análisis</h2><p>Con cita previa.</p></article>
  </div>
</main>
<footer><p>2026 Clínica Vitsync</p></footer>`,
  starterCode: `/* 1. Reinicio y variables */


/* 2. Elementos base */


/* 3. Bloques */


/* 4. Media queries */
`,
  solution: `/* 1. Reinicio y variables */
* {
  box-sizing: border-box;
}

:root {
  --color-principal: #1d4ed8;
}

/* 2. Elementos base */
body {
  font-family: sans-serif;
  line-height: 1.6;
}

h1 {
  color: var(--color-principal);
}

/* 3. Bloques */
.cabecera {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu {
  display: flex;
  gap: 1rem;
  list-style: none;
  padding: 0;
}

.galeria {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.tarjeta {
  padding: 1rem;
  border: 1px solid #d4d4d8;
}

/* 4. Media queries */
@media (max-width: 600px) {
  .galeria {
    grid-template-columns: 1fr;
  }
}
`,
  hints: [
    'Sigue el guion del enunciado en ese orden: es el mismo de la teoría.',
    'La variable se declara en :root y se usa con var(--color-principal).',
    'La cabecera y el menú son dos contenedores flex distintos.',
    'La media query va al final y solo cambia lo que cambia.',
  ],
  quiz: [
    {
      kind: "fill",
      prompt: "Declara las variables donde las herede toda la página.",
      snippet: "___ { --color-principal: #1d4ed8; }",
      answers: [":root"],
      explanation: ":root es el elemento raíz, así que lo que declares ahí llega a todo.",
    },
    {
      kind: "choice",
      prompt: "¿Cuál es la ventaja real de usar variables?",
      options: ["Que se escribe menos", "Que el día que cambie el azul corporativo lo cambias en un sitio", "Que la página carga antes"],
      correct: 1,
      explanation: "El ahorro de teclas es lo de menos; lo que importa es tener una sola fuente de verdad.",
    },
    {
      kind: "fill",
      prompt: "Usa la variable en el título.",
      snippet: "h1 { color: ___(--color-principal); }",
      answers: ["var"],
      explanation: "var() lee el valor declarado en :root.",
    },
    {
      kind: "order",
      prompt: "Ordena la hoja de estilos como conviene leerla.",
      lines: ["Reinicio y variables (* y :root)", "Elementos base (body, h1, a)", "Bloques de la página (cabecera, galería, tarjetas)", "Media queries"],
      explanation: "Las media queries al final: así lo específico corrige a lo general y hay menos sorpresas.",
    },
    {
      kind: "choice",
      prompt: "¿Por dónde conviene empezar a maquetar?",
      options: ["Por la colocación con flex y grid", "Por tipografía, colores y cajas, y solo después la colocación", "Por la media query"],
      correct: 1,
      explanation: "Si empiezas por la maquetación, no sabes si lo que ves raro es la caja o la rejilla.",
    },
  ],
  tests: [
    {
      name: 'Reinicio y variable de color',
      code: '* { box-sizing } y :root { --color-principal }',
      check: (source, output) =>
        hasDeclaration('*', 'box-sizing', 'border-box', 'Falta * { box-sizing: border-box; }')(
          source,
          output,
        ) ??
        hasDeclaration(
          ':root',
          '--color-principal',
          /#1d4ed8/i,
          'Falta la variable --color-principal en :root.',
        )(source, output),
    },
    {
      name: 'La tipografia se declara una vez en body',
      code: 'body { font-family; line-height }',
      check: (source, output) =>
        hasDeclaration('body', 'font-family', /sans-serif/i, 'Falta font-family en body.')(
          source,
          output,
        ) ??
        hasDeclaration('body', 'line-height', /1\.6/, 'Falta line-height: 1.6 en body.')(
          source,
          output,
        ),
    },
    {
      name: 'El titulo usa la variable, no el color a mano',
      code: 'h1 { color: var(--color-principal) }',
      check: hasDeclaration(
        'h1',
        'color',
        /var\(\s*--color-principal\s*\)/i,
        'El h1 tiene que usar var(--color-principal): esa es la gracia de la variable.',
      ),
    },
    {
      name: 'La cabecera reparte titulo y menu',
      code: '.cabecera { display: flex; justify-content: space-between; align-items: center }',
      check: (source, output) =>
        hasDeclaration('.cabecera', 'display', 'flex', 'Falta display: flex en .cabecera.')(
          source,
          output,
        ) ??
        hasDeclaration(
          '.cabecera',
          'justify-content',
          /space-between/,
          'Falta justify-content: space-between en .cabecera.',
        )(source, output) ??
        hasDeclaration(
          '.cabecera',
          'align-items',
          /center/,
          'Falta align-items: center en .cabecera.',
        )(source, output),
    },
    {
      name: 'El menu es horizontal y ya no parece una lista',
      code: '.menu { display: flex; gap; list-style: none; padding: 0 }',
      check: (source, output) =>
        hasDeclaration('.menu', 'display', 'flex', 'Falta display: flex en .menu.')(source, output) ??
        hasDeclaration('.menu', 'gap', /1rem/, 'Falta gap: 1rem en .menu.')(source, output) ??
        hasDeclaration('.menu', 'list-style', /none/, 'Falta list-style: none en .menu.')(
          source,
          output,
        ) ??
        hasDeclaration('.menu', 'padding', /^0/, 'Falta padding: 0 en .menu.')(source, output),
    },
    {
      name: 'La galeria es una rejilla de tres columnas',
      code: '.galeria { display: grid; grid-template-columns: repeat(3, 1fr); gap }',
      check: (source, output) =>
        hasDeclaration('.galeria', 'display', 'grid', 'Falta display: grid en .galeria.')(
          source,
          output,
        ) ??
        hasDeclaration(
          '.galeria',
          'grid-template-columns',
          /repeat\(\s*3\s*,\s*1fr\s*\)|1fr\s+1fr\s+1fr/i,
          'Falta grid-template-columns con tres columnas iguales.',
        )(source, output) ??
        hasDeclaration('.galeria', 'gap', /1rem/, 'Falta gap: 1rem en .galeria.')(source, output),
    },
    {
      name: 'Las tarjetas tienen aire y borde',
      code: '.tarjeta { padding: 1rem; border: 1px solid #d4d4d8 }',
      check: (source, output) =>
        hasDeclaration('.tarjeta', 'padding', /1rem/, 'Falta padding: 1rem en .tarjeta.')(
          source,
          output,
        ) ??
        hasDeclaration(
          '.tarjeta',
          'border',
          /1px\s+solid\s+#d4d4d8/i,
          'Falta border: 1px solid #d4d4d8 en .tarjeta.',
        )(source, output),
    },
    {
      name: 'En pantalla estrecha la galeria pasa a una columna',
      code: '@media (max-width: 600px) { .galeria { grid-template-columns: 1fr } }',
      check: (source, output) =>
        hasMedia(/max-width\s*:\s*600px/i, 'Falta la media query (max-width: 600px).')(
          source,
          output,
        ) ??
        checkCss((sheet) => {
          const regla = sheet.rules.find(
            (rule) =>
              rule.media !== undefined &&
              rule.selectors.includes('.galeria') &&
              rule.declarations['grid-template-columns'] !== undefined,
          )
          if (!regla) return 'Dentro de la media query falta .galeria con grid-template-columns.'
          return /^1fr$/i.test(regla.declarations['grid-template-columns']!.trim())
            ? null
            : 'Dentro de la media query, grid-template-columns tiene que quedarse en 1fr.'
        })(source, output),
    },
  ],
}
