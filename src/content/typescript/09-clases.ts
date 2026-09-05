import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'ts-09-clases',
  language: 'typescript',
  title: 'Clases, estado privado y getters',
  difficulty: 2,
  concepts: ['class', 'private', 'métodos', 'getters'],
  theory: `## La idea

Una clase junta en un mismo sitio unos datos y las operaciones que los tocan. En vez de
tener por ahí suelto un array de productos y varias funciones que lo modifican, tienes un
\`Carrito\` que guarda sus productos y es el único que sabe cómo cambiarlos.

La ventaja no es escribir menos código: es que el estado no se pueda estropear desde fuera.
Si solo se toca a través de los métodos, son esos métodos los que garantizan que siempre
sea coherente.

## Clases

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
~~~

## Propiedades desde el constructor

TypeScript permite declarar y asignar una propiedad en el propio constructor:

~~~ts
class Cuenta {
  constructor(private saldo: number) {}

  disponible(): number {
    return this.saldo
  }
}
~~~

Equivale a declarar \`private saldo\` y asignarla dentro, pero en una línea.

## Errores típicos

- Olvidar \`this.\` al usar una propiedad dentro de un método: sin él, TypeScript busca una variable suelta.
- Llamar a un getter con paréntesis: es \`carrito.cantidad\`, no \`carrito.cantidad()\`.
- Dar por hecho que \`private\` protege en tiempo de ejecución: es una comprobación del compilador, no un candado.`,
  brief: `Implementa la clase \`Carrito\` de una tienda:

- Una propiedad **privada** \`items\` con la lista de productos (\`nombre\` y \`precio\`).
- \`agregar(nombre: string, precio: number): void\` añade un producto.
- Un **getter** \`cantidad\` con el número de productos.
- \`total(): number\` con la suma de los precios, redondeada a dos decimales.
- \`vaciar(): void\` deja el carrito sin productos.`,
  quiz: [
    {
      kind: 'fill',
      prompt: "Impide que se toque la propiedad desde fuera.",
      snippet: "class Contador { ___ valor = 0 }",
      answers: ["private"],
      explanation: "private obliga a pasar por los métodos de la clase para cambiar el estado.",
    },
    {
      kind: 'fill',
      prompt: "Accede a la propiedad desde dentro del método.",
      snippet: "leer(): number { return ___.valor }",
      answers: ["this"],
      explanation: "Sin this, TypeScript busca una variable suelta en vez de la propiedad.",
    },
    {
      kind: 'fill',
      prompt: "Convierte el método en un getter.",
      snippet: "___ actual(): number { return this.valor }",
      answers: ["get"],
      explanation: "Un getter se declara con get y se lee como una propiedad, sin paréntesis.",
    },
    {
      kind: "order",
      prompt: "Ordena una clase con estado privado.",
      lines: ["class Contador {", "  private valor = 0", "  incrementar(): void {", "    this.valor++", "  }", "}"],
      explanation: "Las propiedades se declaran arriba y los métodos después, todo dentro de las llaves de la clase.",
    },
    {
      kind: "drag",
      prompt: "Completa el getter que expone el valor.",
      snippet: "___ actual(): number { return ___.valor }",
      blanks: ["get", "this"],
      pool: ["get", "this", "private", "return"],
      explanation: "get lo convierte en getter, y this. es lo que apunta a la propiedad de esta instancia.",
    },
    {
      kind: "choice",
      prompt: "¿Cómo se lee un getter llamado cantidad?",
      options: ["carrito.cantidad()", "carrito.cantidad", "carrito.get(cantidad)"],
      correct: 1,
      explanation: "Se declara como método pero se lee como propiedad: sin paréntesis.",
    },
  ],
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
