import type { Exercise } from '@/types/exercise'
import { hasDeclaration } from '@/engine/css/checks'

export const exercise: Exercise = {
  id: 'css-02-caja',
  language: 'css',
  title: 'El modelo de caja',
  difficulty: 2,
  concepts: ['box-sizing', 'padding', 'border', 'margin', 'unidades'],
  theory: `## Todo es una caja

Cada elemento de la página es un rectángulo con cuatro capas, de dentro hacia fuera:

~~~
+-----------------------------------+
|            margin                 |   separación con los de al lado
|  +-----------------------------+  |
|  |          border             |  |   el borde dibujado
|  |  +-----------------------+  |  |
|  |  |       padding         |  |  |   aire entre el borde y el texto
|  |  |  +-----------------+  |  |  |
|  |  |  |    contenido    |  |  |  |
~~~

La confusión clásica: **\`padding\` es por dentro y \`margin\` por fuera**. Si quieres
separar dos tarjetas entre sí, es \`margin\`. Si quieres que el texto no toque el borde de
su tarjeta, es \`padding\`.

## box-sizing, la línea que se pone siempre

Por defecto, \`width: 300px\` es el ancho **del contenido**: si además pones 20px de padding
y 1px de borde a cada lado, la caja ocupa 342. Ese cálculo vuelve loco a cualquiera.

~~~css
* {
  box-sizing: border-box;
}
~~~

Con esto, \`width: 300px\` significa 300 en total, padding y borde incluidos. Es la primera
regla de casi cualquier hoja de estilos del mundo.

## La forma corta

~~~css
padding: 1rem;                /* los cuatro lados */
padding: 1rem 2rem;           /* arriba/abajo, izquierda/derecha */
padding: 1rem 2rem 0 2rem;    /* arriba, derecha, abajo, izquierda (en el sentido del reloj) */
~~~

Igual para \`margin\` y \`border-width\`.

## Unidades

- \`px\` — fijo. Bien para bordes.
- \`rem\` — múltiplo del tamaño base del navegador (normalmente 16px). Es la buena para
  tamaños y espacios: si alguien agranda la letra por accesibilidad, todo escala con ella.
- \`%\` — respecto al contenedor.

Consejo: usa \`rem\` para casi todo y \`px\` solo para lo que no debe escalar.

## Centrar un bloque

~~~css
.contenedor {
  max-width: 40rem;
  margin: 0 auto;
}
~~~

\`auto\` a los lados reparte el espacio sobrante por igual. Y \`max-width\` en vez de
\`width\` para que en una pantalla estrecha se encoja en vez de desbordar.

## Errores típicos

- Confundir \`padding\` con \`margin\`.
- No poner \`box-sizing: border-box\` y pelearse con anchos que no cuadran.
- Usar \`width\` fijo donde debería ir \`max-width\`.
- Medirlo todo en \`px\` y romper el zoom de quien necesita letra más grande.`,
  brief: `Da forma de tarjeta al bloque de la vista previa:

1. Aplica \`box-sizing: border-box\` a **todos** los elementos (selector \`*\`).
2. En \`.tarjeta\`: \`padding\` de \`1rem\`, borde \`1px solid #d4d4d8\`, \`border-radius\`
   de \`8px\` y \`margin-bottom\` de \`1rem\`.
3. En \`.contenedor\`: \`max-width\` de \`40rem\` y \`margin: 0 auto\` para centrarlo.`,
  fileName: 'estilos.css',
  setup: `<div class="contenedor">
  <div class="tarjeta"><h2>Consulta general</h2><p>Lunes a viernes, de 9 a 14.</p></div>
  <div class="tarjeta"><h2>Urgencias</h2><p>Todos los días, 24 horas.</p></div>
</div>`,
  starterCode: `/* Empieza por el box-sizing */
`,
  solution: `* {
  box-sizing: border-box;
}

.contenedor {
  max-width: 40rem;
  margin: 0 auto;
}

.tarjeta {
  padding: 1rem;
  border: 1px solid #d4d4d8;
  border-radius: 8px;
  margin-bottom: 1rem;
}
`,
  hints: [
    'El selector * afecta a todos los elementos.',
    'El borde se escribe de una vez: border: 1px solid #d4d4d8;',
    'Para centrar un bloque hacen falta las dos cosas: un ancho máximo y margin: 0 auto.',
  ],
  tests: [
    {
      name: 'box-sizing aplicado a todo',
      code: '* { box-sizing: border-box; }',
      check: hasDeclaration(
        '*',
        'box-sizing',
        'border-box',
        'Falta la regla * con box-sizing: border-box.',
      ),
    },
    {
      name: 'La tarjeta respira por dentro',
      code: '.tarjeta { padding: 1rem; }',
      check: hasDeclaration('.tarjeta', 'padding', /1rem/, 'Falta padding: 1rem en .tarjeta.'),
    },
    {
      name: 'La tarjeta tiene borde redondeado',
      code: '.tarjeta { border: 1px solid #d4d4d8; border-radius: 8px; }',
      check: (source, output) => {
        const borde = hasDeclaration(
          '.tarjeta',
          'border',
          /1px\s+solid\s+#d4d4d8/i,
          'Falta border: 1px solid #d4d4d8 en .tarjeta.',
        )(source, output)
        if (borde) return borde
        return hasDeclaration(
          '.tarjeta',
          'border-radius',
          /8px/,
          'Falta border-radius: 8px en .tarjeta.',
        )(source, output)
      },
    },
    {
      name: 'Las tarjetas se separan entre sí por fuera',
      code: '.tarjeta { margin-bottom: 1rem; }',
      check: hasDeclaration(
        '.tarjeta',
        'margin-bottom',
        /1rem/,
        'Falta margin-bottom: 1rem. La separación entre cajas es margin, no padding.',
      ),
    },
    {
      name: 'El contenedor está centrado y limitado',
      code: '.contenedor { max-width: 40rem; margin: 0 auto; }',
      check: (source, output) => {
        const ancho = hasDeclaration(
          '.contenedor',
          'max-width',
          /40rem/,
          'Falta max-width: 40rem en .contenedor.',
        )(source, output)
        if (ancho) return ancho
        return hasDeclaration(
          '.contenedor',
          'margin',
          /0\s+auto/,
          'Falta margin: 0 auto para centrar el contenedor.',
        )(source, output)
      },
    },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "Quieres separar dos tarjetas entre sí. ¿Qué usas?",
      options: ["padding", "margin", "gap dentro de cada tarjeta"],
      correct: 1,
      explanation: "padding es por dentro (entre el borde y el texto) y margin por fuera (entre cajas).",
    },
    {
      kind: "fill",
      prompt: "Haz que width signifique el ancho total, borde incluido.",
      snippet: "* { box-sizing: ___; }",
      answers: ["border-box"],
      explanation: "Es la primera regla de casi cualquier hoja de estilos, y evita pelearse con anchos que no cuadran.",
    },
    {
      kind: "drag",
      prompt: "Centra un bloque y limítale el ancho.",
      snippet: ".contenedor {\n  ___: 40rem;\n  margin: 0 ___;\n}",
      blanks: ["max-width", "auto"],
      pool: ["max-width", "auto", "width", "center"],
      explanation: "max-width deja que se encoja en pantallas estrechas; auto reparte el espacio sobrante a los lados.",
    },
    {
      kind: "choice",
      prompt: "padding: 1rem 2rem; ¿qué significa?",
      options: ["Arriba 1rem y el resto 2rem", "Arriba y abajo 1rem, izquierda y derecha 2rem", "Solo arriba y a la derecha"],
      correct: 1,
      explanation: "Con dos valores, el primero es vertical y el segundo horizontal.",
    },
    {
      kind: "choice",
      prompt: "¿Por qué rem y no px para los tamaños?",
      options: ["Porque px está obsoleto", "Porque si alguien agranda la letra por accesibilidad, todo escala con ella", "Porque rem carga más rápido"],
      correct: 1,
      explanation: "px se reserva para lo que no debe escalar, como el grosor de un borde.",
    },
  ],
}
