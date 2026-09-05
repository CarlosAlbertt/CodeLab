import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'ts-01-tipos-y-funciones',
  language: 'typescript',
  title: 'Tipos básicos y funciones',
  difficulty: 1,
  concepts: ['string', 'number', 'boolean', 'funciones', 'plantillas'],
  theory: `## Anotar tipos

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
