import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'java-08-equals-y-orden',
  language: 'java',
  title: 'equals, hashCode y ordenación',
  difficulty: 3,
  concepts: ['equals', 'hashCode', 'Comparable', 'Comparator', 'sort'],
  theory: `## Qué significa "igual"

Por defecto, dos objetos distintos **nunca** son iguales aunque lleven los mismos datos:

~~~java
Paciente a = new Paciente("12345678Z", "Ana");
Paciente b = new Paciente("12345678Z", "Ana");

a == b;         // false: son dos objetos
a.equals(b);    // false también, si no lo implementas
~~~

El \`equals\` heredado de \`Object\` compara referencias. Para que dos pacientes con el
mismo NIF cuenten como el mismo, hay que decirlo:

~~~java
@Override
public boolean equals(Object otro) {
    if (this == otro) return true;
    if (!(otro instanceof Paciente)) return false;
    return nif.equals(((Paciente) otro).nif);
}
~~~

## Y siempre hashCode con él

Esta es la regla que más se salta, y la que más problemas raros causa:

> Si dos objetos son \`equals\`, **tienen que** devolver el mismo \`hashCode\`.

\`HashMap\` y \`HashSet\` buscan primero por el hash y solo después comparan con
\`equals\`. Si implementas uno sin el otro, metes un paciente en un \`HashSet\`, preguntas
si está y te dice que no, aunque esté ahí. No falla: miente.

~~~java
@Override
public int hashCode() {
    return Objects.hash(nif);
}
~~~

\`Objects.hash(...)\` los combina por ti. Usa **los mismos campos** que en \`equals\`, ni
uno más.

Un \`record\` te da los dos escritos y correctos. Esa es otra razón para usarlos.

## Ordenar: Comparable

Cuando el tipo tiene un orden natural, lo declara él mismo:

~~~java
class Paciente implements Comparable<Paciente> {

    @Override
    public int compareTo(Paciente otro) {
        return nombre.compareTo(otro.nombre);
    }
}
~~~

\`compareTo\` devuelve un número: **negativo** si este va antes, **cero** si empatan,
**positivo** si va después. No devuelve un booleano, y esa es la confusión típica.

Con eso, \`Collections.sort(lista)\` ya funciona.

## Ordenar: Comparator

Cuando el orden depende del momento, se pasa aparte:

~~~java
lista.sort(Comparator.comparing(Paciente::getNombre));
lista.sort(Comparator.comparingInt(Paciente::getEdad).reversed());

lista.sort(Comparator.comparing(Paciente::getCiudad)
        .thenComparing(Paciente::getNombre));
~~~

\`thenComparing\` es el desempate, igual que la segunda columna de un \`ORDER BY\`.

Para números **no restes** (\`a.getEdad() - b.getEdad()\`): con valores grandes se desborda
y el orden sale mal. Usa \`comparingInt\` o \`Integer.compare\`.

## Errores típicos

- Implementar \`equals\` y olvidar \`hashCode\`.
- Escribir \`equals(Paciente otro)\`: eso no sobrescribe nada, el parámetro tiene que ser
  \`Object\`.
- Usar en \`hashCode\` un campo que cambia, y perder el objeto dentro del \`HashMap\`.
- Devolver \`true\` o \`false\` desde \`compareTo\`.`,
  brief: `En el fichero \`Paciente.java\`, una clase **pública** \`Paciente\`:

1. Constructor \`Paciente(String nif, String nombre, int edad)\`, con los tres campos
   privados y sus getters \`getNif()\`, \`getNombre()\` y \`getEdad()\`.

2. \`equals\` y \`hashCode\` basados **solo en el nif**: dos pacientes con el mismo nif son
   el mismo, aunque cambie el nombre.

3. Que implemente \`Comparable<Paciente>\`, ordenando **por nombre alfabéticamente**.

4. Un método estático \`porEdadDescendente(List<Paciente> pacientes)\` que devuelva una
   lista nueva ordenada de mayor a menor edad, sin tocar la que recibe.`,
  fileName: 'Paciente.java',
  starterCode: `import java.util.*;

public class Paciente implements Comparable<Paciente> {

    // campos, constructor y getters

    @Override
    public int compareTo(Paciente otro) {
        return 0;
    }

    public static List<Paciente> porEdadDescendente(List<Paciente> pacientes) {
        return new ArrayList<>();
    }
}
`,
  solution: `import java.util.*;

public class Paciente implements Comparable<Paciente> {

    private final String nif;
    private final String nombre;
    private final int edad;

    public Paciente(String nif, String nombre, int edad) {
        this.nif = nif;
        this.nombre = nombre;
        this.edad = edad;
    }

    public String getNif() {
        return nif;
    }

    public String getNombre() {
        return nombre;
    }

    public int getEdad() {
        return edad;
    }

    /** La identidad de un paciente es su NIF: el nombre puede corregirse. */
    @Override
    public boolean equals(Object otro) {
        if (this == otro) {
            return true;
        }
        if (!(otro instanceof Paciente)) {
            return false;
        }
        return nif.equals(((Paciente) otro).nif);
    }

    @Override
    public int hashCode() {
        return Objects.hash(nif);
    }

    @Override
    public int compareTo(Paciente otro) {
        return nombre.compareTo(otro.nombre);
    }

    public static List<Paciente> porEdadDescendente(List<Paciente> pacientes) {
        List<Paciente> ordenados = new ArrayList<>(pacientes);
        ordenados.sort(Comparator.comparingInt(Paciente::getEdad).reversed());
        return ordenados;
    }
}
`,
  hints: [
    'El parámetro de equals tiene que ser Object; si no, no sobrescribe nada.',
    'hashCode debe usar exactamente los mismos campos que equals: Objects.hash(nif).',
    'compareTo devuelve un número, no un booleano. Para textos, nombre.compareTo(otro.nombre) ya lo hace.',
    'Copia la lista antes de ordenar: la que llega puede ser inmutable.',
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "Implementas equals pero no hashCode. ¿Qué pasa?",
      options: ["Nada", "Que un HashSet puede decirte que un objeto no está aunque esté: no falla, miente", "Que no compila"],
      correct: 1,
      explanation: "Las colecciones con hash buscan primero por el hash y solo después comparan con equals.",
    },
    {
      kind: "choice",
      prompt: "¿Cuál es la firma correcta de equals?",
      options: ["public boolean equals(Paciente otro)", "public boolean equals(Object otro)", "public boolean equals(Object otro, boolean estricto)"],
      correct: 1,
      explanation: "Con Paciente no sobrescribes nada: creas un método nuevo que las colecciones no llaman.",
    },
    {
      kind: "fill",
      prompt: "Combina los campos para el hash.",
      snippet: "return Objects.___(nif);",
      answers: ["hash"],
      explanation: "Y usando exactamente los mismos campos que en equals, ni uno más.",
    },
    {
      kind: "choice",
      prompt: "¿Qué devuelve compareTo?",
      options: ["true o false", "Un número: negativo, cero o positivo", "El objeto mayor"],
      correct: 1,
      explanation: "Negativo si este va antes, cero si empatan, positivo si va después.",
    },
    {
      kind: "drag",
      prompt: "Ordena por ciudad y desempata por nombre.",
      snippet: "lista.sort(Comparator.___(Paciente::getCiudad)\n        .___(Paciente::getNombre));",
      blanks: ["comparing", "thenComparing"],
      pool: ["comparing", "thenComparing", "reversed", "sorted"],
      explanation: "thenComparing es el desempate, igual que la segunda columna de un ORDER BY.",
    },
  ],
  tests: [
    {
      name: 'Dos pacientes con el mismo nif son iguales',
      code:
        'Paciente a = new Paciente("12345678Z", "Ana", 34);\n        Paciente b = new Paciente("12345678Z", "Ana Maria", 34);\n        assertTrue(a.equals(b));',
    },
    {
      name: 'Con nif distinto no son iguales',
      code:
        'assertFalse(new Paciente("1A", "Ana", 34).equals(new Paciente("2B", "Ana", 34)));',
    },
    {
      name: 'hashCode acompana a equals',
      code:
        'Paciente a = new Paciente("12345678Z", "Ana", 34);\n        Paciente b = new Paciente("12345678Z", "Otra", 50);\n        assertEquals(a.hashCode(), b.hashCode());',
    },
    {
      name: 'Funciona dentro de un HashSet',
      code:
        'Set<Paciente> conjunto = new HashSet<>();\n        conjunto.add(new Paciente("12345678Z", "Ana", 34));\n        assertTrue(conjunto.contains(new Paciente("12345678Z", "Otra", 50)));\n        assertEquals(1, conjunto.size());',
    },
    {
      name: 'El orden natural es por nombre',
      code:
        'List<Paciente> lista = new ArrayList<>(List.of(\n            new Paciente("3", "Zoe", 28), new Paciente("1", "Ana", 34), new Paciente("2", "Luis", 51)));\n        Collections.sort(lista);\n        assertEquals("Ana", lista.get(0).getNombre());\n        assertEquals("Zoe", lista.get(2).getNombre());',
    },
    {
      name: 'porEdadDescendente ordena de mayor a menor',
      code:
        'List<Paciente> lista = List.of(\n            new Paciente("1", "Ana", 34), new Paciente("2", "Luis", 51), new Paciente("3", "Zoe", 28));\n        List<Paciente> ordenados = Paciente.porEdadDescendente(lista);\n        assertEquals(51, ordenados.get(0).getEdad());\n        assertEquals(28, ordenados.get(2).getEdad());',
    },
    {
      name: 'porEdadDescendente no toca la lista original',
      code:
        'List<Paciente> lista = List.of(\n            new Paciente("1", "Ana", 34), new Paciente("2", "Luis", 51));\n        Paciente.porEdadDescendente(lista);\n        assertEquals(34, lista.get(0).getEdad());',
    },
  ],
}
