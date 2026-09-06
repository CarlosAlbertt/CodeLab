import type { Exercise } from '@/types/exercise'
import { hasDeclaration } from '@/engine/css/checks'

export const exercise: Exercise = {
  id: 'css-01-selectores',
  language: 'css',
  title: 'Selectores y cascada',
  difficulty: 1,
  concepts: ['selector', 'clase', 'id', 'especificidad', 'herencia'],
  theory: `## Qué es una regla

El HTML dice qué es cada cosa. El CSS dice cómo se ve. Una regla tiene dos partes:

~~~css
h1 {
  color: #1d4ed8;
}
~~~

- El **selector** (\`h1\`) elige a quién se aplica.
- El **bloque** entre llaves lleva las declaraciones, cada una \`propiedad: valor;\`.

El punto y coma no es opcional en la práctica: si te lo dejas, la siguiente declaración se
pega a la anterior y las dos se pierden.

## Los tres selectores básicos

~~~css
p            { }   /* todos los párrafos */
.destacado   { }   /* los que tienen class="destacado" */
#principal   { }   /* el que tiene id="principal" */
~~~

El punto es para clases y la almohadilla para ids. Se combinan:

~~~css
article p          { }   /* párrafos dentro de un article, a cualquier profundidad */
article > p        { }   /* solo los hijos directos */
h1, h2             { }   /* los dos, misma regla */
~~~

## La cascada

Cuando dos reglas dicen cosas distintas del mismo elemento, gana una. El orden de decisión:

1. **Especificidad**: un \`id\` pesa más que una clase, y una clase más que una etiqueta.
2. Si empatan, **la última que se escribe**.

~~~css
p            { color: gray; }
.destacado   { color: red; }   /* gana en un <p class="destacado"> */
~~~

Por eso, cuando algo "no me hace caso", casi siempre es que otra regla más específica lo
está pisando. Y por eso conviene tirar de clases: los ids pesan tanto que luego cuesta
sobrescribirlos.

## !important

Existe, gana siempre, y es una mala señal. Si necesitas \`!important\` es que la cascada se
te ha ido de las manos. Déjalo para emergencias.

## Herencia

Algunas propiedades pasan de padres a hijos: \`color\`, \`font-family\`, \`line-height\`.
Otras no: \`border\`, \`padding\`, \`margin\`.

Por eso la tipografía se declara una vez en \`body\` y vale para toda la página.

## Errores típicos

- Olvidar el punto de la clase y escribir \`destacado { }\`.
- Olvidar el punto y coma al final de una declaración.
- Pelearse con una regla sin darse cuenta de que otra más específica manda.
- Repetir \`font-family\` en cada elemento en vez de heredarla desde \`body\`.`,
  brief: `Da estilo a la página que ves en la vista previa:

1. En \`body\`, tipografía \`sans-serif\` (para que la herede toda la página).
2. En \`h1\`, color \`#1d4ed8\`.
3. En la clase \`destacado\`, color \`#b91c1c\` y \`font-weight: bold\`.

Ve mirando la pestaña **Vista previa**: los cambios se ven al momento.`,
  fileName: 'estilos.css',
  setup: `<h1>Clínica Vitsync</h1>
<p>Atendemos de lunes a viernes.</p>
<p class="destacado">Urgencias 24 horas.</p>`,
  starterCode: `/* Escribe aquí tus reglas */
`,
  solution: `body {
  font-family: sans-serif;
}

h1 {
  color: #1d4ed8;
}

.destacado {
  color: #b91c1c;
  font-weight: bold;
}
`,
  hints: [
    'Cada regla es selector { propiedad: valor; }',
    'La clase se selecciona con un punto delante: .destacado',
    'La tipografía se pone en body una sola vez: los hijos la heredan.',
  ],
  tests: [
    {
      name: 'La tipografía se declara en body',
      code: 'body { font-family: sans-serif; }',
      check: hasDeclaration(
        'body',
        'font-family',
        /sans-serif/i,
        'Falta font-family: sans-serif en la regla de body.',
      ),
    },
    {
      name: 'El h1 lleva el azul pedido',
      code: 'h1 { color: #1d4ed8; }',
      check: hasDeclaration('h1', 'color', /#1d4ed8/i, 'Falta color: #1d4ed8 en la regla de h1.'),
    },
    {
      name: 'La clase destacado se selecciona con punto',
      code: '.destacado { color: #b91c1c; }',
      check: hasDeclaration(
        '.destacado',
        'color',
        /#b91c1c/i,
        'Falta la regla .destacado con color: #b91c1c (ojo al punto del selector).',
      ),
    },
    {
      name: 'El texto destacado va en negrita',
      code: '.destacado { font-weight: bold; }',
      check: hasDeclaration(
        '.destacado',
        'font-weight',
        /bold|700/i,
        'Falta font-weight: bold en .destacado.',
      ),
    },
  ],
  quiz: [
    {
      kind: "drag",
      prompt: "Escribe el selector de cada cosa.",
      snippet: "___destacado { }  /* class=\"destacado\" */\n___principal { }  /* id=\"principal\" */",
      blanks: [".", "#"],
      pool: [".", "#", "*", ":"],
      explanation: "El punto es para clases y la almohadilla para ids.",
    },
    {
      kind: "choice",
      prompt: "Un <p class=\"destacado\"> con estas dos reglas, ¿de qué color sale?",
      snippet: "p { color: gray; }\n.destacado { color: red; }",
      options: ["gray, porque va primero", "red, porque la clase es más específica que la etiqueta", "Depende del navegador"],
      correct: 1,
      explanation: "Primero manda la especificidad; solo si empatan gana la última escrita.",
    },
    {
      kind: "fill",
      prompt: "Cierra la declaración como es debido.",
      snippet: "h1 { color: #1d4ed8___ }",
      answers: [";"],
      explanation: "Sin el punto y coma, la siguiente declaración se pega a esta y se pierden las dos.",
    },
    {
      kind: "choice",
      prompt: "¿Cuál de estas propiedades heredan los hijos?",
      options: ["border", "font-family", "padding"],
      correct: 1,
      explanation: "Por eso la tipografía se declara una vez en body y vale para toda la página.",
    },
    {
      kind: "choice",
      prompt: "Una regla \"no hace caso\". ¿Qué miras primero?",
      options: ["Si el navegador está actualizado", "Si otra regla más específica la está pisando", "Si falta !important"],
      correct: 1,
      explanation: "Necesitar !important suele ser señal de que la cascada se ha ido de las manos.",
    },
  ],
}
