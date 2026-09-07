import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'java-11-excepciones',
  language: 'java',
  title: 'Excepciones',
  difficulty: 2,
  concepts: ['throw', 'try/catch', 'comprobadas', 'finally'],
  theory: `## Para qué sirven

Un método que devuelve \`-1\` cuando algo va mal obliga a quien lo llama a acordarse de
comprobarlo, y nadie se acuerda siempre. Una **excepción** interrumpe la ejecución y sube
buscando a alguien que sepa qué hacer.

~~~java
public static int dividir(int a, int b) {
    if (b == 0) {
        throw new IllegalArgumentException("no se puede dividir entre cero");
    }
    return a / b;
}
~~~

Después del \`throw\` no se ejecuta nada más de ese método.

## Capturarlas

~~~java
try {
    int resultado = dividir(10, 0);
} catch (IllegalArgumentException e) {
    System.out.println("Fallo: " + e.getMessage());
} finally {
    // esto se ejecuta pase lo que pase
}
~~~

Captura **solo lo que sepas manejar**. Un \`catch (Exception e)\` que se traga todo y sigue
como si nada convierte un fallo ruidoso en un fallo silencioso, que es mucho peor.

## Las dos familias

Es la diferencia que no existe en TypeScript:

- **Comprobadas** (heredan de \`Exception\`): el compilador **obliga** a capturarlas o a
  declararlas con \`throws\`. Son para lo que puede fallar por causas externas:
  \`IOException\` al leer un fichero.
- **No comprobadas** (heredan de \`RuntimeException\`): no obligan a nada. Son para errores
  de programación o de uso: \`IllegalArgumentException\`, \`NullPointerException\`.

~~~java
public static String leer(String ruta) throws IOException {
    return Files.readString(Path.of(ruta));
}
~~~

Ese \`throws\` es Java diciéndote: *esto puede fallar, decide tú qué hacer*.

## Cuál lanzar

- Argumento inválido → \`IllegalArgumentException\`.
- El objeto no está en un estado válido para eso → \`IllegalStateException\`.
- Algo específico de tu dominio → tu propia clase:

~~~java
public class CitaNoDisponibleException extends RuntimeException {

    public CitaNoDisponibleException(String mensaje) {
        super(mensaje);
    }
}
~~~

## try-with-resources

~~~java
try (var lector = Files.newBufferedReader(ruta)) {
    // se cierra solo al salir, aunque salte una excepción
}
~~~

## Errores típicos

- Capturar \`Exception\` y no hacer nada: el fallo desaparece y luego no hay quien lo
  encuentre.
- Usar excepciones para el flujo normal: son para lo excepcional.
- Lanzar \`RuntimeException\` a secas en vez de una que diga qué ha pasado.
- Perder la causa original al relanzar: pásala con \`new MiExcepcion("...", e)\`.`,
  brief: `Dos métodos estáticos en \`Solucion\`:

1. \`dividir(int a, int b)\` devuelve la división entera, pero si \`b\` es \`0\` lanza una
   \`IllegalArgumentException\` con el mensaje \`"no se puede dividir entre cero"\`.
2. \`dividirSeguro(int a, int b)\` llama al anterior y, si salta la excepción, la captura y
   devuelve \`0\` en su lugar.`,
  fileName: 'Solucion.java',
  starterCode: `public class Solucion {

    public static int dividir(int a, int b) {
        return a / b;
    }

    public static int dividirSeguro(int a, int b) {
        return 0;
    }
}
`,
  solution: `public class Solucion {

    public static int dividir(int a, int b) {
        if (b == 0) {
            throw new IllegalArgumentException("no se puede dividir entre cero");
        }
        return a / b;
    }

    public static int dividirSeguro(int a, int b) {
        try {
            return dividir(a, b);
        } catch (IllegalArgumentException e) {
            return 0;
        }
    }
}
`,
  hints: [
    'Comprueba el caso malo al principio y lanza con throw new IllegalArgumentException("...").',
    'El mensaje tiene que ser exactamente el que pide el enunciado.',
    'dividirSeguro no repite la comprobación: llama a dividir dentro de un try y captura.',
  ],
  tests: [
    { name: 'Divide bien cuando se puede', code: 'assertEquals(5, Solucion.dividir(10, 2));' },
    {
      name: 'Lanza IllegalArgumentException al dividir entre cero',
      code: 'assertThrows(IllegalArgumentException.class, () -> Solucion.dividir(10, 0));',
    },
    {
      name: 'El mensaje explica lo que ha pasado',
      code: 'String mensaje = "";\n        try {\n            Solucion.dividir(1, 0);\n        } catch (IllegalArgumentException e) {\n            mensaje = e.getMessage();\n        }\n        assertEquals("no se puede dividir entre cero", mensaje);',
    },
    { name: 'dividirSeguro devuelve el resultado normal', code: 'assertEquals(4, Solucion.dividirSeguro(8, 2));' },
    { name: 'dividirSeguro devuelve 0 en vez de estallar', code: 'assertEquals(0, Solucion.dividirSeguro(8, 0));' },
  ],
  quiz: [
    {
      kind: "drag",
      prompt: "Lanza el error con un mensaje que explique qué pasa.",
      snippet: "if (b == 0) {\n    ___ new ___(\"no se puede dividir entre cero\");\n}",
      blanks: ["throw", "IllegalArgumentException"],
      pool: ["throw", "IllegalArgumentException", "throws", "RuntimeException"],
      explanation: "throw lanza; throws se pone en la firma. Y conviene una excepción que diga qué ha fallado.",
    },
    {
      kind: "choice",
      prompt: "¿Qué obliga a hacer una excepción comprobada?",
      options: ["Nada, es igual que las demás", "Capturarla o declararla con throws: el compilador no te deja ignorarla", "Reiniciar el programa"],
      correct: 1,
      explanation: "Son para lo que puede fallar por causas externas, como leer un fichero.",
    },
    {
      kind: "choice",
      prompt: "¿Por qué es mala idea un catch (Exception e) vacío?",
      options: ["Porque es lento", "Porque convierte un fallo ruidoso en uno silencioso, que es mucho peor", "Porque no compila"],
      correct: 1,
      explanation: "Captura solo lo que sepas manejar; lo demás, que suba.",
    },
    {
      kind: "fill",
      prompt: "Este bloque se ejecuta pase lo que pase.",
      snippet: "try { } catch (Exception e) { } ___ { }",
      answers: ["finally"],
      explanation: "Se usaba para cerrar recursos; hoy suele bastar con try-with-resources.",
    },
    {
      kind: "order",
      prompt: "Ordena el método que captura el fallo.",
      lines: ["try {", "    return dividir(a, b);", "} catch (IllegalArgumentException e) {", "    return 0;", "}"],
      explanation: "La llamada que puede fallar va dentro del try; si no, el catch no llega a verla.",
    },
  ],
}
