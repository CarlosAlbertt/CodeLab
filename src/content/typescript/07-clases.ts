import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'ts-07-clases',
  language: 'typescript',
  title: 'Clases, estado privado y getters',
  difficulty: 2,
  concepts: ['class', 'private', 'métodos', 'getters'],
  theory: `## Clases

Una clase junta datos y las operaciones que los manipulan:

~~~ts
class Contador {
  private valor = 0

  incrementar(): void {
    this.valor++
  }

  leer(): number {
    return this.valor
  }
}

const c = new Contador()
c.incrementar()
c.leer()   // 1
~~~

## private

\`private\` impide tocar la propiedad desde fuera de la clase. Es una comprobación del
compilador: obliga a pasar por los métodos, que son los que garantizan que el estado
siempre sea coherente.

## Getters

Un \`get\` se declara como método pero se lee como propiedad, sin paréntesis:

~~~ts
class Contador {
  private valor = 0
  get actual(): number {
    return this.valor
  }
}

new Contador().actual   // sin ()
~~~`,
  brief: `Implementa la clase \`Carrito\` de una tienda:

- Una propiedad **privada** \`items\` con la lista de productos (\`nombre\` y \`precio\`).
- \`agregar(nombre: string, precio: number): void\` añade un producto.
- Un **getter** \`cantidad\` con el número de productos.
- \`total(): number\` con la suma de los precios, redondeada a dos decimales.
- \`vaciar(): void\` deja el carrito sin productos.`,
  starterCode: `class Carrito {
  private items: { nombre: string; precio: number }[] = []

  agregar(nombre: string, precio: number): void {
    // Añade el producto a items
  }

  get cantidad(): number {
    return 0
  }

  total(): number {
    return 0
  }

  vaciar(): void {
    // Deja items vacío
  }
}
`,
  solution: `class Carrito {
  private items: { nombre: string; precio: number }[] = []

  agregar(nombre: string, precio: number): void {
    this.items.push({ nombre, precio })
  }

  get cantidad(): number {
    return this.items.length
  }

  total(): number {
    const suma = this.items.reduce((acumulado, item) => acumulado + item.precio, 0)
    return Math.round(suma * 100) / 100
  }

  vaciar(): void {
    this.items = []
  }
}
`,
  hints: [
    'Dentro de la clase se accede al estado con this.items.',
    '{ nombre, precio } es la forma corta de { nombre: nombre, precio: precio }.',
    'El getter cantidad no lleva paréntesis al usarlo: carrito.cantidad.',
  ],
  tests: [
    {
      name: 'Un carrito nuevo está vacío',
      code: `const carrito = new Carrito()
    expect(carrito.cantidad).toBe(0)
    expect(carrito.total()).toBe(0)`,
    },
    {
      name: 'Cuenta y suma los productos añadidos',
      code: `const carrito = new Carrito()
    carrito.agregar('Camiseta', 19.99)
    carrito.agregar('Gorra', 9.5)
    expect(carrito.cantidad).toBe(2)
    expect(carrito.total()).toBe(29.49)`,
    },
    {
      name: 'Vaciar deja el carrito a cero',
      code: `const carrito = new Carrito()
    carrito.agregar('Camiseta', 19.99)
    carrito.vaciar()
    expect(carrito.cantidad).toBe(0)
    expect(carrito.total()).toBe(0)`,
    },
    {
      name: 'Cada carrito tiene su propio estado',
      code: `const uno = new Carrito()
    const otro = new Carrito()
    uno.agregar('Camiseta', 10)
    expect(uno.cantidad).toBe(1)
    expect(otro.cantidad).toBe(0)`,
    },
  ],
}
