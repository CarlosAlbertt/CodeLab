import type { Exercise } from '@/types/exercise'
import { checkHtml, everyElement } from '@/engine/html/checks'

export const exercise: Exercise = {
  id: 'html-05-formularios',
  language: 'html',
  title: 'Formularios y etiquetas asociadas',
  difficulty: 2,
  concepts: ['form', 'label', 'input', 'type', 'required', 'button'],
  theory: `## La estructura

~~~html
<form action="/citas" method="post">
  <label for="nombre">Nombre</label>
  <input type="text" id="nombre" name="nombre" required />

  <button type="submit">Reservar</button>
</form>
~~~

- \`action\` — a dónde se envían los datos.
- \`method\` — \`get\` para búsquedas (los datos van en la URL), \`post\` para cualquier
  cosa que cambie algo o que sea privada.
- \`name\` — el nombre con el que llega cada dato al servidor. **Sin \`name\`, el campo no
  se envía.**

## label: lo más importante de esta unidad

Un campo sin etiqueta asociada es un campo que nadie sabe qué pide.

~~~html
<label for="nombre">Nombre</label>
<input id="nombre" ... />
~~~

El \`for\` del \`label\` tiene que valer **exactamente lo mismo** que el \`id\` del
\`input\`. Cuando coinciden pasan dos cosas: el lector de pantalla anuncia "Nombre, campo
de texto" al llegar ahí, y al pulsar sobre la palabra "Nombre" el cursor salta al campo,
lo que agranda mucho la zona pulsable en un móvil.

Un \`placeholder\` **no sustituye al label**: desaparece en cuanto escribes, así que a
mitad del formulario ya nadie recuerda qué pedía cada casilla.

## Tipos de campo

~~~html
<input type="text" />
<input type="email" />
<input type="password" />
<input type="number" min="0" max="10" />
<input type="date" />
<input type="checkbox" />
<textarea></textarea>
<select><option>...</option></select>
~~~

El tipo no es decorativo: en un móvil, \`type="email"\` saca un teclado con la arroba y
\`type="number"\` uno numérico. Y el navegador valida el formato solo.

## Validación

~~~html
<input type="email" id="correo" name="correo" required />
~~~

\`required\` impide enviar el formulario vacío. Es cómodo, pero **el servidor tiene que
validar igualmente**: la validación del navegador es para ayudar al usuario, no para
proteger nada. Cualquiera puede saltársela.

## Botones

~~~html
<button type="submit">Reservar</button>
~~~

Pon siempre el \`type\`: dentro de un formulario, un \`button\` sin tipo envía, lo que
sorprende cuando querías que solo abriera un desplegable.

## Errores típicos

- \`input\` sin \`label\`, o con el \`for\` y el \`id\` distintos.
- Usar el \`placeholder\` como si fuera la etiqueta.
- Olvidar el \`name\` y que el dato no llegue nunca.
- Fiarse solo de la validación del navegador.`,
  brief: `Monta el formulario de reserva de cita:

1. Un \`form\` que envíe a \`/citas\` con el método \`post\`.
2. Un campo de texto para el nombre: \`label\` con el texto \`Nombre\`, e \`input\` de tipo
   \`text\` con \`id\` y \`name\` iguales a \`nombre\`, y obligatorio.
3. Un campo de correo: \`label\` \`Correo\`, e \`input\` de tipo \`email\` con \`id\` y
   \`name\` iguales a \`correo\`, y obligatorio.
4. Un \`button\` de tipo \`submit\` que diga \`Reservar\`.

Cada \`label\` tiene que estar asociado a su campo con \`for\`.`,
  fileName: 'index.html',
  starterCode: `<form>
  <input type="text" placeholder="Nombre" />
  <input type="text" placeholder="Correo" />
  <button>Reservar</button>
</form>
`,
  solution: `<form action="/citas" method="post">
  <label for="nombre">Nombre</label>
  <input type="text" id="nombre" name="nombre" required />

  <label for="correo">Correo</label>
  <input type="email" id="correo" name="correo" required />

  <button type="submit">Reservar</button>
</form>
`,
  hints: [
    'El for del label y el id del input tienen que ser idénticos.',
    'El placeholder no vale como etiqueta: hace falta un label de verdad.',
    'El campo de correo va con type="email", no con type="text".',
    'Sin name, el dato no se envía aunque el campo esté relleno.',
  ],
  tests: [
    {
      name: 'El formulario envía a /citas por post',
      code: '<form action="/citas" method="post">',
      check: checkHtml((doc) => {
        const form = doc.querySelector('form')
        if (!form) return 'Falta el elemento form.'
        if (form.getAttribute('action') !== '/citas') return 'El form tiene que enviar a /citas.'
        return (form.getAttribute('method') ?? '').toLowerCase() === 'post'
          ? null
          : 'El método tiene que ser post.'
      }),
    },
    {
      name: 'Cada campo tiene su label asociado',
      code: 'label[for] apuntando al id del input',
      check: checkHtml((doc) => {
        const inputs = [...doc.querySelectorAll('input')]
        if (inputs.length < 2) return 'Faltan campos: se piden el nombre y el correo.'
        for (const input of inputs) {
          const id = input.getAttribute('id')
          if (!id) return 'Algún input no tiene id, así que ningún label puede apuntarle.'
          if (!doc.querySelector(`label[for="${id}"]`)) {
            return `No hay ningún label con for="${id}".`
          }
        }
        return null
      }),
    },
    {
      name: 'El correo usa el tipo email',
      code: '<input type="email" id="correo" ... />',
      check: checkHtml((doc) => {
        const correo = doc.querySelector('#correo')
        if (!correo) return 'Falta el campo con id="correo".'
        return correo.getAttribute('type') === 'email'
          ? null
          : 'El campo de correo va con type="email": el navegador valida el formato y el móvil saca el teclado adecuado.'
      }),
    },
    {
      name: 'Los dos campos se envían y son obligatorios',
      code: 'name y required en los dos input',
      check: everyElement(
        'input',
        (element) => element.hasAttribute('name') && element.hasAttribute('required'),
        'Los dos campos necesitan name (si no, el dato no se envía) y required.',
      ),
    },
    {
      name: 'El botón declara que envía',
      code: '<button type="submit">Reservar</button>',
      check: checkHtml((doc) => {
        const button = doc.querySelector('button')
        if (!button) return 'Falta el botón.'
        if (button.getAttribute('type') !== 'submit') return 'Ponle type="submit" al botón.'
        return (button.textContent ?? '').trim() === 'Reservar'
          ? null
          : 'El botón tiene que decir "Reservar".'
      }),
    },
  ],
  quiz: [
    {
      kind: "drag",
      prompt: "Asocia la etiqueta con su campo.",
      snippet: "<label ___=\"correo\">Correo</label>\n<input type=\"email\" ___=\"correo\" name=\"correo\" />",
      blanks: ["for", "id"],
      pool: ["for", "id", "name", "type"],
      explanation: "El for del label y el id del input tienen que valer exactamente lo mismo.",
    },
    {
      kind: "choice",
      prompt: "¿Puede el placeholder sustituir al label?",
      options: ["Sí, dice lo mismo", "No: desaparece en cuanto escribes, y a mitad del formulario ya nadie recuerda qué pedía cada casilla", "Solo en móvil"],
      correct: 1,
      explanation: "Además, el lector de pantalla no siempre lo anuncia. El label es lo que hace usable el formulario.",
    },
    {
      kind: "fill",
      prompt: "Haz que el dato llegue al servidor.",
      snippet: "<input type=\"text\" id=\"nombre\" ___=\"nombre\" />",
      answers: ["name"],
      explanation: "Sin name, el campo no se envía aunque esté relleno. El id es para el label; el name, para el servidor.",
    },
    {
      kind: "choice",
      prompt: "¿Basta con required para validar los datos?",
      options: ["Sí, el navegador ya no deja enviar", "No: es una ayuda al usuario, pero cualquiera puede saltársela, así que el servidor tiene que validar igual", "Solo si además pones pattern"],
      correct: 1,
      explanation: "La validación del navegador mejora la experiencia; la seguridad se hace siempre en el servidor.",
    },
    {
      kind: "order",
      prompt: "Ordena el campo completo.",
      lines: ["<label for=\"correo\">Correo</label>", "<input type=\"email\" id=\"correo\" name=\"correo\" required />", "<button type=\"submit\">Enviar</button>"],
      explanation: "La etiqueta va antes del campo, y el botón de envío al final del formulario.",
    },
  ],
}
