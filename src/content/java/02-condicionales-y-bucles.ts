import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'java-02-condicionales-y-bucles',
  language: 'java',
  title: 'Condicionales y bucles',
  difficulty: 1,
  concepts: ['if', 'else', 'for', 'while', 'equals'],
  theory: `## Casi igual que en TypeScript

La sintaxis del \`if\` y del \`for\` es prácticamente la misma. Lo que cambia son tres
cosas, y las tres dan disgustos al empezar.

## 1. La condición tiene que ser boolean

~~~java
if (lista.size() > 0) { }   // bien
if (lista.size()) { }       // no compila
~~~

En JavaScript un número o una cadena valen como condición. En Java no: o es \`boolean\`, o
es un error de compilación. Es más pesado de escribir y evita bastantes fallos.

## 2. Los textos se comparan con equals

~~~java
String a = "hola";
if (a == "hola") { }        // compara referencias: no te fíes
if (a.equals("hola")) { }   // compara el contenido
~~~

\`==\` funciona bien con primitivos (\`int\`, \`boolean\`), pero con objetos compara si son
**el mismo objeto**, no si valen lo mismo. Con textos, a veces parece que funciona por una
optimización de Java, y ahí está la trampa.

Truco práctico: pon la constante delante, \`"hola".equals(a)\`, y así no revienta aunque
\`a\` sea \`null\`.

## 3. No hay verdadero ni falso a medias

No existe eso de que \`0\` sea falso o \`""\` sea falso. Solo \`true\` y \`false\`.

## Los bucles

~~~java
for (int i = 0; i < 3; i++) {
    System.out.println(i);
}

for (String nombre : nombres) {   // el for-each
    System.out.println(nombre);
}

while (quedan) { }
~~~

El \`for\` clásico es idéntico al de TypeScript, salvo que la variable lleva su tipo. El
\`for (String nombre : nombres)\` es el equivalente a \`for...of\`: se lee *para cada
nombre de nombres*.

## switch moderno

~~~java
String etiqueta = switch (estado) {
    case "ok" -> "Correcto";
    case "error" -> "Fallo";
    default -> "Desconocido";
};
~~~

Con flecha no hace falta \`break\` y no se cuela de un caso al siguiente, que era el error
clásico del \`switch\` de toda la vida.

## Errores típicos

- Comparar textos con \`==\`.
- Usar un \`int\` como condición.
- Declarar el acumulador dentro del bucle.
- Olvidar que el último índice válido es \`length - 1\`.`,
  brief: `Dos métodos estáticos en la clase \`Solucion\`:

1. \`calificacion(int puntos)\` devuelve la palabra que corresponde:
   - menos de \`0\` o más de \`10\` → \`"nota no valida"\`
   - \`9\` o más → \`"sobresaliente"\`
   - \`7\` o más → \`"notable"\`
   - \`5\` o más → \`"aprobado"\`
   - el resto → \`"suspenso"\`

2. \`sumaHasta(int n)\` devuelve la suma de todos los números de \`1\` a \`n\`, o \`0\` si
   \`n\` es menor que \`1\`.`,
  fileName: 'Solucion.java',
  starterCode: `public class Solucion {

    public static String calificacion(int puntos) {
        return "";
    }

    public static int sumaHasta(int n) {
        return 0;
    }
}
`,
  solution: `public class Solucion {

    public static String calificacion(int puntos) {
        if (puntos < 0 || puntos > 10) return "nota no valida";
        if (puntos >= 9) return "sobresaliente";
        if (puntos >= 7) return "notable";
        if (puntos >= 5) return "aprobado";
        return "suspenso";
    }

    public static int sumaHasta(int n) {
        int suma = 0;
        for (int i = 1; i <= n; i++) {
            suma = suma + i;
        }
        return suma;
    }
}
`,
  hints: [
    'Descarta primero lo imposible y luego ve de mayor a menor, como en la pista de TypeScript.',
    'El acumulador se declara antes del for: int suma = 0;',
    'Si n es menor que 1, el bucle no da ninguna vuelta y suma se queda en 0.',
  ],
  tests: [
    { name: 'Un 10 es sobresaliente', code: 'assertEquals("sobresaliente", Solucion.calificacion(10));' },
    { name: 'El 7 justo entra en notable', code: 'assertEquals("notable", Solucion.calificacion(7));' },
    { name: 'Un 5 raspado aprueba', code: 'assertEquals("aprobado", Solucion.calificacion(5));' },
    { name: 'Por debajo de 5 se suspende', code: 'assertEquals("suspenso", Solucion.calificacion(4));' },
    { name: 'Las notas fuera de rango no valen', code: 'assertEquals("nota no valida", Solucion.calificacion(-1));\n        assertEquals("nota no valida", Solucion.calificacion(11));' },
    { name: 'sumaHasta suma del 1 al 4', code: 'assertEquals(10, Solucion.sumaHasta(4));' },
    { name: 'sumaHasta devuelve 0 si no hay nada que sumar', code: 'assertEquals(0, Solucion.sumaHasta(0));\n        assertEquals(0, Solucion.sumaHasta(-5));' },
    { name: 'sumaHasta aguanta un numero grande', code: 'assertEquals(5050, Solucion.sumaHasta(100));' },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "¿Compila esto?",
      snippet: "if (lista.size()) { }",
      options: ["Sí, un número distinto de cero es verdadero", "No: la condición tiene que ser boolean", "Solo si la lista no está vacía"],
      correct: 1,
      explanation: "En Java no hay valores \"casi verdaderos\": o es boolean, o es un error de compilación.",
    },
    {
      kind: "fill",
      prompt: "Compara el contenido de los dos textos.",
      snippet: "if (nombre.___(\"Ana\")) { }",
      answers: ["equals"],
      explanation: "Y si lo escribes al revés, \"Ana\".equals(nombre), no revienta aunque nombre sea null.",
    },
    {
      kind: "drag",
      prompt: "Recorre la lista con un for-each.",
      snippet: "for (___ nombre ___ nombres) {\n    System.out.println(nombre);\n}",
      blanks: ["String", ":"],
      pool: ["String", ":", "of", "var"],
      explanation: "Es el equivalente al for...of de TypeScript, pero con el tipo delante y dos puntos.",
    },
    {
      kind: "choice",
      prompt: "¿Por qué el switch con flecha es más seguro?",
      options: ["Porque es más corto", "Porque no hace falta break y no se cuela de un caso al siguiente", "Porque admite más tipos"],
      correct: 1,
      explanation: "Olvidar un break era el error clásico del switch de toda la vida.",
    },
    {
      kind: "order",
      prompt: "Ordena los tramos de la calificación.",
      lines: ["if (puntos < 0 || puntos > 10) return \"nota no valida\";", "if (puntos >= 9) return \"sobresaliente\";", "if (puntos >= 5) return \"aprobado\";", "return \"suspenso\";"],
      explanation: "Primero lo imposible y después de más exigente a menos, igual que en TypeScript.",
    },
  ],
}
