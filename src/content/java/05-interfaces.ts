import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'java-05-interfaces',
  language: 'java',
  title: 'Interfaces y polimorfismo',
  difficulty: 3,
  concepts: ['interface', 'implements', 'polimorfismo', '@Override'],
  theory: `## No es lo mismo que en TypeScript

En TypeScript una \`interface\` describe la forma de un objeto y desaparece al compilar. En
Java es un **tipo de verdad** que existe en ejecución, y una clase declara explícitamente
que lo cumple:

~~~java
public interface Figura {
    double area();
}

class Circulo implements Figura {

    private final double radio;

    Circulo(double radio) {
        this.radio = radio;
    }

    @Override
    public double area() {
        return Math.PI * radio * radio;
    }
}
~~~

La interfaz solo dice **qué** métodos hay; cada clase decide **cómo**.

## Polimorfismo

Aquí está lo que hace que merezca la pena:

~~~java
List<Figura> figuras = List.of(new Circulo(2), new Rectangulo(3, 4));

double total = 0;
for (Figura figura : figuras) {
    total = total + figura.area();
}
~~~

El bucle no sabe si está sumando círculos o rectángulos. Llama a \`area()\` y cada objeto
responde con su propio cálculo. El día que añadas un triángulo, este código no se toca.

## @Override

No es obligatoria, pero ponla siempre: si te equivocas al escribir el nombre del método o
los parámetros, el compilador te avisa de que no estás sobrescribiendo nada. Sin ella,
habrías creado un método nuevo que nadie llama, y el fallo aparecería en ejecución.

## Un fichero, una clase pública

Java solo admite **una clase pública por fichero**, y tiene que llamarse como el fichero.
Las demás clases del mismo fichero van sin \`public\`: solo se ven desde ahí. Para estos
ejercicios viene bien; en un proyecto real cada clase tiene su fichero.

## Métodos por defecto

Una interfaz puede traer implementación:

~~~java
public interface Figura {
    double area();

    default String describir() {
        return "Figura de area " + area();
    }
}
~~~

Así se le añade comportamiento a una interfaz sin romper las clases que ya la
implementaban.

## Interfaz o clase abstracta

- **Interfaz**: un contrato. Una clase puede implementar varias.
- **Clase abstracta**: comparte además estado y código. Solo se puede heredar de una.

En la duda, interfaz.

## Errores típicos

- Olvidar \`implements\`.
- Escribir mal la firma del método y no darse cuenta por no poner \`@Override\`.
- Poner \`public\` a más de una clase en el mismo fichero.
- Olvidar que los métodos de una interfaz son públicos: al implementarlos hay que
  declararlos \`public\`.`,
  brief: `En el fichero \`Figura.java\`:

1. La interfaz **pública** \`Figura\`, con un método \`double area()\`.
2. Una clase \`Circulo\` (sin \`public\`) que la implemente, con constructor
   \`Circulo(double radio)\`. Su área es \`Math.PI * radio * radio\`.
3. Una clase \`Rectangulo\` (sin \`public\`) con constructor
   \`Rectangulo(double ancho, double alto)\`. Su área es el producto de los dos.

Las tres van en el mismo fichero: solo la interfaz es pública.`,
  fileName: 'Figura.java',
  starterCode: `public interface Figura {
    // el método que todas tienen que tener
}

class Circulo implements Figura {
}

class Rectangulo implements Figura {
}
`,
  solution: `public interface Figura {

    double area();
}

class Circulo implements Figura {

    private final double radio;

    Circulo(double radio) {
        this.radio = radio;
    }

    @Override
    public double area() {
        return Math.PI * radio * radio;
    }
}

class Rectangulo implements Figura {

    private final double ancho;
    private final double alto;

    Rectangulo(double ancho, double alto) {
        this.ancho = ancho;
        this.alto = alto;
    }

    @Override
    public double area() {
        return ancho * alto;
    }
}
`,
  hints: [
    'En la interfaz el método no lleva cuerpo: solo la firma y punto y coma.',
    'Los métodos de una interfaz son públicos, así que al implementarlos hay que poner public.',
    'El constructor se llama igual que la clase y no declara tipo de retorno.',
    'Guarda los datos en campos private final y asígnalos con this.',
  ],
  tests: [
    {
      name: 'El area del circulo sale bien',
      code: 'Figura circulo = new Circulo(2);\n        assertEquals(12.566, circulo.area(), 0.001);',
    },
    {
      name: 'El area del rectangulo sale bien',
      code: 'Figura rectangulo = new Rectangulo(3, 4);\n        assertEquals(12.0, rectangulo.area(), 0.001);',
    },
    {
      name: 'Las dos se pueden tratar como Figura',
      code: 'List<Figura> figuras = List.of(new Circulo(1), new Rectangulo(2, 5));\n        double total = 0;\n        for (Figura figura : figuras) {\n            total = total + figura.area();\n        }\n        assertEquals(13.141, total, 0.001);',
    },
    {
      name: 'Un rectangulo de lado cero mide cero',
      code: 'assertEquals(0.0, new Rectangulo(0, 7).area(), 0.001);',
    },
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "¿En qué se diferencia de una interface de TypeScript?",
      options: ["En nada", "En Java es un tipo real que existe en ejecución, y la clase declara que lo cumple con implements", "En que no admite métodos"],
      correct: 1,
      explanation: "En TypeScript la interfaz desaparece al compilar; en Java se puede preguntar en ejecución si algo es una Figura.",
    },
    {
      kind: "drag",
      prompt: "Declara que la clase cumple el contrato.",
      snippet: "class Circulo ___ Figura {\n    ___\n    public double area() { return 3.14; }\n}",
      blanks: ["implements", "@Override"],
      pool: ["implements", "@Override", "extends", "public"],
      explanation: "@Override no es obligatoria, pero avisa si te equivocas al escribir la firma.",
    },
    {
      kind: "choice",
      prompt: "¿Qué gana el bucle que recorre List<Figura> sumando áreas?",
      options: ["Nada, hay que comprobar el tipo de cada una", "Que no necesita saber de qué figura se trata: cada objeto responde con su propio cálculo", "Que va más rápido"],
      correct: 1,
      explanation: "El día que añadas un triángulo, ese bucle no se toca. Eso es el polimorfismo.",
    },
    {
      kind: "fill",
      prompt: "En la interfaz, el método no lleva cuerpo.",
      snippet: "public interface Figura {\n    double area()___\n}",
      answers: [";"],
      explanation: "Solo la firma: el cómo lo pone cada clase que la implemente.",
    },
    {
      kind: "choice",
      prompt: "¿Cuántas clases públicas caben en un fichero?",
      options: ["Las que quieras", "Una, y tiene que llamarse como el fichero", "Ninguna, todas van sin public"],
      correct: 1,
      explanation: "Las demás van sin public y solo se ven desde ese fichero.",
    },
  ],
}
