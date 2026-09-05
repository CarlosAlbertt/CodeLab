import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'ts-04-bucles',
  language: 'typescript',
  title: 'Bucles: repetir sin copiar y pegar',
  difficulty: 2,
  concepts: ['for', 'while', 'for...of', 'acumuladores'],
  theory: `## La idea

Si tienes que hacer lo mismo diez veces, no escribes diez líneas: escribes una y le dices
al programa cuántas veces repetirla. Eso es un bucle.

## while: repite mientras se cumpla algo

~~~ts
let i = 0
while (i < 3) {
  console.log(i)   // 0, 1, 2
  i = i + 1
}
~~~

Todo bucle tiene tres piezas, y aquí se ven sueltas:

1. **Empezar** — \`let i = 0\`, antes del bucle.
2. **Condición** — \`i < 3\`, se comprueba antes de cada vuelta.
3. **Avanzar** — \`i = i + 1\`, al final de cada vuelta.

Si te olvidas de la tercera, la condición nunca deja de cumplirse y el bucle no termina
jamás. Es el famoso **bucle infinito**. Aquí no pasa nada grave: la ejecución se corta a
los 8 segundos y te lo dice.

## for: las tres piezas en una línea

~~~ts
for (let i = 0; i < 3; i++) {
  console.log(i)
}
~~~

Es exactamente el mismo bucle, con las tres piezas juntas y separadas por punto y coma.
\`i++\` es la forma corta de \`i = i + 1\`. Se usa tanto porque es difícil olvidarse de
avanzar cuando el avance va en la propia cabecera.

## for...of: recorrer una lista

Cuando solo quieres pasar por todos los elementos y no te importa la posición:

~~~ts
const nombres = ['Ana', 'Luis', 'Zoe']

for (const nombre of nombres) {
  console.log(nombre)
}
~~~

Se lee: *para cada \`nombre\` de \`nombres\`*. Es más corto y no puedes equivocarte con los
índices, así que úsalo siempre que puedas.

## El patrón del acumulador

Es, con diferencia, lo que más vas a escribir: una variable **declarada fuera** del bucle
que va creciendo dentro.

~~~ts
let suma = 0
for (const n of numeros) {
  suma = suma + n     // o, más corto: suma += n
}
return suma
~~~

Si declarases \`let suma = 0\` **dentro** del bucle, se reiniciaría en cada vuelta y al
final valdría solo el último número.

## Construir un texto

El mismo patrón sirve para ir pegando trozos:

~~~ts
let salida = ''
for (const nombre of nombres) {
  salida = salida + nombre + ', '
}
~~~

Aunque para eso casi siempre es mejor \`array.join(', ')\`, que ya pone el separador solo
entre elementos y no deja uno colgando al final.

## Cortar antes de tiempo

\`break\` sale del bucle inmediatamente; \`continue\` se salta el resto de esta vuelta y
pasa a la siguiente.

## Errores típicos

- No avanzar el contador en un \`while\`: bucle infinito.
- Escribir \`i <= lista.length\`: el último índice válido es \`length - 1\`, así que hay que
  usar \`<\`.
- Declarar el acumulador dentro del bucle.
- Cambiar la lista mientras la recorres: casi siempre acaba mal.`,
  brief: `Dos funciones, las dos con el patrón del acumulador.

1. \`sumaHasta(n)\` devuelve la suma de todos los números de \`1\` hasta \`n\`.
   Con \`4\` devuelve \`10\` (1 + 2 + 3 + 4). Si \`n\` es menor que \`1\`, devuelve \`0\`.

2. \`cuentaAtras(desde)\` devuelve el texto de la cuenta atrás, separando con coma y espacio
   y terminando en \`ya\`:

~~~
cuentaAtras(3)  ->  "3, 2, 1, ya"
cuentaAtras(1)  ->  "1, ya"
cuentaAtras(0)  ->  "ya"
~~~

Para la segunda, lo más cómodo es ir metiendo los números en un array y unirlo al final
con \`.join(', ')\`.`,
  quiz: [
    {
      kind: 'order',
      prompt: 'Ordena las piezas de un bucle while que cuenta hasta 3.',
      lines: ['let i = 0', 'while (i < 3) {', '  console.log(i)', '  i = i + 1', '}'],
      explanation: 'Primero se inicia el contador, luego se comprueba la condición y dentro, además del trabajo, hay que avanzarlo.',
    },
    {
      kind: 'drag',
      prompt: 'Completa las tres piezas de la cabecera del for.',
      snippet: 'for (let i = ___; i ___ lista.length; ___) { }',
      blanks: ['0', '<', 'i++'],
      pool: ['0', '<', 'i++', '<=', '1'],
      explanation: 'Se empieza en 0 y se para en length - 1, así que la condición es < y no <=. i++ avanza al final de cada vuelta.',
    },
    {
      kind: 'choice',
      prompt: '¿Qué le pasa a este bucle?',
      snippet: 'let i = 0\nwhile (i < 3) {\nconsole.log(i)\n}',
      options: [
        'Imprime 0, 1 y 2',
        'No imprime nada',
        'No termina nunca: falta avanzar i',
      ],
      correct: 2,
      explanation: 'i vale siempre 0, así que la condición nunca deja de cumplirse. Aquí la ejecución se corta a los 8 segundos.',
    },
    {
      kind: 'fill',
      prompt: 'Recorre la lista sin preocuparte de los índices.',
      snippet: 'for (const nombre ___ nombres) { console.log(nombre) }',
      answers: ['of'],
      explanation: 'for...of recorre los elementos directamente. (for...in recorre las claves, que casi nunca es lo que quieres.)',
    },
    {
      kind: 'choice',
      prompt: '¿Dónde tiene que declararse el acumulador?',
      snippet: 'for (const n of numeros) {\nsuma = suma + n\n}',
      options: ['Dentro del bucle', 'Fuera, antes del bucle', 'Da igual'],
      correct: 1,
      explanation: 'Declararlo dentro lo reiniciaría en cada vuelta, y al final valdría solo el último número.',
    },
    {
      kind: 'drag',
      prompt: 'Monta una cuenta atrás: el bucle tiene que ir hacia atrás.',
      snippet: 'for (let i = desde; i ___ 1; ___) { pasos.push(String(i)) }',
      blanks: ['>=', 'i--'],
      pool: ['>=', 'i--', '<=', 'i++'],
      explanation: 'Se empieza arriba y se baja: la condición es i >= 1 y el avance es i--.',
    },
  ],
  starterCode: `function sumaHasta(n: number): number {
  // Acumula fuera del bucle
  return 0
}

function cuentaAtras(desde: number): string {
  // Ve de "desde" hasta 1, y termina con "ya"
  return ''
}
`,
  solution: `function sumaHasta(n: number): number {
  let suma = 0
  for (let i = 1; i <= n; i++) {
    suma = suma + i
  }
  return suma
}

function cuentaAtras(desde: number): string {
  const pasos: string[] = []
  for (let i = desde; i >= 1; i--) {
    pasos.push(String(i))
  }
  pasos.push('ya')
  return pasos.join(', ')
}
`,
  hints: [
    'En sumaHasta declara la variable suma antes del for, y súmale i en cada vuelta.',
    'Si n es menor que 1, el bucle no llega a dar ninguna vuelta y suma se queda en 0: no hace falta un if.',
    'En cuentaAtras el bucle va hacia atrás: empieza en desde y usa i-- mientras i >= 1.',
    'String(i) convierte el número en texto, y pasos.join(", ") los une con la coma en medio.',
  ],
  tests: [
    { name: 'sumaHasta suma del 1 al 4', code: `expect(sumaHasta(4)).toBe(10)` },
    { name: 'sumaHasta con 1 devuelve 1', code: `expect(sumaHasta(1)).toBe(1)` },
    { name: 'sumaHasta devuelve 0 si no hay nada que sumar', code: `expect(sumaHasta(0)).toBe(0)
    expect(sumaHasta(-5)).toBe(0)` },
    { name: 'sumaHasta aguanta un numero grande', code: `expect(sumaHasta(100)).toBe(5050)` },
    { name: 'cuentaAtras desde 3', code: `expect(cuentaAtras(3)).toBe('3, 2, 1, ya')` },
    { name: 'cuentaAtras desde 1', code: `expect(cuentaAtras(1)).toBe('1, ya')` },
    { name: 'cuentaAtras desde 0 solo dice ya', code: `expect(cuentaAtras(0)).toBe('ya')` },
  ],
}
