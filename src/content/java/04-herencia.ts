import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'java-04-herencia',
  language: 'java',
  title: 'Herencia y clases abstractas',
  difficulty: 3,
  concepts: ['extends', 'super', 'abstract', '@Override', 'protected'],
  theory: `## Reutilizar sin copiar

Dos clases que comparten casi todo y se diferencian en un detalle. La herencia permite
escribir lo común una vez:

~~~java
class Empleado {

    protected final String nombre;
    protected double sueldoBase;

    Empleado(String nombre, double sueldoBase) {
        this.nombre = nombre;
        this.sueldoBase = sueldoBase;
    }

    double sueldo() {
        return sueldoBase;
    }
}

class Comercial extends Empleado {

    private final double comision;

    Comercial(String nombre, double sueldoBase, double comision) {
        super(nombre, sueldoBase);
        this.comision = comision;
    }

    @Override
    double sueldo() {
        return sueldoBase + comision;
    }
}
~~~

\`extends\` dice *es un*. Un \`Comercial\` **es un** \`Empleado\`, así que sirve en
cualquier sitio donde se espere uno.

## super

Dos usos, y conviene no confundirlos:

- \`super(...)\` en el constructor llama al del padre. Tiene que ser **la primera línea**:
  el objeto padre se construye antes que el hijo.
- \`super.metodo()\` llama a la versión del padre desde la del hijo, cuando quieres ampliar
  su comportamiento en vez de sustituirlo.

## protected

Tres niveles que ya conoces y uno nuevo:

- \`private\` — solo esta clase.
- \`protected\` — esta clase y las que hereden de ella.
- \`public\` — todo el mundo.

\`protected\` es lo que se usa para el estado que las hijas necesitan tocar.

## Clases abstractas

A veces la clase padre no tiene sentido por sí sola: no existe *un empleado a secas*,
existen comerciales y técnicos.

~~~java
abstract class Empleado {

    protected final String nombre;

    Empleado(String nombre) {
        this.nombre = nombre;
    }

    /** Cada tipo de empleado cobra a su manera. */
    abstract double sueldo();

    String describir() {
        return nombre + " cobra " + sueldo();
    }
}
~~~

\`abstract\` en la clase impide hacer \`new Empleado(...)\`. \`abstract\` en un método
significa que no tiene cuerpo y **cada hija está obligada a escribirlo**.

Fíjate en \`describir()\`: llama a \`sueldo()\` sin saber cuál se ejecutará. Eso es lo que
diferencia una clase abstracta de una interfaz: aquí hay estado y código compartido.

## Abstracta o interfaz

- **Interfaz**: un contrato. Se pueden implementar varias, no lleva estado.
- **Abstracta**: comparte estado y código. Solo se hereda de una.

En la duda, interfaz. La herencia ata mucho: cambiar el padre cambia a todas las hijas, y
eso se vuelve incómodo enseguida. La recomendación clásica es **preferir la composición a
la herencia**: en vez de *ser un* motor, *tener un* motor.

## final

\`final\` en una clase impide heredar de ella; en un método, impide sobrescribirlo. Sirve
para decir "esto es así y no se toca".

## Errores típicos

- Olvidar \`super(...)\` cuando el padre no tiene constructor vacío.
- Poner \`super(...)\` en cualquier sitio menos la primera línea.
- Sobrescribir con la firma mal escrita sin poner \`@Override\`: creas un método nuevo y el
  fallo aparece en ejecución.
- Heredar para reutilizar cuatro líneas, cuando lo que tocaba era componer.`,
  brief: `En el fichero \`Empleado.java\`:

1. Una clase **abstracta pública** \`Empleado\` con un campo \`protected final String nombre\`,
   un constructor \`Empleado(String nombre)\`, un método abstracto \`double sueldo()\` y un
   método \`describir()\` que devuelva \`"Ana cobra 1200.0"\` (nombre, espacio, "cobra",
   espacio y el sueldo).

2. Una clase \`Tecnico\` (sin \`public\`) con constructor \`Tecnico(String nombre, double base)\`.
   Su sueldo es la base.

3. Una clase \`Comercial\` (sin \`public\`) con constructor
   \`Comercial(String nombre, double base, double comision)\`. Su sueldo es la suma de las dos.`,
  fileName: 'Empleado.java',
  starterCode: `public abstract class Empleado {

    // campo, constructor, metodo abstracto y describir()
}

class Tecnico extends Empleado {
}

class Comercial extends Empleado {
}
`,
  solution: `public abstract class Empleado {

    protected final String nombre;

    Empleado(String nombre) {
        this.nombre = nombre;
    }

    /** Cada tipo de empleado cobra a su manera. */
    abstract double sueldo();

    String describir() {
        return nombre + " cobra " + sueldo();
    }
}

class Tecnico extends Empleado {

    private final double base;

    Tecnico(String nombre, double base) {
        super(nombre);
        this.base = base;
    }

    @Override
    double sueldo() {
        return base;
    }
}

class Comercial extends Empleado {

    private final double base;
    private final double comision;

    Comercial(String nombre, double base, double comision) {
        super(nombre);
        this.base = base;
        this.comision = comision;
    }

    @Override
    double sueldo() {
        return base + comision;
    }
}
`,
  hints: [
    'El constructor de la hija llama al del padre con super(nombre), y tiene que ser la primera línea.',
    'El método abstracto no lleva cuerpo: abstract double sueldo();',
    'describir() está escrito una sola vez en el padre y funciona para las dos hijas.',
    'Al concatenar un double con texto sale con decimal: 1200.0, no 1200.',
  ],
  tests: [
    { name: 'Un tecnico cobra su base', code: 'Empleado tecnico = new Tecnico("Ana", 1200);\n        assertEquals(1200.0, tecnico.sueldo(), 0.001);' },
    { name: 'Un comercial suma la comision', code: 'Empleado comercial = new Comercial("Luis", 1000, 350);\n        assertEquals(1350.0, comercial.sueldo(), 0.001);' },
    { name: 'describir se hereda y usa el sueldo de cada uno', code: 'assertEquals("Ana cobra 1200.0", new Tecnico("Ana", 1200).describir());\n        assertEquals("Luis cobra 1350.0", new Comercial("Luis", 1000, 350).describir());' },
    { name: 'Los dos se pueden tratar como Empleado', code: 'List<Empleado> plantilla = List.of(new Tecnico("Ana", 1000), new Comercial("Luis", 1000, 200));\n        double total = 0;\n        for (Empleado empleado : plantilla) {\n            total = total + empleado.sueldo();\n        }\n        assertEquals(2200.0, total, 0.001);' },
  ],
  quiz: [
    {
      kind: "drag",
      prompt: "Llama al constructor del padre.",
      snippet: "Comercial(String nombre, double base) {\n    ___(nombre);\n    this.base = base;\n}",
      blanks: ["super"],
      pool: ["super", "this", "new", "extends"],
      explanation: "Y tiene que ser la primera línea: el objeto padre se construye antes que el hijo.",
    },
    {
      kind: "choice",
      prompt: "¿Qué significa abstract en un método?",
      options: ["Que es privado", "Que no tiene cuerpo y cada hija está obligada a escribirlo", "Que no se puede sobrescribir"],
      correct: 1,
      explanation: "Y abstract en la clase impide hacer new: no existe \"un empleado a secas\".",
    },
    {
      kind: "choice",
      prompt: "¿Para qué sirve protected?",
      options: ["Para que solo lo vea esta clase", "Para que lo vean esta clase y las que hereden de ella", "Para que lo vea todo el mundo"],
      correct: 1,
      explanation: "Es el nivel para el estado que las hijas necesitan tocar.",
    },
    {
      kind: "choice",
      prompt: "¿Qué pasa si sobrescribes con la firma mal escrita y sin @Override?",
      options: ["No compila", "Creas un método nuevo que nadie llama, y el fallo aparece en ejecución", "Java lo corrige solo"],
      correct: 1,
      explanation: "Por eso conviene ponerla siempre: convierte un fallo silencioso en un error de compilación.",
    },
    {
      kind: "order",
      prompt: "Ordena la clase hija.",
      lines: ["class Comercial extends Empleado {", "    private final double comision;", "    Comercial(String nombre, double comision) {", "        super(nombre);", "        this.comision = comision;", "    }", "}"],
      explanation: "Primero los campos, luego el constructor, y dentro de él super antes que nada.",
    },
  ],
}
