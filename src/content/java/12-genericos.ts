import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'java-12-genericos',
  language: 'java',
  title: 'Genéricos propios',
  difficulty: 3,
  concepts: ['<T>', 'clases genéricas', 'extends', 'comodines', 'borrado'],
  theory: `## Ya los has usado

\`List<String>\` es una clase genérica: \`List\` funciona para cualquier tipo, y las \`<>\`
dicen cuál en esta ocasión. Ahora toca escribir las tuyas.

## Un método genérico

~~~java
public static <T> T primero(List<T> items) {
    return items.isEmpty() ? null : items.get(0);
}
~~~

El \`<T>\` **antes del tipo de retorno** declara el parámetro de tipo. Java lo deduce en
cada llamada: \`primero(nombres)\` con una \`List<String>\` devuelve \`String\`.

Esa es la diferencia con \`Object\`: con \`Object\` habría que hacer un casting en cada
llamada y podría fallar en ejecución. Con genéricos, el compilador lo sabe.

## Una clase genérica

~~~java
public class Caja<T> {

    private final List<T> elementos = new ArrayList<>();

    public void meter(T elemento) {
        elementos.add(elemento);
    }

    public T sacar(int posicion) {
        return elementos.get(posicion);
    }

    public int tamano() {
        return elementos.size();
    }
}
~~~

~~~java
Caja<String> caja = new Caja<>();
caja.meter("Ana");
String nombre = caja.sacar(0);   // sin casting
~~~

El \`<T>\` va detrás del nombre de la clase y vale para toda ella.

## Restringir con extends

Si dentro necesitas llamar a algún método del tipo, hay que exigirlo:

~~~java
public static <T extends Comparable<T>> T maximo(List<T> items) {
    T mayor = items.get(0);
    for (T item : items) {
        if (item.compareTo(mayor) > 0) {
            mayor = item;
        }
    }
    return mayor;
}
~~~

\`T extends Comparable<T>\` se lee: *cualquier tipo que se sepa comparar consigo mismo*. Sin
eso, \`compareTo\` no compila, porque un \`T\` cualquiera no lo tiene.

Ojo: en genéricos siempre es \`extends\`, aunque sea una interfaz.

## Comodines

~~~java
void imprimir(List<?> lista)                       // de lo que sea
double sumar(List<? extends Number> numeros)       // Number o subclases
void meterEnteros(List<? super Integer> destino)   // Integer o superclases
~~~

Regla práctica: \`? extends\` cuando **lees** de la colección, \`? super\` cuando
**escribes** en ella. Con \`? extends\` no puedes añadir, porque no sabes cuál de los
subtipos es.

## El borrado de tipos

Aquí Java se diferencia de verdad: los genéricos **solo existen al compilar**. En ejecución
una \`List<String>\` es una \`List\` a secas. Consecuencias que se notan:

- No se puede hacer \`new T()\` ni \`new T[10]\`.
- \`lista instanceof List<String>\` no compila: esa información ya no está.
- Dos métodos que solo se diferencien en el genérico chocan entre sí.

## Errores típicos

- Olvidar el \`<T>\` antes del tipo de retorno en un método genérico.
- Usar \`Object\` y llenarlo todo de castings.
- Intentar crear un array de un tipo genérico.
- Esperar saber en ejecución qué tipo llevaba la lista.`,
  brief: `En el fichero \`Caja.java\`:

1. Una clase **pública genérica** \`Caja<T>\` con:
   - \`meter(T elemento)\`
   - \`sacar(int posicion)\`, que devuelve un \`T\`
   - \`tamano()\`
   - \`vacia()\`, que devuelve \`true\` si no hay nada.

2. Un método **estático genérico** \`maximo\` que reciba una \`List\` de elementos
   comparables y devuelva el mayor. Con la lista vacía devuelve \`null\`.
   Ponlo dentro de \`Caja\`, como método estático.`,
  fileName: 'Caja.java',
  starterCode: `import java.util.*;

public class Caja<T> {

    // Guarda los elementos aqui

    public void meter(T elemento) {
    }

    public T sacar(int posicion) {
        return null;
    }

    public int tamano() {
        return 0;
    }

    public boolean vacia() {
        return true;
    }

    // El metodo estatico generico maximo
}
`,
  solution: `import java.util.*;

public class Caja<T> {

    private final List<T> elementos = new ArrayList<>();

    public void meter(T elemento) {
        elementos.add(elemento);
    }

    public T sacar(int posicion) {
        return elementos.get(posicion);
    }

    public int tamano() {
        return elementos.size();
    }

    public boolean vacia() {
        return elementos.isEmpty();
    }

    /** El tipo tiene que saber compararse consigo mismo, o compareTo no compila. */
    public static <E extends Comparable<E>> E maximo(List<E> items) {
        if (items.isEmpty()) {
            return null;
        }
        E mayor = items.get(0);
        for (E item : items) {
            if (item.compareTo(mayor) > 0) {
                mayor = item;
            }
        }
        return mayor;
    }
}
`,
  hints: [
    'El <T> de la clase va justo detrás de su nombre: public class Caja<T>.',
    'Dentro puedes apoyarte en una List<T> normal.',
    'En el método estático hace falta declarar su propio parámetro de tipo antes del retorno.',
    'Para poder usar compareTo, el tipo se restringe con <E extends Comparable<E>>.',
  ],
  quiz: [
    {
      kind: "drag",
      prompt: "Declara el método genérico.",
      snippet: "public static ___ T primero(List<___> items) {\n    return items.get(0);\n}",
      blanks: ["<T>", "T"],
      pool: ["<T>", "T", "Object", "?"],
      explanation: "El <T> va antes del tipo de retorno; a partir de ahí, T ya se puede usar.",
    },
    {
      kind: "choice",
      prompt: "¿Qué ganas frente a usar Object?",
      options: ["Menos memoria", "Que no hace falta castear y el compilador comprueba los tipos", "Que se ejecuta más rápido"],
      correct: 1,
      explanation: "Con Object, cada llamada necesita un casting que puede fallar en ejecución.",
    },
    {
      kind: "fill",
      prompt: "Exige que el tipo se sepa comparar.",
      snippet: "public static <E ___ Comparable<E>> E maximo(List<E> items) { }",
      answers: ["extends"],
      explanation: "En genéricos siempre se escribe extends, aunque Comparable sea una interfaz.",
    },
    {
      kind: "choice",
      prompt: "¿Qué sabe el programa en ejecución sobre una List<String>?",
      options: ["Que contiene String", "Nada: los genéricos se borran al compilar, en ejecución es una List a secas", "Depende de la JVM"],
      correct: 1,
      explanation: "Por eso no se puede hacer new T() ni preguntar instanceof List<String>.",
    },
    {
      kind: "choice",
      prompt: "Vas a leer de una colección de números. ¿Qué comodín usas?",
      options: ["List<? super Number>", "List<? extends Number>", "List<Object>"],
      correct: 1,
      explanation: "extends para leer, super para escribir. Con extends no puedes añadir, porque no sabes qué subtipo es.",
    },
  ],
  tests: [
    {
      name: 'Una caja nueva esta vacia',
      code:
        'Caja<String> caja = new Caja<>();\n        assertTrue(caja.vacia());\n        assertEquals(0, caja.tamano());',
    },
    {
      name: 'Guarda y devuelve sin castings',
      code:
        'Caja<String> caja = new Caja<>();\n        caja.meter("Ana");\n        caja.meter("Luis");\n        String primero = caja.sacar(0);\n        assertEquals("Ana", primero);\n        assertEquals(2, caja.tamano());\n        assertFalse(caja.vacia());',
    },
    {
      name: 'Sirve para cualquier tipo',
      code:
        'Caja<Integer> numeros = new Caja<>();\n        numeros.meter(7);\n        int valor = numeros.sacar(0);\n        assertEquals(7, valor);',
    },
    {
      name: 'maximo devuelve el mayor de una lista de textos',
      code:
        'assertEquals("Zoe", Caja.maximo(List.of("Ana", "Zoe", "Luis")));',
    },
    {
      name: 'maximo funciona igual con numeros',
      code:
        'assertEquals(Integer.valueOf(51), Caja.maximo(List.of(34, 51, 28)));',
    },
    {
      name: 'maximo devuelve null con la lista vacia',
      code:
        'assertNull(Caja.maximo(new ArrayList<String>()));',
    },
  ],
}
