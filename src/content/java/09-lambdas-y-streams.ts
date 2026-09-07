import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'java-09-lambdas-y-streams',
  language: 'java',
  title: 'Lambdas y streams',
  difficulty: 3,
  concepts: ['lambda', 'Predicate', 'stream', 'filter', 'map', 'collect'],
  theory: `## Lambdas

Una lambda es una función escrita en el sitio donde se usa. La sintaxis es casi la de
TypeScript:

~~~java
nombre -> nombre.length() > 4
(a, b) -> a + b
() -> System.out.println("hola")
~~~

Con una sola expresión, el \`return\` va implícito. Con llaves hay que escribirlo:

~~~java
nombre -> {
    String limpio = nombre.strip();
    return limpio.length() > 4;
}
~~~

## Dónde encaja una lambda

Aquí está la diferencia con TypeScript: en Java una lambda **no es un valor suelto**, es la
implementación de una interfaz con un único método. Las más habituales vienen hechas:

~~~java
Predicate<String> largo = nombre -> nombre.length() > 4;   // devuelve boolean
Function<String, Integer> longitud = String::length;       // transforma
Consumer<String> imprimir = System.out::println;           // no devuelve nada
Supplier<String> generar = () -> "hola";                   // no recibe nada
~~~

## Referencias a método

Cuando la lambda solo llama a un método que ya existe, hay una forma más corta:

~~~java
nombres.stream().map(nombre -> nombre.toUpperCase())   // lambda
nombres.stream().map(String::toUpperCase)              // referencia
~~~

Los dos puntos dobles se leen como *el método toUpperCase de String*.

## Streams

Un stream es una **tubería** sobre una colección. Tres partes, siempre en este orden:

~~~java
List<String> resultado = nombres.stream()          // 1. abrir
        .filter(nombre -> nombre.length() > 4)     // 2. operaciones intermedias
        .map(String::toUpperCase)
        .toList();                                 // 3. cerrar
~~~

Lo importante: **hasta que no se cierra, no se ejecuta nada**. Si te dejas el
\`.toList()\`, el \`filter\` no llega a correr. Desconcierta viniendo de TypeScript, donde
\`filter\` ya te devuelve el array hecho.

## Las operaciones que se usan

~~~java
.filter(p -> p.edad() > 30)      // se queda con los que cumplen
.map(Paciente::nombre)           // transforma cada uno
.sorted()                        // ordena
.distinct()                      // quita repetidos
.limit(3)                        // los tres primeros
~~~

Y para cerrar:

~~~java
.toList()                             // a lista
.count()                              // cuántos
.anyMatch(p -> p.edad() > 60)         // hay alguno
.mapToInt(Paciente::edad).sum()       // suma de enteros
.collect(Collectors.joining(", "))    // unir en un texto
~~~

\`mapToInt\` hace falta porque \`sum()\` y \`average()\` no existen sobre objetos: hay que
pasar al stream de primitivos.

## Cuándo no usar streams

Cuando el bucle se lee mejor. Un \`for\` de tres líneas no mejora convertido en una cadena
de cinco. Los streams brillan al encadenar filtro, transformación y recogida.

## Errores típicos

- Olvidar la operación final y que no pase nada.
- Reutilizar un stream: se consume una vez y ya no vale.
- Modificar la lista original desde dentro de un \`forEach\`.
- Meter tanta lógica en la lambda que se lea peor que el bucle.`,
  brief: `Cuatro métodos estáticos en la clase \`Solucion\`, todos con streams:

1. \`mayoresDe(List<Paciente> pacientes, int edad)\` devuelve los **nombres** de los que
   superan esa edad, en el mismo orden.
2. \`edadMedia(List<Paciente> pacientes)\` devuelve la media de edad, o \`0\` si la lista
   está vacía.
3. \`nombresOrdenados(List<Paciente> pacientes)\` devuelve todos los nombres en mayúsculas
   y ordenados alfabéticamente.
4. \`hayMenores(List<Paciente> pacientes)\` devuelve \`true\` si alguno tiene menos de 18.

El record \`Paciente\` ya está al final del fichero: no hace falta tocarlo.`,
  fileName: 'Solucion.java',
  starterCode: `import java.util.*;
import java.util.stream.*;

public class Solucion {

    public static List<String> mayoresDe(List<Paciente> pacientes, int edad) {
        return List.of();
    }

    public static double edadMedia(List<Paciente> pacientes) {
        return 0;
    }

    public static List<String> nombresOrdenados(List<Paciente> pacientes) {
        return List.of();
    }

    public static boolean hayMenores(List<Paciente> pacientes) {
        return false;
    }
}

record Paciente(String nombre, int edad) {
}
`,
  solution: `import java.util.*;
import java.util.stream.*;

public class Solucion {

    public static List<String> mayoresDe(List<Paciente> pacientes, int edad) {
        return pacientes.stream()
                .filter(paciente -> paciente.edad() > edad)
                .map(Paciente::nombre)
                .toList();
    }

    public static double edadMedia(List<Paciente> pacientes) {
        // average() devuelve un OptionalDouble: una lista vacia no tiene media.
        return pacientes.stream()
                .mapToInt(Paciente::edad)
                .average()
                .orElse(0);
    }

    public static List<String> nombresOrdenados(List<Paciente> pacientes) {
        return pacientes.stream()
                .map(Paciente::nombre)
                .map(String::toUpperCase)
                .sorted()
                .toList();
    }

    public static boolean hayMenores(List<Paciente> pacientes) {
        return pacientes.stream().anyMatch(paciente -> paciente.edad() < 18);
    }
}

record Paciente(String nombre, int edad) {
}
`,
  hints: [
    'La cadena empieza con .stream() y termina con una operación final como .toList().',
    'Los accesores de un record no llevan get: Paciente::nombre, Paciente::edad.',
    'Para la media hay que pasar a enteros: .mapToInt(Paciente::edad).average().orElse(0).',
    'anyMatch devuelve el booleano directamente: no hace falta contar.',
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "¿Qué pasa si te dejas la operación final del stream?",
      options: ["Devuelve la lista sin transformar", "No se ejecuta nada: las operaciones intermedias son perezosas", "Da error de compilación"],
      correct: 1,
      explanation: "Desconcierta viniendo de TypeScript, donde filter ya te devuelve el array hecho.",
    },
    {
      kind: "drag",
      prompt: "Completa la tubería.",
      snippet: "nombres.___()\n    .___(nombre -> nombre.length() > 4)\n    .___(String::toUpperCase)\n    .___();",
      blanks: ["stream", "filter", "map", "toList"],
      pool: ["stream", "filter", "map", "toList", "sorted"],
      explanation: "Abrir, operaciones intermedias y cerrar: siempre en ese orden.",
    },
    {
      kind: "fill",
      prompt: "Suma las edades, que son enteros.",
      snippet: "pacientes.stream().___(Paciente::edad).sum();",
      answers: ["mapToInt"],
      explanation: "sum() y average() no existen sobre objetos: hay que pasar al stream de primitivos.",
    },
    {
      kind: "choice",
      prompt: "¿Qué significa String::toUpperCase?",
      options: ["Una variable llamada toUpperCase", "Una referencia al método toUpperCase de String, en lugar de escribir la lambda", "Una clase anidada"],
      correct: 1,
      explanation: "Es la forma corta de nombre -> nombre.toUpperCase().",
    },
    {
      kind: "choice",
      prompt: "¿Cuándo NO conviene un stream?",
      options: ["Nunca, siempre son mejores", "Cuando el bucle se lee mejor: un for de tres líneas no mejora convertido en cinco", "Cuando la lista es pequeña"],
      correct: 1,
      explanation: "Brillan al encadenar filtro, transformación y recogida; para lo demás, un for está bien.",
    },
  ],
  tests: [
    {
      name: 'mayoresDe devuelve solo los nombres que superan la edad',
      code:
        'List<Paciente> pacientes = List.of(new Paciente("Ana", 34), new Paciente("Luis", 51), new Paciente("Zoe", 12));\n        assertEquals(List.of("Ana", "Luis"), Solucion.mayoresDe(pacientes, 30));',
    },
    {
      name: 'mayoresDe devuelve lista vacia si no hay ninguno',
      code:
        'List<Paciente> pacientes = List.of(new Paciente("Ana", 34), new Paciente("Luis", 51), new Paciente("Zoe", 12));\n        assertEquals(List.of(), Solucion.mayoresDe(pacientes, 90));',
    },
    {
      name: 'edadMedia calcula la media',
      code:
        'List<Paciente> pacientes = List.of(new Paciente("Ana", 34), new Paciente("Luis", 51), new Paciente("Zoe", 12));\n        assertEquals(32.333, Solucion.edadMedia(pacientes), 0.01);',
    },
    {
      name: 'edadMedia devuelve 0 con la lista vacia',
      code:
        'assertEquals(0.0, Solucion.edadMedia(List.of()), 0.001);',
    },
    {
      name: 'nombresOrdenados pone en mayusculas y ordena',
      code:
        'List<Paciente> pacientes = List.of(new Paciente("Ana", 34), new Paciente("Luis", 51), new Paciente("Zoe", 12));\n        assertEquals(List.of("ANA", "LUIS", "ZOE"), Solucion.nombresOrdenados(pacientes));',
    },
    {
      name: 'hayMenores detecta a los menores de 18',
      code:
        'List<Paciente> pacientes = List.of(new Paciente("Ana", 34), new Paciente("Luis", 51), new Paciente("Zoe", 12));\n        assertTrue(Solucion.hayMenores(pacientes));\n        assertFalse(Solucion.hayMenores(List.of(new Paciente("Ana", 34))));',
    },
  ],
}
