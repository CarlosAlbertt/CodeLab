import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'java-06-enums-y-records',
  language: 'java',
  title: 'Enums y records',
  difficulty: 2,
  concepts: ['enum', 'record', 'switch', 'inmutabilidad'],
  theory: `## El problema de los textos sueltos

~~~java
cita.estado = "confirmada";
cita.estado = "confirmda";   // nadie te avisa
~~~

Un \`String\` admite cualquier cosa. Un **enum** es un tipo con una lista cerrada de
valores, y el compilador se encarga del resto:

~~~java
public enum EstadoCita {
    PENDIENTE, CONFIRMADA, CANCELADA
}

EstadoCita estado = EstadoCita.CONFIRMADA;
~~~

Es el equivalente a los tipos literales de TypeScript (\`'ok' | 'error'\`), pero aquí el
enum existe también en ejecución y trae cosas hechas:

~~~java
estado.name();                       // "CONFIRMADA"
EstadoCita.valueOf("PENDIENTE");     // el valor a partir del texto
EstadoCita.values();                 // todos, en orden
estado.ordinal();                    // su posición
~~~

## switch sobre un enum

~~~java
String texto = switch (estado) {
    case PENDIENTE -> "por confirmar";
    case CONFIRMADA -> "lista";
    case CANCELADA -> "anulada";
};
~~~

Sin \`default\`: si mañana añades un valor al enum, **el compilador te obliga** a decidir
qué hacer con él. Con \`String\` no te enterarías hasta que un usuario se quejara.

## Enums con datos

Un enum es una clase, así que puede llevar campos y métodos:

~~~java
public enum Prioridad {

    BAJA(1), MEDIA(5), ALTA(10);

    private final int peso;

    Prioridad(int peso) {
        this.peso = peso;
    }

    public int getPeso() {
        return peso;
    }
}
~~~

El punto y coma después del último valor es obligatorio cuando hay más cosas debajo.

## Records

Para un objeto que solo transporta datos:

~~~java
public record Cita(String paciente, int minutos, EstadoCita estado) {
}
~~~

Esa línea genera el constructor, los accesores (\`cita.paciente()\`, **sin \`get\`**),
\`equals\`, \`hashCode\` y \`toString\`. Escribirlo a mano son unas cuarenta líneas que
además hay que mantener.

Un record es **inmutable**: sus campos son finales. Para "cambiar" uno se crea otro:

~~~java
Cita cancelada = new Cita(cita.paciente(), cita.minutos(), EstadoCita.CANCELADA);
~~~

Parece incómodo y suele salir a cuenta: un objeto que no cambia no puede quedarse a medias
ni sorprenderte desde otro hilo.

## Validar en el constructor compacto

~~~java
public record Cita(String paciente, int minutos) {

    public Cita {
        if (minutos <= 0) {
            throw new IllegalArgumentException("duracion invalida");
        }
    }
}
~~~

Sin paréntesis ni asignaciones: se ejecuta antes de guardar los campos. Así no existe
ninguna \`Cita\` inválida en todo el programa.

## Cuándo no usar un record

Cuando el objeto tenga que cambiar de estado o esconder cómo guarda las cosas. Un record es
transparente por diseño: sus datos son públicos a través de los accesores.

## Errores típicos

- Llamar \`getPaciente()\` a un record: el accesor se llama \`paciente()\`.
- Poner \`default\` en un \`switch\` sobre un enum y perder el aviso del compilador cuando
  se añada un valor.
- Intentar modificar un record.
- Comparar enums con \`equals\` en vez de \`==\`. Con enums, \`==\` es correcto y además es
  seguro frente a \`null\`.`,
  brief: `En el fichero \`Prioridad.java\`:

1. Un \`enum\` **público** \`Prioridad\` con tres valores: \`BAJA\`, \`MEDIA\` y \`ALTA\`,
   cada uno con un peso (\`1\`, \`5\` y \`10\`) accesible con \`getPeso()\`.

2. Un \`record\` \`Tarea\` (sin \`public\`) con los componentes \`titulo\` (String) y
   \`prioridad\` (Prioridad). En su constructor compacto, si el título está en blanco lanza
   \`IllegalArgumentException\` con el mensaje \`"titulo vacio"\`.

3. En el record, un método \`urgente()\` que devuelva \`true\` solo si la prioridad es
   \`ALTA\`.`,
  fileName: 'Prioridad.java',
  starterCode: `public enum Prioridad {

    // BAJA, MEDIA y ALTA, con su peso
}

record Tarea(String titulo, Prioridad prioridad) {
}
`,
  solution: `public enum Prioridad {

    BAJA(1), MEDIA(5), ALTA(10);

    private final int peso;

    Prioridad(int peso) {
        this.peso = peso;
    }

    public int getPeso() {
        return peso;
    }
}

record Tarea(String titulo, Prioridad prioridad) {

    /** Constructor compacto: valida antes de guardar los campos. */
    Tarea {
        if (titulo == null || titulo.isBlank()) {
            throw new IllegalArgumentException("titulo vacio");
        }
    }

    boolean urgente() {
        return prioridad == Prioridad.ALTA;
    }
}
`,
  hints: [
    'Los valores del enum van primero y terminan en punto y coma si debajo hay más cosas.',
    'El constructor del enum recibe el peso y lo guarda en un campo private final.',
    'El constructor compacto de un record se escribe sin paréntesis: Tarea { ... }',
    'Los enums se comparan con ==, no con equals.',
  ],
  tests: [
    { name: 'Cada prioridad tiene su peso', code: 'assertEquals(1, Prioridad.BAJA.getPeso());\n        assertEquals(5, Prioridad.MEDIA.getPeso());\n        assertEquals(10, Prioridad.ALTA.getPeso());' },
    { name: 'El enum trae name y valueOf hechos', code: 'assertEquals("ALTA", Prioridad.ALTA.name());\n        assertEquals(Prioridad.BAJA, Prioridad.valueOf("BAJA"));\n        assertEquals(3, Prioridad.values().length);' },
    { name: 'El record da acceso a sus componentes', code: 'Tarea tarea = new Tarea("Revisar analitica", Prioridad.MEDIA);\n        assertEquals("Revisar analitica", tarea.titulo());\n        assertEquals(Prioridad.MEDIA, tarea.prioridad());' },
    { name: 'urgente solo es cierto con prioridad ALTA', code: 'assertTrue(new Tarea("Urgencia", Prioridad.ALTA).urgente());\n        assertFalse(new Tarea("Rutina", Prioridad.BAJA).urgente());' },
    { name: 'Rechaza un titulo en blanco', code: 'assertThrows(IllegalArgumentException.class, () -> new Tarea("   ", Prioridad.BAJA));' },
    { name: 'Dos records con los mismos datos son iguales', code: 'assertEquals(new Tarea("Revisar", Prioridad.ALTA), new Tarea("Revisar", Prioridad.ALTA));' },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "¿Qué ganas usando un enum en vez de un String para el estado?",
      options: ["Ocupa menos memoria", "El compilador impide valores que no existen, y avisa si añades uno nuevo al switch", "Se escribe menos"],
      correct: 1,
      explanation: "Con String, una errata como \"confirmda\" no la detecta nadie hasta que falla.",
    },
    {
      kind: "drag",
      prompt: "Declara el enum con su dato asociado.",
      snippet: "public ___ Prioridad {\n    BAJA(1), ALTA(10)___\n    private final int peso;\n}",
      blanks: ["enum", ";"],
      pool: ["enum", ";", "class", ","],
      explanation: "El punto y coma tras el último valor es obligatorio cuando debajo hay más cosas.",
    },
    {
      kind: "choice",
      prompt: "¿Cómo se llama el accesor de un record con el componente titulo?",
      options: ["getTitulo()", "titulo()", "get(\"titulo\")"],
      correct: 1,
      explanation: "Los records no siguen la convención get: el accesor se llama como el componente.",
    },
    {
      kind: "fill",
      prompt: "Valida antes de guardar los campos, con el constructor compacto.",
      snippet: "record Tarea(String titulo) {\n    ___ {\n        if (titulo.isBlank()) throw new IllegalArgumentException(\"titulo vacio\");\n    }\n}",
      answers: ["Tarea"],
      explanation: "Se escribe sin paréntesis y se ejecuta antes de asignar: así no existe ninguna Tarea inválida.",
    },
    {
      kind: "choice",
      prompt: "¿Cómo se comparan dos enums?",
      options: ["Con equals", "Con ==, que además es seguro frente a null", "Con compareTo"],
      correct: 1,
      explanation: "Cada valor del enum es una única instancia, así que == es correcto.",
    },
  ],
}
