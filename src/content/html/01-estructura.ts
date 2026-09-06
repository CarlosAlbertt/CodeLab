import type { Exercise } from '@/types/exercise'
import { checkHtml, hasElement, hasText } from '@/engine/html/checks'

export const exercise: Exercise = {
  id: 'html-01-estructura',
  language: 'html',
  title: 'La estructura de una página',
  difficulty: 1,
  concepts: ['doctype', 'html', 'head', 'body', 'meta', 'title'],
  theory: `## HTML no es programación

HTML no calcula nada ni toma decisiones: **describe** qué es cada parte de un documento.
Esto es un título, esto un párrafo, esto una lista. Nada más, y ahí está su valor: si la
descripción es correcta, el navegador, el buscador y el lector de pantalla saben qué hacer
con ella.

## Etiquetas

El elemento básico es la **etiqueta**, y casi siempre viene en pareja:

~~~html
<p>Esto es un párrafo.</p>
~~~

Apertura, contenido y cierre (con la barra). Algunas no tienen contenido y se cierran
solas, como \`<img>\` o \`<meta>\`.

Las etiquetas se **anidan**, y tienen que cerrarse en el orden inverso al que se abrieron:

~~~html
<p>Un <strong>énfasis</strong> dentro del párrafo.</p>
~~~

## Atributos

Van en la etiqueta de apertura y aportan información extra:

~~~html
<html lang="es">
<a href="https://ejemplo.com">un enlace</a>
~~~

Siempre \`nombre="valor"\`, con comillas.

## El esqueleto mínimo

Todas las páginas del mundo empiezan igual:

~~~html
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Mi página</title>
  </head>
  <body>
    <h1>Hola</h1>
  </body>
</html>
~~~

Pieza a pieza:

- \`<!DOCTYPE html>\` — le dice al navegador que use el estándar moderno. Sin él entra en
  un modo antiguo de compatibilidad y las cosas se descolocan.
- \`<html lang="es">\` — todo cuelga de aquí. El \`lang\` importa de verdad: es lo que hace
  que un lector de pantalla lea el texto con pronunciación española y que el navegador
  ofrezca traducirlo.
- \`<head>\` — información **sobre** la página, que no se ve: codificación, título,
  enlaces a los estilos.
- \`<meta charset="UTF-8" />\` — sin esto, los acentos y las eñes salen rotos.
- \`<title>\` — lo que aparece en la pestaña y en los resultados de búsqueda. No se ve
  dentro de la página.
- \`<body>\` — el contenido visible.

## head y body

La confusión más habitual al empezar: **lo que va en el \`head\` no se ve**. Si escribes un
párrafo ahí, el navegador lo mueve al \`body\` por su cuenta o lo ignora. Todo lo que
quieras que se lea va dentro del \`body\`.

## Comentarios

~~~html
<!-- esto no se muestra -->
~~~

## Errores típicos

- Olvidar la barra del cierre: \`<p>\` en vez de \`</p>\`.
- Cerrar en el orden equivocado: \`<p><strong>texto</p></strong>\`.
- Poner contenido visible dentro del \`head\`.
- Olvidar el \`charset\` y encontrarte con "Ã¡" donde debería haber una "á".`,
  brief: `Escribe el esqueleto completo de una página.

1. El \`DOCTYPE\`.
2. El elemento \`html\` con el idioma español.
3. Un \`head\` con la codificación UTF-8 y el título \`Mi primera página\`.
4. Un \`body\` con un encabezado \`h1\` que diga \`Hola, mundo\`.

A la derecha tienes la vista previa: verás la página tal cual la pinta el navegador.`,
  fileName: 'index.html',
  starterCode: `<!-- Escribe aquí el esqueleto -->
`,
  solution: `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Mi primera página</title>
  </head>
  <body>
    <h1>Hola, mundo</h1>
  </body>
</html>
`,
  hints: [
    'El DOCTYPE va en la primera línea y no lleva cierre: <!DOCTYPE html>',
    'El idioma es un atributo del elemento html: <html lang="es">',
    'La codificación es una etiqueta que se cierra sola: <meta charset="UTF-8" />',
    'El title va en el head; el h1, en el body.',
  ],
  tests: [
    {
      name: 'Declara el DOCTYPE',
      code: '<!DOCTYPE html>',
      check: checkHtml((doc) =>
        doc.doctype ? null : 'Falta <!DOCTYPE html> en la primera línea.',
      ),
    },
    {
      name: 'La página está en español',
      code: '<html lang="es">',
      check: checkHtml((doc) =>
        doc.documentElement.getAttribute('lang') === 'es'
          ? null
          : 'Falta el atributo lang="es" en la etiqueta html.',
      ),
    },
    {
      name: 'Declara la codificación UTF-8',
      code: '<meta charset="UTF-8" />',
      check: hasElement('head meta[charset]', 'Falta <meta charset="UTF-8" /> dentro del head.'),
    },
    {
      name: 'El título de la pestaña es el pedido',
      code: '<title>Mi primera página</title>',
      check: hasText('title', 'Mi primera página', 'El title tiene que decir exactamente "Mi primera página".'),
    },
    {
      name: 'El encabezado saluda',
      code: '<h1>Hola, mundo</h1>',
      check: hasText('body h1', 'Hola, mundo', 'Falta un h1 en el body que diga "Hola, mundo".'),
    },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "¿Qué pasa con lo que escribes dentro del head?",
      options: ["Se ve arriba del todo de la página", "No se ve: el head es información sobre la página", "Se ve solo al imprimir"],
      correct: 1,
      explanation: "Todo lo que quieras que se lea va dentro del body. El head lleva codificación, título y enlaces a estilos.",
    },
    {
      kind: "drag",
      prompt: "Completa el esqueleto mínimo.",
      snippet: "<!DOCTYPE html>\n<html ___=\"es\">\n  <head>\n    <meta ___=\"UTF-8\" />\n  </head>\n</html>",
      blanks: ["lang", "charset"],
      pool: ["lang", "charset", "type", "id"],
      explanation: "lang hace que un lector de pantalla pronuncie en español; charset evita que los acentos salgan rotos.",
    },
    {
      kind: "fill",
      prompt: "Cierra el párrafo.",
      snippet: "<p>Un párrafo cualquiera.___p>",
      answers: ["</"],
      explanation: "La etiqueta de cierre lleva barra: </p>.",
    },
    {
      kind: "choice",
      prompt: "¿Cuál está bien anidado?",
      options: ["<p><strong>texto</p></strong>", "<p><strong>texto</strong></p>", "<strong><p>texto</strong></p>"],
      correct: 1,
      explanation: "Se cierran en orden inverso al que se abrieron: la última que abre es la primera que cierra.",
    },
    {
      kind: "order",
      prompt: "Ordena las partes de una página.",
      lines: ["<!DOCTYPE html>", "<html lang=\"es\">", "  <head>...</head>", "  <body>...</body>", "</html>"],
      explanation: "El DOCTYPE va antes que nada, y dentro de html van primero el head y luego el body.",
    },
  ],
}
