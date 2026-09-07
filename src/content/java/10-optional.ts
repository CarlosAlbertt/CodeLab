import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'java-10-optional',
  language: 'java',
  title: 'Optional y el manejo de null',
  difficulty: 3,
  concepts: ['null', 'Optional', 'orElse', 'map', 'NullPointerException'],
  theory: `## El error de los mil millones de dólares

Así llamó a \`null\` quien lo inventó, Tony Hoare, arrepentido. El problema no es que
exista: es que **cualquier variable de tipo objeto puede ser \`null\` sin avisar**.

~~~java
String nombre = buscarNombre(id);
nombre.length();   // NullPointerException si no lo encontró
~~~

La firma dice que devuelve \`String\`. No dice que a veces no devuelva nada. Quien la usa
se entera en producción.

En TypeScript esto lo resuelve el tipo: \`string | undefined\` te obliga a comprobar. En
Java el equivalente es \`Optional\`.

## Optional

Es una caja que puede llevar un valor o estar vacía, y la firma lo dice:

~~~java
public Optional<Paciente> buscar(String nif) {
    Paciente encontrado = mapa.get(nif);
    return Optional.ofNullable(encontrado);
}
~~~

Ahora quien la llama **no puede ignorarlo**: para sacar el valor tiene que decidir qué pasa
si no está.

## Crearlos

~~~java
Optional.of(valor)            // valor que seguro no es null (si lo es, revienta)
Optional.ofNullable(valor)    // puede ser null
Optional.empty()              // vacio
~~~

## Usarlos

~~~java
optional.isPresent()                    // hay algo
optional.orElse("desconocido")          // el valor, o este otro
optional.orElseGet(() -> calcular())    // igual, pero solo lo calcula si hace falta
optional.orElseThrow()                  // el valor, o NoSuchElementException
optional.map(Paciente::nombre)          // transforma si hay algo; si no, sigue vacio
optional.filter(p -> p.edad() > 18)     // lo vacia si no cumple
optional.ifPresent(p -> imprimir(p))    // hace algo solo si hay valor
~~~

Lo elegante es encadenar sin preguntar nunca:

~~~java
return buscar(nif)
        .map(Paciente::nombre)
        .map(String::toUpperCase)
        .orElse("DESCONOCIDO");
~~~

Si no encuentra nada, los \`map\` no se ejecutan y sale el valor por defecto. Sin un solo
\`if\`.

## get() no

\`optional.get()\` devuelve el valor y revienta si está vacío. Es exactamente el problema
que veníamos a evitar, con más letras. Usa \`orElse\`, \`orElseThrow\` o \`map\`.

## Dónde sí y dónde no

- **Sí**: como **tipo de retorno** de un método que puede no encontrar nada.
- **No**: como campo de una clase, como parámetro, ni en colecciones. Para eso, una lista
  vacía ya dice "no hay nada" sin envolver nada.

## Y mientras tanto, con null

No todo el código del mundo devuelve \`Optional\`. Para el resto:

~~~java
Objects.requireNonNull(nombre, "el nombre es obligatorio");   // falla pronto y claro
if (nombre != null && !nombre.isBlank()) { }                  // && cortocircuita
"ok".equals(estado)                                           // no revienta si estado es null
~~~

Fallar pronto es mejor que arrastrar un \`null\` diez métodos hasta que explota lejos de
donde se originó.

## Errores típicos

- Llamar a \`get()\` sin comprobar.
- Devolver \`null\` **en vez** de un \`Optional.empty()\`: lo peor de los dos mundos.
- Usar \`Optional\` como parámetro, obligando a envolver en cada llamada.
- \`Optional.of(algo)\` cuando ese algo puede ser \`null\`.`,
  brief: `Cuatro métodos estáticos en \`Solucion\`. Recibe un \`Map<String, Paciente>\` indexado por NIF.

1. \`buscar(Map<String, Paciente> pacientes, String nif)\` devuelve un \`Optional<Paciente>\`.
2. \`nombreEnMayusculas(Map<String, Paciente> pacientes, String nif)\` devuelve el nombre en
   mayúsculas, o \`"DESCONOCIDO"\` si no está. **Sin usar if**: encadena \`map\` y \`orElse\`.
3. \`edadDeAdulto(Map<String, Paciente> pacientes, String nif)\` devuelve la edad solo si el
   paciente existe y tiene 18 o más; si no, \`0\`.
4. \`exigir(Map<String, Paciente> pacientes, String nif)\` devuelve el paciente, o lanza
   \`IllegalArgumentException\` con el mensaje \`"paciente desconocido"\`.

El record \`Paciente\` ya está al final del fichero.`,
  fileName: 'Solucion.java',
  starterCode: `import java.util.*;

public class Solucion {

    public static Optional<Paciente> buscar(Map<String, Paciente> pacientes, String nif) {
        return Optional.empty();
    }

    public static String nombreEnMayusculas(Map<String, Paciente> pacientes, String nif) {
        return "";
    }

    public static int edadDeAdulto(Map<String, Paciente> pacientes, String nif) {
        return 0;
    }

    public static Paciente exigir(Map<String, Paciente> pacientes, String nif) {
        return null;
    }
}

record Paciente(String nif, String nombre, int edad) {
}
`,
  solution: `import java.util.*;

public class Solucion {

    public static Optional<Paciente> buscar(Map<String, Paciente> pacientes, String nif) {
        // get devuelve null si la clave no esta: ofNullable lo convierte en un vacio.
        return Optional.ofNullable(pacientes.get(nif));
    }

    public static String nombreEnMayusculas(Map<String, Paciente> pacientes, String nif) {
        return buscar(pacientes, nif)
                .map(Paciente::nombre)
                .map(String::toUpperCase)
                .orElse("DESCONOCIDO");
    }

    public static int edadDeAdulto(Map<String, Paciente> pacientes, String nif) {
        return buscar(pacientes, nif)
                .filter(paciente -> paciente.edad() >= 18)
                .map(Paciente::edad)
                .orElse(0);
    }

    public static Paciente exigir(Map<String, Paciente> pacientes, String nif) {
        return buscar(pacientes, nif)
                .orElseThrow(() -> new IllegalArgumentException("paciente desconocido"));
    }
}

record Paciente(String nif, String nombre, int edad) {
}
`,
  hints: [
    'Optional.ofNullable(...) convierte un posible null en un Optional vacío.',
    'map solo se ejecuta si hay valor; si está vacío, se salta y sigue vacío.',
    'filter vacía el Optional cuando la condición no se cumple.',
    'orElseThrow recibe una lambda que crea la excepción: orElseThrow(() -> new ...).',
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "¿Qué problema resuelve Optional?",
      options: ["Hace el código más corto", "Que la firma diga que puede no haber valor, en vez de devolver null en silencio", "Evita usar excepciones"],
      correct: 1,
      explanation: "Con String a secas, quien llama al método no se entera de que a veces no hay nada.",
    },
    {
      kind: "drag",
      prompt: "Encadena sin escribir ningún if.",
      snippet: "return buscar(nif)\n    .___(Paciente::nombre)\n    .___(\"DESCONOCIDO\");",
      blanks: ["map", "orElse"],
      pool: ["map", "orElse", "get", "filter"],
      explanation: "Si está vacío, el map no se ejecuta y sale directamente el valor por defecto.",
    },
    {
      kind: "choice",
      prompt: "¿Por qué se desaconseja optional.get()?",
      options: ["Porque es lento", "Porque revienta si está vacío: es el mismo problema que veníamos a evitar", "Porque está obsoleto"],
      correct: 1,
      explanation: "Para eso están orElse, orElseThrow y map.",
    },
    {
      kind: "fill",
      prompt: "Convierte un valor que puede ser null.",
      snippet: "return Optional.___(mapa.get(nif));",
      answers: ["ofNullable"],
      explanation: "Optional.of reventaría si el valor fuese null.",
    },
    {
      kind: "choice",
      prompt: "¿Dónde conviene usar Optional?",
      options: ["Como campo de una clase", "Como tipo de retorno de un método que puede no encontrar nada", "Como parámetro, para dejar claro que es opcional"],
      correct: 1,
      explanation: "Como parámetro obliga a envolver en cada llamada, y como campo complica sin aportar.",
    },
  ],
  tests: [
    {
      name: 'buscar encuentra al que existe',
      code:
        'Map<String, Paciente> pacientes = Map.of(\n        "1A", new Paciente("1A", "Ana", 34),\n        "2B", new Paciente("2B", "Zoe", 12));\n        assertTrue(Solucion.buscar(pacientes, "1A").isPresent());\n        assertEquals("Ana", Solucion.buscar(pacientes, "1A").get().nombre());',
    },
    {
      name: 'buscar devuelve vacio si no esta',
      code:
        'Map<String, Paciente> pacientes = Map.of(\n        "1A", new Paciente("1A", "Ana", 34),\n        "2B", new Paciente("2B", "Zoe", 12));\n        assertFalse(Solucion.buscar(pacientes, "9Z").isPresent());',
    },
    {
      name: 'nombreEnMayusculas transforma cuando hay valor',
      code:
        'Map<String, Paciente> pacientes = Map.of(\n        "1A", new Paciente("1A", "Ana", 34),\n        "2B", new Paciente("2B", "Zoe", 12));\n        assertEquals("ANA", Solucion.nombreEnMayusculas(pacientes, "1A"));',
    },
    {
      name: 'nombreEnMayusculas devuelve DESCONOCIDO si no esta',
      code:
        'Map<String, Paciente> pacientes = Map.of(\n        "1A", new Paciente("1A", "Ana", 34),\n        "2B", new Paciente("2B", "Zoe", 12));\n        assertEquals("DESCONOCIDO", Solucion.nombreEnMayusculas(pacientes, "9Z"));',
    },
    {
      name: 'edadDeAdulto solo cuenta a los mayores de edad',
      code:
        'Map<String, Paciente> pacientes = Map.of(\n        "1A", new Paciente("1A", "Ana", 34),\n        "2B", new Paciente("2B", "Zoe", 12));\n        assertEquals(34, Solucion.edadDeAdulto(pacientes, "1A"));\n        assertEquals(0, Solucion.edadDeAdulto(pacientes, "2B"));\n        assertEquals(0, Solucion.edadDeAdulto(pacientes, "9Z"));',
    },
    {
      name: 'exigir devuelve el paciente cuando existe',
      code:
        'Map<String, Paciente> pacientes = Map.of(\n        "1A", new Paciente("1A", "Ana", 34),\n        "2B", new Paciente("2B", "Zoe", 12));\n        assertEquals("Ana", Solucion.exigir(pacientes, "1A").nombre());',
    },
    {
      name: 'exigir lanza si no existe',
      code:
        'Map<String, Paciente> pacientes = Map.of(\n        "1A", new Paciente("1A", "Ana", 34),\n        "2B", new Paciente("2B", "Zoe", 12));\n        assertThrows(IllegalArgumentException.class, () -> Solucion.exigir(pacientes, "9Z"));',
    },
  ],
}
