import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'ts-03-decisiones',
  language: 'typescript',
  title: 'Decisiones: if, else y comparaciones',
  difficulty: 1,
  concepts: ['if', 'else', 'comparaciones', 'boolean', '&& ||'],
  theory: `## La idea

Hasta ahora tus funciones hacían siempre lo mismo. Un programa útil necesita **elegir**:
si el usuario es menor de edad, una cosa; si no, otra. Eso es un \`if\`.

## Comparar dos valores

Comparar produce siempre un \`boolean\`: \`true\` o \`false\`.

~~~ts
5 === 5     // true   (igual)
5 !== 3     // true   (distinto)
5 > 3       // true
5 >= 5      // true   (mayor o igual)
~~~

Cuidado con el clásico: \`=\` **guarda** un valor, \`===\` **compara**. Escribir
\`if (x = 5)\` no compara nada, le mete un 5 a x.

## if

~~~ts
function acceso(edad: number): string {
  if (edad >= 18) {
    return 'permitido'
  }
  return 'denegado'
}
~~~

Se lee: *si \`edad\` es 18 o más, sal devolviendo \`'permitido'\`*. Si la condición no se
cumple, el bloque entre llaves se salta entero y el programa sigue en la línea siguiente.

Fíjate en que aquí no hace falta \`else\`: como el \`if\` termina en \`return\`, si el
programa llega a la última línea es porque la condición era falsa.

## else y else if

Cuando los dos caminos hacen algo distinto y ninguno sale de la función:

~~~ts
let mensaje = ''
if (edad >= 18) {
  mensaje = 'permitido'
} else {
  mensaje = 'denegado'
}
~~~

Y con varios tramos, se encadenan:

~~~ts
if (nota >= 9) return 'sobresaliente'
if (nota >= 7) return 'notable'
if (nota >= 5) return 'aprobado'
return 'suspenso'
~~~

**El orden importa muchísimo.** Se comprueban de arriba abajo y gana la primera que se
cumple. Si pusieras \`nota >= 5\` la primera, un 9 también entraría ahí y nunca verías un
sobresaliente. Regla práctica: de lo más exigente a lo menos.

## Combinar condiciones

~~~ts
if (edad >= 18 && tieneCarnet) { }   // && : tienen que cumplirse LAS DOS
if (esAdmin || esDueño) { }          // || : basta con UNA
if (!activo) { }                     // !  : lo contrario
~~~

## Comprobar primero lo raro

Un patrón que verás en todo código serio: descartar al principio los casos imposibles, y
dejar el cuerpo de la función limpio para el caso normal.

~~~ts
function media(a: number, b: number): number {
  if (b === 0) return 0     // el caso raro, fuera cuanto antes
  return (a + b) / 2
}
~~~

## Errores típicos

- Usar \`=\` en vez de \`===\` dentro del \`if\`.
- Ordenar mal los tramos de un \`else if\`: el primero que se cumple se lleva todo.
- Confundir \`&&\` con \`||\`. \`&&\` es exigente, \`||\` es conformista.
- Comparar textos con \`>\` esperando orden alfabético con acentos: no funciona como crees.`,
  brief: `Implementa \`calificacion(puntos)\`, que traduce una nota numérica a su palabra.

Los tramos, de arriba abajo:

- Si la nota es menor que \`0\` o mayor que \`10\`, devuelve \`'nota no valida'\`.
- \`9\` o más → \`'sobresaliente'\`
- \`7\` o más → \`'notable'\`
- \`5\` o más → \`'aprobado'\`
- El resto → \`'suspenso'\`

Piensa el orden antes de escribir: si empiezas por el tramo más bajo, los demás no se
alcanzan nunca.`,
  quiz: [
    {
      kind: 'choice',
      prompt: '¿Cuál de estas líneas compara de verdad, en vez de asignar?',
      options: ['if (edad = 18)', 'if (edad == 18)', 'if (edad === 18)'],
      correct: 2,
      explanation: 'Un solo = asigna. En TypeScript se compara con ===, que además exige que sean del mismo tipo.',
    },
    {
      kind: 'drag',
      prompt: 'Coloca el operador que hace falta en cada condición.',
      snippet: 'if (edad ___ 18 && tieneCarnet) { }\nif (esAdmin ___ esDueno) { }\nif (___ activo) { }',
      blanks: ['>=', '||', '!'],
      pool: ['>=', '||', '!', '&&'],
      explanation: '>= es mayor o igual, || basta con que se cumpla una, y ! le da la vuelta a la condición.',
    },
    {
      kind: 'order',
      prompt: 'Ordena los tramos para que las notas se clasifiquen bien.',
      lines: [
        "if (nota >= 9) return 'sobresaliente'",
        "if (nota >= 7) return 'notable'",
        "if (nota >= 5) return 'aprobado'",
        "return 'suspenso'",
      ],
      explanation: 'Se comprueban de arriba abajo y gana el primero que se cumple, así que van de más exigente a menos.',
    },
    {
      kind: 'choice',
      prompt: 'Con nota = 9 y los tramos en orden inverso (primero >= 5), ¿qué devolvería?',
      snippet: "if (nota >= 5) return 'aprobado'\nif (nota >= 9) return 'sobresaliente'",
      options: ["'sobresaliente'", "'aprobado'", 'Las dos cosas'],
      correct: 1,
      explanation: 'El primer if ya se cumple y sale con return: la línea del sobresaliente no llega a ejecutarse nunca.',
    },
    {
      kind: 'fill',
      prompt: 'Descarta el caso imposible antes de seguir.',
      snippet: 'if (puntos < 0 ___ puntos > 10) return "nota no valida"',
      answers: ['||'],
      explanation: 'Con || basta con que se cumpla una de las dos para que la nota sea inválida.',
    },
    {
      kind: 'choice',
      prompt: '¿Por qué en calificacion no hace falta un else?',
      options: [
        'Porque else solo se puede usar una vez por función',
        'Porque cada if termina en return, así que si el programa sigue es que no se cumplió',
        'Porque TypeScript añade el else automáticamente',
      ],
      correct: 1,
      explanation: 'return sale de la función en el acto. Lo que viene después ya es el caso contrario, sin necesidad de anidar.',
    },
  ],
  starterCode: `function calificacion(puntos: number): string {
  // Descarta primero las notas imposibles, y luego ve de mayor a menor
  return ''
}
`,
  solution: `function calificacion(puntos: number): string {
  if (puntos < 0 || puntos > 10) return 'nota no valida'
  if (puntos >= 9) return 'sobresaliente'
  if (puntos >= 7) return 'notable'
  if (puntos >= 5) return 'aprobado'
  return 'suspenso'
}
`,
  hints: [
    'Empieza descartando lo imposible: if (puntos < 0 || puntos > 10) return ...',
    'Después ve de mayor a menor: 9, luego 7, luego 5.',
    'El último caso no necesita if: si el programa llega ahí, es que no cumplió ninguno.',
  ],
  tests: [
    { name: 'Un 10 es sobresaliente', code: `expect(calificacion(10)).toBe('sobresaliente')` },
    { name: 'El 9 justo entra en sobresaliente', code: `expect(calificacion(9)).toBe('sobresaliente')` },
    { name: 'Un 8 es notable', code: `expect(calificacion(8)).toBe('notable')` },
    { name: 'El 7 justo entra en notable', code: `expect(calificacion(7)).toBe('notable')` },
    { name: 'Un 5 raspado aprueba', code: `expect(calificacion(5)).toBe('aprobado')` },
    { name: 'Por debajo de 5 se suspende', code: `expect(calificacion(4.9)).toBe('suspenso')
    expect(calificacion(0)).toBe('suspenso')` },
    { name: 'Las notas fuera de rango no son validas', code: `expect(calificacion(-1)).toBe('nota no valida')
    expect(calificacion(11)).toBe('nota no valida')` },
  ],
}
