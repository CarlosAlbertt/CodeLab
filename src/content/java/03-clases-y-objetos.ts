import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'java-03-clases-y-objetos',
  language: 'java',
  title: 'Clases y objetos',
  difficulty: 2,
  concepts: ['constructor', 'private', 'this', 'getters', 'encapsulación'],
  theory: `## De método estático a objeto

Hasta ahora todo era \`static\`: métodos que se llaman sobre la clase y no guardan nada. Un
objeto es lo contrario: **tiene estado**, y sus métodos trabajan sobre ese estado.

~~~java
public class Contador {

    private int valor = 0;

    public void incrementar() {
        valor++;
    }

    public int getValor() {
        return valor;
    }
}
~~~

~~~java
Contador c = new Contador();
c.incrementar();
c.getValor();   // 1
~~~

Cada \`new\` crea un objeto con su propio \`valor\`. Dos contadores no se pisan.

## static o no static

Es la duda más habitual al empezar:

- **Con \`static\`**: pertenece a la clase. No puede tocar los campos del objeto, porque no
  hay objeto. \`Math.max(1, 2)\`.
- **Sin \`static\`**: pertenece a cada objeto. Puede usar sus campos. \`c.incrementar()\`.

Si el método necesita datos del objeto, no es estático.

## El constructor

Es un método especial que se llama al crear el objeto. Se llama **igual que la clase** y no
declara tipo de retorno:

~~~java
public class Paciente {

    private final String nombre;
    private int edad;

    public Paciente(String nombre, int edad) {
        this.nombre = nombre;
        this.edad = edad;
    }
}
~~~

\`this.nombre\` es el campo y \`nombre\` a secas es el parámetro. Cuando se llaman igual,
\`this\` es lo único que los distingue.

\`final\` en un campo significa que se asigna una vez y ya no cambia: el equivalente a
\`readonly\`.

## private y los getters

\`private\` impide tocar el campo desde fuera. La ventaja no es el secretismo: es que si el
único camino son los métodos, esos métodos pueden garantizar que el estado siempre tenga
sentido. Un \`setEdad\` puede rechazar una edad negativa; un campo público no puede.

La costumbre en Java es campo \`private\` con \`getX()\` y, solo si de verdad hace falta,
\`setX()\`.

## record

Para un objeto que solo lleva datos:

~~~java
public record Cita(String paciente, int minutos) { }
~~~

Eso genera el constructor, los accesores, \`equals\`, \`hashCode\` y \`toString\`. Cuatro
líneas de trabajo en una.

## toString y equals

Si imprimes un objeto sin \`toString\`, sale algo como \`Paciente@1b6d\`. Y \`equals\` sin
implementar compara referencias, así que dos pacientes con el mismo nombre no son iguales.
Un \`record\` te da los dos gratis.

## Errores típicos

- Ponerle tipo de retorno al constructor: entonces ya no es un constructor, es un método
  normal, y \`new\` no lo llama.
- Olvidar \`this.\` y asignarse el parámetro a sí mismo.
- Llamar a un método de objeto desde uno estático.
- Comparar objetos con \`==\`.`,
  brief: `Escribe la clase \`Carrito\`, con estado propio:

1. Un campo **privado** con el total acumulado y otro con el número de productos.
2. \`agregar(String nombre, double precio)\` añade un producto.
3. \`getCantidad()\` devuelve cuántos productos hay.
4. \`getTotal()\` devuelve la suma de los precios.
5. \`vaciar()\` lo deja todo a cero.

Ninguno de estos métodos es \`static\`: todos trabajan sobre el objeto.`,
  fileName: 'Carrito.java',
  starterCode: `public class Carrito {

    // Los campos van aquí, privados

    public void agregar(String nombre, double precio) {
    }

    public int getCantidad() {
        return 0;
    }

    public double getTotal() {
        return 0;
    }

    public void vaciar() {
    }
}
`,
  solution: `public class Carrito {

    private int cantidad = 0;
    private double total = 0;

    public void agregar(String nombre, double precio) {
        cantidad++;
        total = total + precio;
    }

    public int getCantidad() {
        return cantidad;
    }

    public double getTotal() {
        return total;
    }

    public void vaciar() {
        cantidad = 0;
        total = 0;
    }
}
`,
  hints: [
    'Los campos se declaran dentro de la clase pero fuera de los métodos.',
    'agregar no devuelve nada: su tipo de retorno es void.',
    'No hace falta guardar los nombres para resolver el ejercicio, solo la cuenta y el total.',
  ],
  tests: [
    {
      name: 'Un carrito nuevo esta vacio',
      code: 'Carrito carrito = new Carrito();\n        assertEquals(0, carrito.getCantidad());\n        assertEquals(0.0, carrito.getTotal(), 0.001);',
    },
    {
      name: 'Cuenta y suma los productos',
      code: 'Carrito carrito = new Carrito();\n        carrito.agregar("Camiseta", 19.99);\n        carrito.agregar("Gorra", 9.5);\n        assertEquals(2, carrito.getCantidad());\n        assertEquals(29.49, carrito.getTotal(), 0.001);',
    },
    {
      name: 'Vaciar lo deja todo a cero',
      code: 'Carrito carrito = new Carrito();\n        carrito.agregar("Camiseta", 19.99);\n        carrito.vaciar();\n        assertEquals(0, carrito.getCantidad());\n        assertEquals(0.0, carrito.getTotal(), 0.001);',
    },
    {
      name: 'Cada carrito tiene su propio estado',
      code: 'Carrito uno = new Carrito();\n        Carrito otro = new Carrito();\n        uno.agregar("Camiseta", 10);\n        assertEquals(1, uno.getCantidad());\n        assertEquals(0, otro.getCantidad());',
    },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "¿Cuándo un método NO debe ser static?",
      options: ["Cuando devuelve void", "Cuando necesita datos del objeto", "Cuando es público"],
      correct: 1,
      explanation: "Un método static pertenece a la clase, así que no hay objeto cuyos campos consultar.",
    },
    {
      kind: "drag",
      prompt: "Completa el constructor.",
      snippet: "public Paciente(String nombre) {\n    ___.nombre = ___;\n}",
      blanks: ["this", "nombre"],
      pool: ["this", "nombre", "new", "super"],
      explanation: "Cuando el campo y el parámetro se llaman igual, this es lo único que los distingue.",
    },
    {
      kind: "choice",
      prompt: "¿Qué pasa si le pones tipo de retorno al constructor?",
      options: ["Nada, es opcional", "Deja de ser un constructor: pasa a ser un método normal que new no llama", "No compila"],
      correct: 1,
      explanation: "Es un fallo silencioso y desconcertante: el objeto se crea sin inicializar.",
    },
    {
      kind: "fill",
      prompt: "Impide que se toque el campo desde fuera.",
      snippet: "___ int valor = 0;",
      answers: ["private"],
      explanation: "Si el único camino son los métodos, esos métodos garantizan que el estado tenga sentido.",
    },
    {
      kind: "choice",
      prompt: "¿Qué te ahorra un record?",
      options: ["Solo el constructor", "El constructor, los accesores, equals, hashCode y toString", "Nada, es azúcar sintáctico"],
      correct: 1,
      explanation: "Para un objeto que solo lleva datos, una línea sustituye a cuarenta.",
    },
  ],
}
