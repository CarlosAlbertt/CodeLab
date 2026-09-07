import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'java-07-colecciones',
  language: 'java',
  title: 'Colecciones: List y Map',
  difficulty: 2,
  concepts: ['List', 'ArrayList', 'Map', 'HashMap', 'genéricos', 'streams'],
  theory: `## Listas

El array de toda la vida (\`int[]\`) tiene tamaño fijo. Lo que se usa en la práctica es
\`List\`:

~~~java
List<String> nombres = new ArrayList<>();
nombres.add("Ana");
nombres.add("Luis");

nombres.size();       // 2
nombres.get(0);       // "Ana"
nombres.contains("Ana");
~~~

Fíjate en el patrón: **la variable se declara con la interfaz (\`List\`) y se crea con la
implementación (\`ArrayList\`)**. Así, el día que quieras otra implementación, cambias una
palabra.

Los \`<>\` son los genéricos, iguales que en TypeScript. \`List<String>\` es una lista de
textos, y el compilador no te deja meter otra cosa. El \`<>\` vacío de la derecha se llama
diamante: Java deduce el tipo.

## Listas inmutables

~~~java
List<String> fijos = List.of("Ana", "Luis");
~~~

Corto y práctico para datos que no cambian. Ojo: no admite \`add\`, revienta en ejecución.

## Mapas

Pares de clave y valor, como un objeto de TypeScript pero con tipos en las dos partes:

~~~java
Map<String, Integer> edades = new HashMap<>();
edades.put("Ana", 34);

edades.get("Ana");                  // 34
edades.get("Zoe");                  // null, no existe
edades.getOrDefault("Zoe", 0);      // 0
edades.containsKey("Ana");
~~~

\`getOrDefault\` evita el \`null\` en el caso más común. Y para acumular:

~~~java
conteo.put(clave, conteo.getOrDefault(clave, 0) + 1);
~~~

Ese es **el** patrón para contar cosas en Java.

## Recorrer

~~~java
for (String nombre : nombres) { }

for (Map.Entry<String, Integer> entrada : edades.entrySet()) {
    entrada.getKey();
    entrada.getValue();
}
~~~

## Streams

El equivalente a \`filter\` y \`map\` de TypeScript:

~~~java
List<String> largos = nombres.stream()
        .filter(nombre -> nombre.length() > 4)
        .toList();

int total = precios.stream().mapToInt(Integer::intValue).sum();
~~~

Se lee igual, con dos diferencias: hay que abrir con \`.stream()\` y cerrar con
\`.toList()\` o \`.collect(...)\`, porque hasta entonces no se ha ejecutado nada.

## Errores típicos

- Declarar \`ArrayList<String> lista\` en vez de \`List<String> lista\`.
- Llamar a \`add\` sobre una lista creada con \`List.of\`.
- Olvidar que \`get\` de un \`Map\` devuelve \`null\` cuando la clave no está.
- Modificar una lista mientras la recorres con un for-each: lanza excepción.`,
  brief: `Dos métodos estáticos en la clase \`Solucion\`:

1. \`nombresLargos(List<String> nombres)\` devuelve una lista **nueva** con los nombres de
   más de 4 letras, en el mismo orden. Ojo: "Alba" tiene 4, así que no entra.
2. \`contarPorInicial(List<String> nombres)\` devuelve un \`Map\` donde la clave es la
   primera letra de cada nombre (como \`String\`) y el valor, cuántos empiezan por ella.

Con \`["Ana", "Alba", "Luis"]\`, el mapa es \`{"A": 2, "L": 1}\`.`,
  fileName: 'Solucion.java',
  starterCode: `import java.util.*;

public class Solucion {

    public static List<String> nombresLargos(List<String> nombres) {
        return new ArrayList<>();
    }

    public static Map<String, Integer> contarPorInicial(List<String> nombres) {
        return new HashMap<>();
    }
}
`,
  solution: `import java.util.*;

public class Solucion {

    public static List<String> nombresLargos(List<String> nombres) {
        List<String> largos = new ArrayList<>();
        for (String nombre : nombres) {
            if (nombre.length() > 4) {
                largos.add(nombre);
            }
        }
        return largos;
    }

    public static Map<String, Integer> contarPorInicial(List<String> nombres) {
        Map<String, Integer> conteo = new HashMap<>();
        for (String nombre : nombres) {
            String inicial = nombre.substring(0, 1);
            conteo.put(inicial, conteo.getOrDefault(inicial, 0) + 1);
        }
        return conteo;
    }
}
`,
  hints: [
    'La lista acumuladora se crea antes del bucle: List<String> largos = new ArrayList<>();',
    'La inicial de un nombre es nombre.substring(0, 1).',
    'Para contar: conteo.put(clave, conteo.getOrDefault(clave, 0) + 1);',
    'Si prefieres, nombresLargos también se puede hacer con streams y .toList().',
  ],
  tests: [
    {
      name: 'nombresLargos se queda con los de mas de 4 letras',
      code: 'assertEquals(List.of("Nuria", "Rodrigo"), Solucion.nombresLargos(List.of("Ana", "Alba", "Nuria", "Zoe", "Rodrigo")));',
    },
    {
      name: 'nombresLargos devuelve lista vacia si no hay ninguno',
      code: 'assertEquals(List.of(), Solucion.nombresLargos(List.of("Ana", "Zoe")));',
    },
    {
      name: 'contarPorInicial agrupa por la primera letra',
      code: 'Map<String, Integer> conteo = Solucion.contarPorInicial(List.of("Ana", "Alba", "Luis"));\n        assertEquals(2, (int) conteo.get("A"));\n        assertEquals(1, (int) conteo.get("L"));',
    },
    {
      name: 'contarPorInicial no inventa claves',
      code: 'Map<String, Integer> conteo = Solucion.contarPorInicial(List.of("Ana"));\n        assertEquals(1, conteo.size());\n        assertNull(conteo.get("Z"));',
    },
  ],
  quiz: [
    {
      kind: "drag",
      prompt: "Declara con la interfaz y crea con la implementación.",
      snippet: "___<String> nombres = new ___<>();",
      blanks: ["List", "ArrayList"],
      pool: ["List", "ArrayList", "Map", "HashMap"],
      explanation: "Así, el día que quieras otra implementación, cambias una sola palabra.",
    },
    {
      kind: "fill",
      prompt: "Evita el null cuando la clave no existe.",
      snippet: "int veces = conteo.___(\"Ana\", 0);",
      answers: ["getOrDefault"],
      explanation: "get devolvería null, y al desempaquetarlo a int reventaría.",
    },
    {
      kind: "choice",
      prompt: "¿Qué pasa al hacer add sobre una lista creada con List.of?",
      options: ["Se añade sin problema", "Lanza una excepción en ejecución: es inmutable", "No compila"],
      correct: 1,
      explanation: "Va muy bien para datos fijos, pero no sirve como acumulador.",
    },
    {
      kind: "drag",
      prompt: "El patrón para contar cosas en Java.",
      snippet: "conteo.___(clave, conteo.getOrDefault(clave, 0) ___ 1);",
      blanks: ["put", "+"],
      pool: ["put", "+", "get", "-"],
      explanation: "Se lee el valor actual (o cero si no estaba) y se vuelve a guardar sumado.",
    },
    {
      kind: "order",
      prompt: "Ordena la cadena de streams.",
      lines: ["List<String> largos = nombres.stream()", "        .filter(nombre -> nombre.length() > 4)", "        .toList();"],
      explanation: "Se abre con .stream() y se cierra con .toList(): hasta entonces no se ejecuta nada.",
    },
  ],
}
