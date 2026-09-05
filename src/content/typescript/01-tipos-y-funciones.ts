import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'ts-01-tipos-y-funciones',
  language: 'typescript',
  title: 'Tipos básicos y funciones',
  difficulty: 1,
  concepts: ['string', 'number', 'boolean', 'funciones', 'plantillas'],
  theory: `## La idea

Ya sabes que una variable guarda un valor y que una función hace un trabajo. Aquí nos
fijamos en **los tipos**: lo que TypeScript añade a JavaScript.

Un tipo es una promesa que le haces al compilador: *aquí dentro solo va a haber un número*.
Si en cualquier punto del programa incumples esa promesa, te lo dice señalando la línea,
antes de ejecutar nada. Ese es todo el truco, y es la razón de escribir TypeScript.

## Anotar tipos

En TypeScript cada variable y cada parámetro puede llevar una **anotación de tipo**
después de dos puntos. El compilador comprueba que nunca le metas un valor que no encaje.

~~~ts
const nombre: string = 'Ana'
const edad: number = 30
const activo: boolean = true
~~~

En las funciones se anotan los parámetros y, después del paréntesis, el tipo que devuelve:

~~~ts
function doble(n: number): number {
  return n * 2
}
~~~

## Plantillas de texto

Para construir textos con valores dentro se usan comillas invertidas y \`\${...}\`:

~~~ts
const saludo = \`Hola, \${nombre}. Tienes \${edad} años.\`
~~~

## Operador ternario

\`condicion ? valorSiTrue : valorSiFalse\` es un if que devuelve un valor:

~~~ts
const etiqueta = activo ? 'activo' : 'inactivo'
~~~

## Errores típicos

- Poner el tipo antes del nombre, como en Java: aquí es \`nombre: string\`, no \`string nombre\`.
- Olvidar el tipo de retorno. No es obligatorio, pero anotarlo hace que el compilador te avise si te dejas un \`return\` por el camino.
- Usar comillas normales para las plantillas: la interpolación \${...} solo funciona con comillas invertidas.`,
  brief: `Implementa la función \`ficha\` que recibe un nombre, una edad y si la persona
está activa, y devuelve una línea de texto con este formato exacto:

~~~
Ana (30) - activo
Luis (45) - inactivo
~~~

Fíjate en los espacios: nombre, espacio, edad entre paréntesis, espacio, guion, espacio y el estado.`,
  quiz: [
    {
      kind: 'fill',
      prompt: "Anota el tipo de la variable.",
      snippet: "const edad: ___ = 30",
      answers: ["number"],
      explanation: "En TypeScript todos los números son number: no se distingue entero de decimal.",
    },
    {
      kind: 'fill',
      prompt: "Anota lo que devuelve la función.",
      snippet: "function doble(n: number): ___ { return n * 2 }",
      answers: ["number"],
      explanation: "El tipo de retorno va después del paréntesis y antes de la llave.",
    },
    {
      kind: 'fill',
      prompt: "Completa la plantilla para que salude por nombre.",
      snippet: "const saludo = `Hola, ___`",
      answers: ["${nombre}"],
      explanation: "Dentro de comillas invertidas, ${} inserta el valor de una variable.",
    },
    {
      kind: 'fill',
      prompt: "Completa el ternario para elegir entre los dos textos.",
      snippet: "const etiqueta = activo ___ 'activo' : 'inactivo'",
      answers: ["?"],
      explanation: "El ternario se escribe condicion ? valorSiTrue : valorSiFalse.",
    },
    {
      kind: "drag",
      prompt: "Coloca los tipos que faltan en la firma de la función.",
      snippet: "function ficha(nombre: ___, edad: ___): ___ { }",
      blanks: ["string", "number", "string"],
      pool: ["string", "number", "boolean"],
      explanation: "Recibe un texto y un número, y devuelve el texto ya montado. Lo de después de los dos puntos finales es siempre lo que sale.",
    },
    {
      kind: "choice",
      prompt: "¿Qué le pasa a esta línea?",
      snippet: "const edad: number = '30'",
      options: ["Nada: '30' se convierte solo a número", "Error: un string no encaja donde se declaró number", "Error: falta el punto y coma"],
      correct: 1,
      explanation: "'30' entre comillas es texto. TypeScript no convierte por su cuenta: te avisa antes de ejecutar.",
    },
    {
      kind: "order",
      prompt: "Ordena las líneas para que la función devuelva la ficha.",
      lines: ["function ficha(nombre: string, activo: boolean): string {", "  const estado = activo ? 'activo' : 'inactivo'", "  return nombre + \" - \" + estado", "}"],
      explanation: "Primero se calcula el estado y luego se usa: una variable no se puede usar antes de declararla.",
    },
  ],
  starterCode: `function ficha(nombre: string, edad: number, activo: boolean): string {
  // Devuelve el texto con el formato pedido
  return ''
}
`,
  solution: `function ficha(nombre: string, edad: number, activo: boolean): string {
  const estado = activo ? 'activo' : 'inactivo'
  return \`\${nombre} (\${edad}) - \${estado}\`
}
`,
  hints: [
    'Empieza calculando el estado con un ternario: activo ? "activo" : "inactivo".',
    'Usa comillas invertidas para montar el texto e insertar los valores con ${}.',
    'Comprueba los espacios uno a uno: "Ana" + " (" + 30 + ") - " + "activo".',
  ],
  tests: [
    {
      name: 'Formatea una persona activa',
      code: `expect(ficha('Ana', 30, true)).toBe('Ana (30) - activo')`,
    },
    {
      name: 'Formatea una persona inactiva',
      code: `expect(ficha('Luis', 45, false)).toBe('Luis (45) - inactivo')`,
    },
    {
      name: 'Funciona con cualquier nombre y edad',
      code: `expect(ficha('Zoe', 7, true)).toBe('Zoe (7) - activo')`,
    },
  ],
}
