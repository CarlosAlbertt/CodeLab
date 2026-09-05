import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'ts-07-uniones',
  language: 'typescript',
  title: 'Uniones y estrechamiento de tipos',
  difficulty: 2,
  concepts: ['type', 'union', 'narrowing', 'unión discriminada'],
  theory: `## La idea

Hay cosas que solo pueden ser una de entre unas pocas opciones: un semáforo está en rojo,
ámbar o verde, y no hay más. Una petición está cargando o ya tiene datos, pero nunca las
dos a la vez.

Un **tipo unión** dice exactamente eso. Y a cambio el compilador se pone estricto: no te
deja tocar los datos de un caso mientras no hayas comprobado que estás en ese caso. Suena
molesto, y es justo lo que evita la mitad de los fallos en producción.

## Tipos unión

Una unión dice "esto puede ser una cosa **o** la otra":

~~~ts
type Id = string | number
~~~

Mientras el compilador no sepa cuál de las dos es, solo te deja usar lo que tienen en común.
Para poder usar el resto tienes que **estrechar** el tipo con una comprobación:

~~~ts
function mostrar(id: Id): string {
  if (typeof id === 'string') {
    return id.toUpperCase()  // aquí id es string
  }
  return id.toFixed(0)       // aquí ya solo puede ser number
}
~~~

## Uniones discriminadas

El patrón más útil: varios objetos que comparten una propiedad literal que los distingue.

~~~ts
type Peticion =
  | { estado: 'cargando' }
  | { estado: 'listo'; datos: string }

function render(p: Peticion): string {
  if (p.estado === 'listo') {
    return p.datos   // TypeScript sabe que aquí existe "datos"
  }
  return 'Cargando...'
}
~~~

Fíjate en \`'cargando'\` como tipo: no es "un string cualquiera", es **ese** texto concreto.

## Por qué se llama estrechar

Antes del \`if\`, el tipo es la unión entera y solo puedes usar lo que comparten todas las opciones. Dentro del \`if\`, TypeScript descarta las que ya no son posibles y el tipo se estrecha. Es el compilador siguiendo tu mismo razonamiento.

## Errores típicos

- Acceder a una propiedad que solo existe en una de las opciones sin comprobar antes cuál es.
- Declarar la propiedad discriminante como \`string\` en vez del literal \`'ok'\`: si admite cualquier texto, ya no distingue nada.
- Poner un \`else\` innecesario: si el \`if\` termina en \`return\`, lo que va después ya es la otra opción.`,
  brief: `Modela el resultado de una operación que puede salir bien o mal.

1. Declara el tipo \`Resultado\` como la unión de dos formas:
   - \`{ estado: 'ok'; valor: number }\`
   - \`{ estado: 'error'; mensaje: string }\`
2. Implementa \`describir(resultado: Resultado): string\` que devuelve:
   - \`Correcto: 42\` cuando el estado es \`ok\` (con su valor).
   - \`Fallo: sin conexion\` cuando el estado es \`error\` (con su mensaje).`,
  quiz: [
    {
      kind: 'fill',
      prompt: "Une los dos tipos en una unión.",
      snippet: "type Id = string ___ number",
      answers: ["|"],
      explanation: "La barra vertical separa las opciones: el valor será una u otra.",
    },
    {
      kind: 'fill',
      prompt: "Comprueba que es texto antes de usarlo como tal.",
      snippet: "if (___ id === 'string') { id.toUpperCase() }",
      answers: ["typeof"],
      explanation: "typeof estrecha el tipo: dentro del if, TypeScript ya sabe que es string.",
    },
    {
      kind: 'fill',
      prompt: "Haz que estado solo admita ese texto exacto.",
      snippet: "type Ok = { estado: ___; valor: number }",
      answers: ["'ok'"],
      explanation: "Un tipo literal admite un único valor, y por eso sirve para discriminar la unión.",
    },
    {
      kind: "drag",
      prompt: "Monta la unión discriminada.",
      snippet: "type Resultado = { estado: ___; valor: number } ___ { estado: 'error'; mensaje: string }",
      blanks: ["'ok'", "|"],
      pool: ["'ok'", "|", "&", "string"],
      explanation: "El literal 'ok' es lo que distingue un caso del otro, y la barra vertical une las dos opciones.",
    },
    {
      kind: "choice",
      prompt: "Dentro de este if, ¿qué sabe TypeScript?",
      snippet: "if (resultado.estado === 'ok') { }",
      options: ["Que resultado tiene mensaje", "Que resultado tiene valor", "Nada nuevo: sigue siendo la unión entera"],
      correct: 1,
      explanation: "Al comprobar la propiedad que discrimina, el tipo se estrecha y solo queda la opción con valor.",
    },
    {
      kind: "order",
      prompt: "Ordena la función que describe el resultado.",
      lines: ["function describir(resultado: Resultado): string {", "  if (resultado.estado === 'ok') {", "    return 'Correcto: ' + resultado.valor", "  }", "  return 'Fallo: ' + resultado.mensaje", "}"],
      explanation: "Se comprueba el caso bueno y se sale con return; lo que queda después ya solo puede ser el error.",
    },
  ],
  starterCode: `type Resultado = never // sustituye esto por la unión

function describir(resultado: Resultado): string {
  return ''
}
`,
  solution: `type Resultado =
  | { estado: 'ok'; valor: number }
  | { estado: 'error'; mensaje: string }

function describir(resultado: Resultado): string {
  if (resultado.estado === 'ok') {
    return \`Correcto: \${resultado.valor}\`
  }
  return \`Fallo: \${resultado.mensaje}\`
}
`,
  hints: [
    'Escribe la unión con la barra vertical: type Resultado = { ... } | { ... }.',
    "Las comillas en estado: 'ok' son parte del tipo: solo admite ese texto exacto.",
    'Comprueba resultado.estado === "ok" antes de acceder a resultado.valor.',
  ],
  tests: [
    {
      name: 'Describe un resultado correcto',
      code: `expect(describir({ estado: 'ok', valor: 42 })).toBe('Correcto: 42')`,
    },
    {
      name: 'Describe un error',
      code: `expect(describir({ estado: 'error', mensaje: 'sin conexion' })).toBe('Fallo: sin conexion')`,
    },
    {
      name: 'Funciona con el valor cero',
      code: `expect(describir({ estado: 'ok', valor: 0 })).toBe('Correcto: 0')`,
    },
  ],
}
