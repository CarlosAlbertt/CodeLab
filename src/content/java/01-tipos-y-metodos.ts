import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'java-01-tipos-y-metodos',
  language: 'java',
  title: 'Tipos, variables y métodos',
  difficulty: 1,
  concepts: ['tipos primitivos', 'String', 'métodos estáticos', 'System.out'],
  theory: `## Java es compilado

En TypeScript el compilador te avisa y luego el navegador ejecuta JavaScript. En Java hay
un paso más: \`javac\` traduce tu código a **bytecode**, y la máquina virtual lo ejecuta.
Si no compila, no hay nada que ejecutar.

Aquí eso se nota: si te dejas un punto y coma, no verás ningún test, solo el error de
compilación con su línea.

## Todo vive dentro de una clase

No hay código suelto: hasta el programa más pequeño es una clase.

~~~java
public class Solucion {

    public static int doble(int n) {
        return n * 2;
    }
}
~~~

En estos ejercicios la clase pública se llama como diga el enunciado, y el fichero tiene que
llamarse igual. Eso no es una manía de Java: es cómo encuentra las clases.

## Leer una firma

\`public static int doble(int n)\`, de izquierda a derecha:

- \`public\` — se puede llamar desde fuera.
- \`static\` — pertenece a la clase, no a un objeto. Se llama \`Solucion.doble(5)\`, sin
  crear nada.
- \`int\` — **lo que devuelve** va delante del nombre, no detrás con dos puntos como en
  TypeScript.
- \`(int n)\` — el tipo también va delante del parámetro.

## Los tipos

Java distingue dos familias:

~~~java
int edad = 34;          // enteros
double precio = 19.99;  // decimales
boolean activo = true;
char inicial = 'A';     // un solo caracter, comillas simples

String nombre = "Ana";  // objeto, comillas dobles
~~~

Los de la primera familia son **primitivos**: se escriben en minúscula y no son objetos.
\`String\` empieza por mayúscula porque sí lo es.

Ojo con las comillas: \`'A'\` es un carácter y \`"A"\` es un texto. No son intercambiables.

## var

~~~java
var nombre = "Ana";   // Java deduce que es String
~~~

Funciona dentro de un método, igual que en TypeScript. En la firma no: ahí los tipos van
siempre escritos.

## Concatenar y mostrar

~~~java
System.out.println("Hola, " + nombre);
~~~

El \`+\` entre un texto y cualquier otra cosa produce texto: \`"Edad: " + 34\` da
\`"Edad: 34"\`. Lo que imprimas con \`println\` aparece en el panel de resultados, en la
sección Consola.

## Errores típicos

- Olvidar el punto y coma.
- Poner el tipo detrás del nombre, como en TypeScript.
- Confundir \`'a'\` con \`"a"\`.
- Comparar textos con \`==\`. En Java eso compara referencias: se usa \`.equals()\`.`,
  brief: `Implementa dos métodos estáticos en la clase \`Solucion\`:

1. \`doble(int n)\` devuelve el número multiplicado por dos.
2. \`ficha(String nombre, int edad)\` devuelve el nombre, un espacio, y la edad entre
   paréntesis: con \`"Ana"\` y \`34\` devuelve \`"Ana (34)"\`.

Los dos son \`public static\`, y su tipo de retorno va delante del nombre.`,
  fileName: 'Solucion.java',
  starterCode: `public class Solucion {

    public static int doble(int n) {
        return 0;
    }

    public static String ficha(String nombre, int edad) {
        return "";
    }
}
`,
  solution: `public class Solucion {

    public static int doble(int n) {
        return n * 2;
    }

    public static String ficha(String nombre, int edad) {
        return nombre + " (" + edad + ")";
    }
}
`,
  hints: [
    'El tipo que devuelve el método va delante de su nombre: public static int doble(...).',
    'Para pegar texto y números se usa +, igual que en TypeScript.',
    'Fíjate en el espacio antes del paréntesis: "Ana" + " (" + 34 + ")".',
  ],
  tests: [
    { name: 'doble multiplica por dos', code: 'assertEquals(10, Solucion.doble(5));' },
    { name: 'doble funciona con cero y negativos', code: 'assertEquals(0, Solucion.doble(0));\n        assertEquals(-6, Solucion.doble(-3));' },
    { name: 'ficha monta el texto pedido', code: 'assertEquals("Ana (34)", Solucion.ficha("Ana", 34));' },
    { name: 'ficha vale para cualquier nombre y edad', code: 'assertEquals("Luis (51)", Solucion.ficha("Luis", 51));' },
  ],
  quiz: [
    {
      kind: "drag",
      prompt: "Completa la firma del método.",
      snippet: "public static ___ doble(___ n) {\n    return n * 2;\n}",
      blanks: ["int", "int"],
      pool: ["int", "String", "void", "double"],
      explanation: "En Java el tipo va delante del nombre, tanto el de retorno como el del parámetro.",
    },
    {
      kind: "choice",
      prompt: "¿Qué diferencia hay entre 'A' y \"A\"?",
      options: ["Ninguna", "El primero es un char y el segundo un String: no son intercambiables", "El primero no compila"],
      correct: 1,
      explanation: "Comillas simples para un solo carácter, dobles para texto.",
    },
    {
      kind: "choice",
      prompt: "¿Cómo se comparan dos textos en Java?",
      options: ["Con ==", "Con .equals()", "Con ==="],
      correct: 1,
      explanation: "== compara si son el mismo objeto. A veces parece funcionar por una optimización, y ahí está la trampa.",
    },
    {
      kind: "fill",
      prompt: "Haz que el método se pueda llamar sin crear ningún objeto.",
      snippet: "public ___ int doble(int n) { return n * 2; }",
      answers: ["static"],
      explanation: "static hace que pertenezca a la clase: se llama Solucion.doble(5).",
    },
    {
      kind: "order",
      prompt: "Ordena la clase más pequeña que existe.",
      lines: ["public class Solucion {", "    public static int doble(int n) {", "        return n * 2;", "    }", "}"],
      explanation: "En Java no hay código suelto: todo vive dentro de una clase.",
    },
  ],
}
