import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'ts-02-parametros-opcionales',
  language: 'typescript',
  title: 'Parámetros con valor por defecto',
  difficulty: 1,
  concepts: ['valores por defecto', 'number', 'redondeo'],
  theory: `## Valores por defecto

Un parámetro puede llevar un valor que se usa cuando quien llama a la función no lo pasa.
TypeScript deduce el tipo a partir de ese valor, así que no hace falta anotarlo:

~~~ts
function saludar(nombre: string, saludo = 'Hola'): string {
  return saludo + ', ' + nombre
}

saludar('Ana')            // "Hola, Ana"
saludar('Ana', 'Buenas')  // "Buenas, Ana"
~~~

Los parámetros con valor por defecto van **siempre al final**.

## Redondear a dos decimales

Los números en JavaScript tienen decimales imprecisos (\`0.1 + 0.2\` no da exactamente \`0.3\`).
El truco habitual para dejar dos decimales es:

~~~ts
const redondeado = Math.round(valor * 100) / 100
~~~`,
  brief: `Implementa \`precioFinal\`, que calcula el importe a pagar de un producto:

1. Aplica el **descuento** (un porcentaje sobre la base).
2. Sobre ese resultado, suma el **IVA** (otro porcentaje).
3. Devuelve el total **redondeado a dos decimales**.

Por defecto el descuento es \`0\` y el IVA es \`21\`.

Ejemplo: base \`100\`, descuento \`10\`, IVA \`21\` → \`90 * 1.21 = 108.9\`.`,
  starterCode: `function precioFinal(base: number, descuento = 0, iva = 21): number {
  // Aplica descuento, luego IVA, y redondea a 2 decimales
  return 0
}
`,
  solution: `function precioFinal(base: number, descuento = 0, iva = 21): number {
  const conDescuento = base * (1 - descuento / 100)
  const total = conDescuento * (1 + iva / 100)
  return Math.round(total * 100) / 100
}
`,
  hints: [
    'Un descuento del 10% equivale a multiplicar por (1 - 10 / 100).',
    'El IVA se aplica sobre el precio ya rebajado, no sobre la base.',
    'Redondea solo al final, con Math.round(total * 100) / 100.',
  ],
  tests: [
    {
      name: 'Aplica el IVA por defecto cuando solo llega la base',
      code: `expect(precioFinal(100)).toBeCloseTo(121, 2)`,
    },
    {
      name: 'Aplica descuento e IVA en ese orden',
      code: `expect(precioFinal(100, 10)).toBeCloseTo(108.9, 2)`,
    },
    {
      name: 'Permite cambiar el IVA',
      code: `expect(precioFinal(200, 50, 10)).toBeCloseTo(110, 2)`,
    },
    {
      name: 'Redondea a dos decimales',
      code: `expect(precioFinal(19.99, 7)).toBe(22.49)`,
    },
  ],
}
