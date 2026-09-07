import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'java-99-proyecto-final',
  language: 'java',
  title: 'Agenda de la clínica en Java',
  kind: 'project',
  difficulty: 3,
  concepts: ['enum', 'record', 'Optional', 'streams', 'excepciones'],
  theory: `## Qué vas a construir

La misma agenda que hiciste en TypeScript, ahora en Java y usando lo que has visto en la
pista: un \`enum\` para el estado, un \`record\` para la cita, \`Optional\` para la
búsqueda, streams para el resumen y excepciones para los errores.

Compararla con la versión de TypeScript enseña bastante: el problema es idéntico y casi
todas las decisiones cambian.

## Lo que cambia respecto a TypeScript

- Los estados eran \`'pendiente' | 'confirmada'\`; aquí son un **enum**, que además existe
  en ejecución y hace que el \`switch\` avise si añades uno nuevo.
- La cita era un objeto literal; aquí es un **record** inmutable con \`equals\` y
  \`toString\` de regalo.
- El error era \`{ ok: false, motivo }\`; aquí se **lanza**, y la comprobación no se puede
  olvidar porque interrumpe la ejecución.
- \`Cita | undefined\` es ahora \`Optional<Cita>\`.
- \`filter\` y \`reduce\` son \`stream()\` con su operación final.

Ninguna forma es mejor: son dos maneras de conseguir que un error no pase desapercibido.

## Trabajar con datos inmutables

El \`record\` no se puede modificar, así que cancelar una cita no es cambiarle un campo: es
**sustituirla por otra** con el estado nuevo.

~~~java
citas.set(i, new Cita(cita.id(), cita.pacienteId(), cita.minutos(), EstadoCita.CANCELADA));
~~~

Suena aparatoso, y a cambio te llevas una garantía fuerte: nadie puede guardarse una
referencia a una cita y verla cambiar por debajo.

## El resumen con streams

\`groupingBy\` agrupa y \`counting\` cuenta cada grupo:

~~~java
return citas.stream()
        .collect(Collectors.groupingBy(Cita::estado, Collectors.counting()));
~~~

Un detalle que importa: en el mapa resultante **solo aparecen los estados que existan**. Si
no hay ninguna cancelada, esa clave no está y \`get\` devuelve \`null\`. Es justo el caso
que practicaste con \`getOrDefault\`.

## Cómo abordarlo

1. El \`enum\` y el \`record\` primero: con los tipos bien puestos, el resto casi se escribe
   solo.
2. Los métodos fáciles: \`agregarPaciente\`, \`citasDe\`, \`buscarCita\`.
3. \`reservar\`, comprobando los errores **antes** de crear nada.
4. \`confirmar\` y \`cancelar\`, que sustituyen el record.
5. \`resumen\` y \`minutosOcupados\` con streams.

Ejecuta a cada paso: los tests que ya pasan te confirman que vas bien.`,
  brief: `Escribe la clase \`Agenda\`. Dentro de ella:

- Un \`enum EstadoCita\` con \`PENDIENTE\`, \`CONFIRMADA\` y \`CANCELADA\`.
- Un \`record Cita(String id, String pacienteId, int minutos, EstadoCita estado)\`.

Y estos métodos:

1. \`agregarPaciente(String id, String nombre)\`. Si el id ya existe, no hace nada.

2. \`reservar(String pacienteId, int minutos)\` devuelve el id de la cita (\`"c1"\`,
   \`"c2"\`...) y la crea en estado \`PENDIENTE\`. Comprueba en este orden y lanza
   \`IllegalArgumentException\` con estos mensajes exactos:
   - \`"paciente desconocido"\` si no hay ningún paciente con ese id.
   - \`"duracion invalida"\` si \`minutos\` es cero o negativo.

3. \`buscarCita(String idCita)\` devuelve un \`Optional<Cita>\`.

4. \`confirmar(String idCita)\` pasa una cita **pendiente** a \`CONFIRMADA\` y devuelve
   \`true\`. Si no existe o no estaba pendiente, \`false\`.

5. \`cancelar(String idCita)\` la pasa a \`CANCELADA\` y devuelve \`true\`. Si no existe o
   ya estaba cancelada, \`false\`.

6. \`citasDe(String pacienteId)\` devuelve los ids de sus citas, en orden de reserva.

7. \`resumen()\` devuelve un \`Map<EstadoCita, Long>\` con cuántas citas hay de cada estado
   **que exista**.

8. \`minutosOcupados()\` suma los minutos de las citas que no estén canceladas.`,
  fileName: 'Agenda.java',
  quiz: [
    {
      kind: "choice",
      prompt: "En TypeScript devolvías { ok: false, motivo }. ¿Por qué aquí se lanza?",
      options: ["Porque Java no tiene uniones", "Porque en Java lo idiomático es lanzar: la comprobación no se puede olvidar, ya que interrumpe la ejecución", "Porque es más rápido"],
      correct: 1,
      explanation: "Son dos maneras distintas de conseguir lo mismo: que el error no pase desapercibido.",
    },
    {
      kind: "drag",
      prompt: "Como el record es inmutable, cancelar sustituye la cita entera.",
      snippet: "citas.___(i, new Cita(cita.id(), cita.pacienteId(), cita.minutos(), EstadoCita.___));",
      blanks: ["set", "CANCELADA"],
      pool: ["set", "CANCELADA", "add", "PENDIENTE"],
      explanation: "No se le cambia un campo: se pone otra en su sitio. A cambio, nadie puede verla cambiar por debajo.",
    },
    {
      kind: "fill",
      prompt: "Cuenta cuántas citas hay de cada estado.",
      snippet: ".collect(Collectors.___(Cita::estado, Collectors.counting()));",
      answers: ["groupingBy"],
      explanation: "Agrupa por el estado y cuenta cada grupo, igual que un GROUP BY de SQL.",
    },
    {
      kind: "choice",
      prompt: "No hay ninguna cita cancelada. ¿Qué devuelve resumen().get(CANCELADA)?",
      options: ["0L", "null, porque groupingBy solo crea las claves que existen", "Lanza una excepción"],
      correct: 1,
      explanation: "Es justo el caso de getOrDefault: la ausencia de clave no es lo mismo que un cero.",
    },
    {
      kind: "order",
      prompt: "Ordena por dónde conviene empezar.",
      lines: ["El enum y el record", "agregarPaciente, citasDe y buscarCita", "reservar, con sus comprobaciones", "confirmar, cancelar y el resumen con streams"],
      explanation: "Con los tipos bien puestos el resto casi se escribe solo, y lo comprobable va antes que lo complejo.",
    },
  ],
  starterCode: "import java.util.*;\nimport java.util.stream.*;\n\npublic class Agenda {\n\n    enum EstadoCita {\n        // los tres estados\n    }\n\n    record Cita(String id, String pacienteId, int minutos, EstadoCita estado) {\n    }\n\n    // Los campos van aquí\n\n    public void agregarPaciente(String id, String nombre) {\n    }\n\n    public String reservar(String pacienteId, int minutos) {\n        return \"\";\n    }\n\n    public Optional<Cita> buscarCita(String idCita) {\n        return Optional.empty();\n    }\n\n    public boolean confirmar(String idCita) {\n        return false;\n    }\n\n    public boolean cancelar(String idCita) {\n        return false;\n    }\n\n    public List<String> citasDe(String pacienteId) {\n        return List.of();\n    }\n\n    public Map<EstadoCita, Long> resumen() {\n        return Map.of();\n    }\n\n    public int minutosOcupados() {\n        return 0;\n    }\n}\n",
  solution: "import java.util.*;\nimport java.util.stream.*;\n\npublic class Agenda {\n\n    enum EstadoCita {\n        PENDIENTE, CONFIRMADA, CANCELADA\n    }\n\n    /** Inmutable: cambiar de estado es sustituirla por otra. */\n    record Cita(String id, String pacienteId, int minutos, EstadoCita estado) {\n    }\n\n    private final Map<String, String> pacientes = new LinkedHashMap<>();\n    private final List<Cita> citas = new ArrayList<>();\n    private int siguienteId = 1;\n\n    public void agregarPaciente(String id, String nombre) {\n        if (pacientes.containsKey(id)) {\n            return;\n        }\n        pacientes.put(id, nombre);\n    }\n\n    public String reservar(String pacienteId, int minutos) {\n        if (!pacientes.containsKey(pacienteId)) {\n            throw new IllegalArgumentException(\"paciente desconocido\");\n        }\n        if (minutos <= 0) {\n            throw new IllegalArgumentException(\"duracion invalida\");\n        }\n\n        String id = \"c\" + siguienteId;\n        siguienteId++;\n        citas.add(new Cita(id, pacienteId, minutos, EstadoCita.PENDIENTE));\n        return id;\n    }\n\n    public Optional<Cita> buscarCita(String idCita) {\n        return citas.stream()\n                .filter(cita -> cita.id().equals(idCita))\n                .findFirst();\n    }\n\n    public boolean confirmar(String idCita) {\n        return cambiarEstado(idCita, EstadoCita.PENDIENTE, EstadoCita.CONFIRMADA);\n    }\n\n    public boolean cancelar(String idCita) {\n        for (int i = 0; i < citas.size(); i++) {\n            Cita cita = citas.get(i);\n            if (!cita.id().equals(idCita) || cita.estado() == EstadoCita.CANCELADA) {\n                continue;\n            }\n            citas.set(i, new Cita(cita.id(), cita.pacienteId(), cita.minutos(), EstadoCita.CANCELADA));\n            return true;\n        }\n        return false;\n    }\n\n    /** Solo cambia si la cita esta exactamente en el estado esperado. */\n    private boolean cambiarEstado(String idCita, EstadoCita desde, EstadoCita hasta) {\n        for (int i = 0; i < citas.size(); i++) {\n            Cita cita = citas.get(i);\n            if (!cita.id().equals(idCita) || cita.estado() != desde) {\n                continue;\n            }\n            citas.set(i, new Cita(cita.id(), cita.pacienteId(), cita.minutos(), hasta));\n            return true;\n        }\n        return false;\n    }\n\n    public List<String> citasDe(String pacienteId) {\n        return citas.stream()\n                .filter(cita -> cita.pacienteId().equals(pacienteId))\n                .map(Cita::id)\n                .toList();\n    }\n\n    public Map<EstadoCita, Long> resumen() {\n        return citas.stream()\n                .collect(Collectors.groupingBy(Cita::estado, Collectors.counting()));\n    }\n\n    public int minutosOcupados() {\n        return citas.stream()\n                .filter(cita -> cita.estado() != EstadoCita.CANCELADA)\n                .mapToInt(Cita::minutos)\n                .sum();\n    }\n}\n",
  hints: [
    'Empieza por el enum y el record: con los tipos bien puestos, el resto sale casi solo.',
    'buscarCita se resuelve en una línea con .filter(...).findFirst().',
    'Como el record es inmutable, confirmar y cancelar sustituyen el elemento con citas.set(i, nueva).',
    'El resumen es groupingBy(Cita::estado, Collectors.counting()).',
    'Los enums se comparan con == y !=, no con equals.',
  ],
  tests: [
    {
      name: 'El enum tiene los tres estados',
      code:
        'assertEquals(3, Agenda.EstadoCita.values().length);\n        assertEquals(Agenda.EstadoCita.CONFIRMADA, Agenda.EstadoCita.valueOf("CONFIRMADA"));',
    },
    {
      name: 'No se puede reservar para un paciente que no existe',
      code:
        'Agenda agenda = new Agenda();\n        assertThrows(IllegalArgumentException.class, () -> agenda.reservar("p1", 30));',
    },
    {
      name: 'Rechaza una duracion de cero o negativa',
      code:
        'Agenda agenda = new Agenda();\n        agenda.agregarPaciente("p1", "Ana");\n        assertThrows(IllegalArgumentException.class, () -> agenda.reservar("p1", 0));\n        assertThrows(IllegalArgumentException.class, () -> agenda.reservar("p1", -5));',
    },
    {
      name: 'Una reserva valida crea la cita c1 en pendiente',
      code:
        'Agenda agenda = new Agenda();\n        agenda.agregarPaciente("p1", "Ana");\n        assertEquals("c1", agenda.reservar("p1", 30));\n        assertEquals(Agenda.EstadoCita.PENDIENTE, agenda.buscarCita("c1").get().estado());',
    },
    {
      name: 'buscarCita devuelve vacio si no existe',
      code:
        'Agenda agenda = new Agenda();\n        assertFalse(agenda.buscarCita("c99").isPresent());',
    },
    {
      name: 'confirmar solo funciona sobre una cita pendiente',
      code:
        'Agenda agenda = new Agenda();\n        agenda.agregarPaciente("p1", "Ana");\n        agenda.reservar("p1", 30);\n        assertTrue(agenda.confirmar("c1"));\n        assertFalse(agenda.confirmar("c1"));\n        assertFalse(agenda.confirmar("c99"));',
    },
    {
      name: 'cancelar dos veces devuelve false la segunda',
      code:
        'Agenda agenda = new Agenda();\n        agenda.agregarPaciente("p1", "Ana");\n        agenda.reservar("p1", 30);\n        assertTrue(agenda.cancelar("c1"));\n        assertFalse(agenda.cancelar("c1"));',
    },
    {
      name: 'citasDe devuelve solo las del paciente, en orden',
      code:
        'Agenda agenda = new Agenda();\n        agenda.agregarPaciente("p1", "Ana");\n        agenda.agregarPaciente("p2", "Luis");\n        agenda.reservar("p1", 30);\n        agenda.reservar("p2", 45);\n        agenda.reservar("p1", 15);\n        assertEquals(List.of("c1", "c3"), agenda.citasDe("p1"));\n        assertEquals(List.of(), agenda.citasDe("p9"));',
    },
    {
      name: 'El resumen cuenta cada estado que exista',
      code:
        'Agenda agenda = new Agenda();\n        agenda.agregarPaciente("p1", "Ana");\n        agenda.reservar("p1", 30);\n        agenda.reservar("p1", 30);\n        agenda.reservar("p1", 30);\n        agenda.confirmar("c1");\n        agenda.cancelar("c2");\n        Map<Agenda.EstadoCita, Long> resumen = agenda.resumen();\n        assertEquals(1L, (long) resumen.get(Agenda.EstadoCita.CONFIRMADA));\n        assertEquals(1L, (long) resumen.get(Agenda.EstadoCita.CANCELADA));\n        assertEquals(1L, (long) resumen.get(Agenda.EstadoCita.PENDIENTE));',
    },
    {
      name: 'El resumen no inventa estados que no hay',
      code:
        'Agenda agenda = new Agenda();\n        agenda.agregarPaciente("p1", "Ana");\n        agenda.reservar("p1", 30);\n        assertNull(agenda.resumen().get(Agenda.EstadoCita.CANCELADA));\n        assertEquals(1, agenda.resumen().size());',
    },
    {
      name: 'minutosOcupados no cuenta las canceladas',
      code:
        'Agenda agenda = new Agenda();\n        agenda.agregarPaciente("p1", "Ana");\n        agenda.reservar("p1", 30);\n        agenda.reservar("p1", 45);\n        agenda.cancelar("c2");\n        assertEquals(30, agenda.minutosOcupados());',
    },
    {
      name: 'Agregar dos veces el mismo id no duplica al paciente',
      code:
        'Agenda agenda = new Agenda();\n        agenda.agregarPaciente("p1", "Ana");\n        agenda.agregarPaciente("p1", "Otro");\n        assertEquals("c1", agenda.reservar("p1", 30));',
    },
  ],
}
