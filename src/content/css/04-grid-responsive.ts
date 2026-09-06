import type { Exercise } from '@/types/exercise'
import { checkCss, hasDeclaration, hasMedia } from '@/engine/css/checks'

export const exercise: Exercise = {
  id: 'css-04-grid-responsive',
  language: 'css',
  title: 'Grid y diseño adaptable',
  difficulty: 3,
  concepts: ['display: grid', 'grid-template-columns', 'fr', '@media'],
  theory: `## Grid: filas y columnas a la vez

Flexbox coloca en **una** dirección: una fila o una columna. Grid coloca en **dos**: una
rejilla de verdad. Para una galería de tarjetas, grid es lo natural.

~~~css
.galeria {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
~~~

Tres columnas iguales, con un hueco de 1rem. No hace falta tocar los hijos: se colocan
solos, y cuando se acaba la fila salta a la siguiente.

## La unidad fr

\`fr\` es "una parte del espacio libre". \`repeat(3, 1fr)\` reparte el ancho en tres partes
iguales, sean cuales sean. \`2fr 1fr\` haría la primera columna el doble de ancha que la
segunda.

Es mucho mejor que los porcentajes, porque el \`gap\` ya está descontado: con \`33%\` tres
veces más el hueco, te pasas y se desborda.

## Media queries

Una pantalla de móvil no da para tres columnas. Una **media query** aplica reglas solo
cuando se cumple una condición:

~~~css
@media (max-width: 600px) {
  .galeria {
    grid-template-columns: 1fr;
  }
}
~~~

Por debajo de 600px de ancho, una sola columna. Fuera de ahí, la regla de antes sigue
mandando.

## Móvil primero

La costumbre recomendada es escribir primero lo sencillo (una columna, que es como se ve un
móvil) y luego **ampliar** con \`min-width\`:

~~~css
.galeria { display: grid; gap: 1rem; }

@media (min-width: 600px) {
  .galeria { grid-template-columns: repeat(3, 1fr); }
}
~~~

Sale menos código y el móvil, que es donde hay menos recursos, no carga con reglas que
luego hay que deshacer. Las dos formas funcionan; esta envejece mejor.

## Grid sin media queries

Para una galería, muchas veces basta con esto:

~~~css
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
~~~

*Mete tantas columnas como quepan, de 200px mínimo.* Se adapta sola, sin puntos de corte.

## Errores típicos

- Usar grid para una sola fila: para eso está flexbox.
- Poner los porcentajes a mano y olvidarse del \`gap\`.
- Media queries con anchos raros copiados de un móvil concreto: pon el corte donde el
  diseño se rompe, no donde mide tal teléfono.`,
  brief: `Maqueta la galería de tarjetas:

1. En \`.galeria\`: \`display: grid\`, tres columnas iguales con
   \`grid-template-columns: repeat(3, 1fr)\` y \`gap\` de \`1rem\`.
2. Añade una media query para \`max-width: 600px\` en la que \`.galeria\` pase a una sola
   columna (\`grid-template-columns: 1fr\`).

Prueba a estrechar la ventana con la vista previa abierta.`,
  fileName: 'estilos.css',
  setup: `<div class="galeria">
  <article class="tarjeta"><h2>General</h2><p>Consulta diaria.</p></article>
  <article class="tarjeta"><h2>Urgencias</h2><p>24 horas.</p></article>
  <article class="tarjeta"><h2>Análisis</h2><p>Con cita previa.</p></article>
  <article class="tarjeta"><h2>Pediatría</h2><p>Martes y jueves.</p></article>
</div>`,
  starterCode: `.tarjeta {
  padding: 1rem;
  border: 1px solid #d4d4d8;
  border-radius: 8px;
}

/* Ahora la galería */
`,
  solution: `.tarjeta {
  padding: 1rem;
  border: 1px solid #d4d4d8;
  border-radius: 8px;
}

.galeria {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* En pantallas estrechas, una sola columna. */
@media (max-width: 600px) {
  .galeria {
    grid-template-columns: 1fr;
  }
}
`,
  hints: [
    'repeat(3, 1fr) es la forma corta de escribir 1fr 1fr 1fr.',
    'La media query envuelve reglas completas: @media (max-width: 600px) { .galeria { ... } }',
    'Dentro de la media query solo hace falta cambiar lo que cambia, no repetirlo todo.',
  ],
  tests: [
    {
      name: 'La galería es una rejilla',
      code: '.galeria { display: grid; }',
      check: hasDeclaration('.galeria', 'display', 'grid', 'Falta display: grid en .galeria.'),
    },
    {
      name: 'Tiene tres columnas iguales',
      code: 'grid-template-columns: repeat(3, 1fr)',
      check: hasDeclaration(
        '.galeria',
        'grid-template-columns',
        /repeat\(\s*3\s*,\s*1fr\s*\)|1fr\s+1fr\s+1fr/i,
        'Falta grid-template-columns con tres columnas iguales.',
      ),
    },
    {
      name: 'Las tarjetas se separan con gap',
      code: '.galeria { gap: 1rem; }',
      check: hasDeclaration('.galeria', 'gap', /1rem/, 'Falta gap: 1rem en .galeria.'),
    },
    {
      name: 'Hay una media query para pantallas estrechas',
      code: '@media (max-width: 600px)',
      check: hasMedia(
        /max-width\s*:\s*600px/i,
        'Falta la media query @media (max-width: 600px).',
      ),
    },
    {
      name: 'En móvil la galería pasa a una columna',
      code: '@media ... { .galeria { grid-template-columns: 1fr; } }',
      check: checkCss((sheet) => {
        const regla = sheet.rules.find(
          (rule) =>
            rule.media !== undefined &&
            rule.selectors.includes('.galeria') &&
            rule.declarations['grid-template-columns'] !== undefined,
        )
        if (!regla) return 'Dentro de la media query falta la regla .galeria con grid-template-columns.'
        return /^1fr$/i.test(regla.declarations['grid-template-columns']!.trim())
          ? null
          : 'Dentro de la media query, grid-template-columns tiene que quedarse en 1fr.'
      }),
    },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "¿Cuándo grid y cuándo flexbox?",
      options: ["Grid siempre, es más moderno", "Grid para dos dimensiones (filas y columnas); flexbox para una", "Da igual, hacen lo mismo"],
      correct: 1,
      explanation: "Para un menú en fila, flexbox. Para una galería de tarjetas, grid.",
    },
    {
      kind: "fill",
      prompt: "Tres columnas iguales, sin repetirte.",
      snippet: "grid-template-columns: ___(3, 1fr);",
      answers: ["repeat"],
      explanation: "repeat(3, 1fr) es la forma corta de 1fr 1fr 1fr.",
    },
    {
      kind: "choice",
      prompt: "¿Por qué 1fr y no 33%?",
      options: ["Porque los porcentajes no funcionan en grid", "Porque fr reparte el espacio libre con el gap ya descontado, y 33% tres veces más el hueco se desborda", "Porque fr es más preciso"],
      correct: 1,
      explanation: "Es el motivo por el que las maquetaciones con porcentajes siempre acababan con un scroll horizontal.",
    },
    {
      kind: "drag",
      prompt: "Una sola columna en pantallas estrechas.",
      snippet: "___ (max-width: 600px) {\n  .galeria { grid-template-columns: ___; }\n}",
      blanks: ["@media", "1fr"],
      pool: ["@media", "1fr", "@import", "3fr"],
      explanation: "La media query envuelve reglas completas y solo cambia lo que hace falta cambiar.",
    },
    {
      kind: "choice",
      prompt: "¿Qué hace repeat(auto-fit, minmax(200px, 1fr))?",
      options: ["Siempre tres columnas", "Mete tantas columnas como quepan, de 200px mínimo, sin necesitar media queries", "Una columna por elemento"],
      correct: 1,
      explanation: "Para una galería suele bastar con esto, y te ahorras los puntos de corte.",
    },
  ],
}
