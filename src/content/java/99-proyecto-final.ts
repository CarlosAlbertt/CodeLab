import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'java-99-proyecto-final',
  language: 'java',
  title: 'Agenda de la clínica en Java',
  kind: 'project',
  difficulty: 3,
  concepts: ['clases', 'colecciones', 'excepciones', 'encapsulación'],
  theory: `## Qué vas a construir

La misma agenda que hiciste en TypeScript, ahora en Java. Compararlas enseña bastante: el
problema es idéntico y las decisiones cambian.

## Lo que cambia respecto a la versión de TypeScript

- **El estado va en campos privados**, no en propiedades de un objeto literal.
- **Los errores se lanzan**, no se devuelven. En TypeScript usaste una unión discriminada
  (\`{ ok: false, motivo }\`) porque el sistema de tipos te obligaba a comprobarla. En Java
  lo idiomático es \`throw new IllegalArgumentException(...)\`: la comprobación no se puede
  olvidar, porque interrumpe la ejecución.
- **Las colecciones son \`List\` y \`Map\`**, con genéricos.

Ninguna de las dos formas es mejor: son dos maneras distintas de que un error no pase
desapercibido.

## Cómo abordarlo

Igual que la otra vez, y por el mismo motivo:

1. Los campos, y un \`record\` privado para la cita.
2. Los métodos fáciles y comprobables: \`agregarPaciente\` y \`citasDe\`.
3. \`reservar\`, que es donde está la lógica, comprobando los errores **antes** de crear
   nada.
4. \`cancelar\` y \`minutosOcupados\`, que se apoyan en lo anterior.

## Un apunte sobre los ids

Las citas se numeran \`c1\`, \`c2\`... en el orden en que se reservan **con éxito**. Un
contador entero y \`"c" + contador\` resuelve el formato: en Java, texto más número da
texto.`,
  brief: `Escribe la clase \`Agenda\`:

1. \`agregarPaciente(String id, String nombre)\` da de alta un paciente. Si ese id ya
   existe, no hace nada.

2. \`reservar(String pacienteId, int minutos)\` devuelve el id de la cita creada
   (\`"c1"\`, \`"c2"\`...). Comprueba en este orden y lanza \`IllegalArgumentException\` con
   estos mensajes exactos:
   - \`"paciente desconocido"\` si no hay ningún paciente con ese id.
   - \`"duracion invalida"\` si \`minutos\` es cero o negativo.

3. \`cancelar(String idCita)\` devuelve \`true\` si la cita existía y no estaba ya
   cancelada; \`false\` en cualquier otro caso.

4. \`citasDe(String pacienteId)\` devuelve la lista de ids de sus citas, en el orden en que
   se reservaron, incluidas las canceladas.

5. \`minutosOcupados()\` devuelve la suma de los minutos de las citas **no canceladas**.`,
  fileName: 'Agenda.java',
  starterCode: `import java.util.*;

public class Agenda {

    // Los campos van aquí

    public void agregarPaciente(String id, String nombre) {
    }

    public String reservar(String pacienteId, int minutos) {
        return "";
    }

    public boolean cancelar(String idCita) {
        return false;
    }

    public List<String> citasDe(String pacienteId) {
        return new ArrayList<>();
    }

    public int minutosOcupados() {
        return 0;
    }
}
`,
  solution: `import java.util.*;

public class Agenda {

    /** Cada cita guarda a quién pertenece, cuánto dura y si sigue viva. */
    private record Cita(String id, String pacienteId, int minutos, boolean cancelada) {
    }

    private final Map<String, String> pacientes = new LinkedHashMap<>();
    private final List<Cita> citas = new ArrayList<>();
    private int siguienteId = 1;

    public void agregarPaciente(String id, String nombre) {
        if (pacientes.containsKey(id)) {
            return;
        }
        pacientes.put(id, nombre);
    }

    public String reservar(String pacienteId, int minutos) {
        if (!pacientes.containsKey(pacienteId)) {
            throw new IllegalArgumentException("paciente desconocido");
        }
        if (minutos <= 0) {
            throw new IllegalArgumentException("duracion invalida");
        }

        String id = "c" + siguienteId;
        siguienteId++;
        citas.add(new Cita(id, pacienteId, minutos, false));
        return id;
    }

    public boolean cancelar(String idCita) {
        for (int i = 0; i < citas.size(); i++) {
            Cita cita = citas.get(i);
            if (!cita.id().equals(idCita) || cita.cancelada()) {
                continue;
            }
            citas.set(i, new Cita(cita.id(), cita.pacienteId(), cita.minutos(), true));
            return true;
        }
        return false;
    }

    public List<String> citasDe(String pacienteId) {
        List<String> ids = new ArrayList<>();
        for (Cita cita : citas) {
            if (cita.pacienteId().equals(pacienteId)) {
                ids.add(cita.id());
            }
        }
        return ids;
    }

    public int minutosOcupados() {
        int total = 0;
        for (Cita cita : citas) {
            if (!cita.cancelada()) {
                total = total + cita.minutos();
            }
        }
        return total;
    }
}
`,
  hints: [
    'Un record privado dentro de la clase te ahorra escribir la clase Cita entera.',
    'Los pacientes encajan en un Map<String, String>: el id es la clave.',
    'En reservar, comprueba los dos errores antes de tocar nada; así no queda una cita a medias.',
    'Para cancelar puedes recorrer con índice y sustituir el elemento, o usar una clase mutable en vez de un record.',
  ],
  quiz: [
    {
      kind: "choice",
      prompt: "En TypeScript devolviste { ok: false, motivo }. ¿Por qué aquí se lanza?",
      options: ["Porque Java no tiene uniones", "Porque en Java lo idiomático es lanzar: la comprobación no se puede olvidar, ya que interrumpe la ejecución", "Porque es más rápido"],
      correct: 1,
      explanation: "Son dos maneras distintas de conseguir lo mismo: que el error no pase desapercibido.",
    },
    {
      kind: "fill",
      prompt: "Monta el id de la cita a partir del contador.",
      snippet: "String id = \"c\" ___ siguienteId;",
      answers: ["+"],
      explanation: "En Java, texto más número da texto.",
    },
    {
      kind: "drag",
      prompt: "Comprueba que el paciente existe antes de nada.",
      snippet: "if (!pacientes.___(pacienteId)) {\n    throw new IllegalArgumentException(\"___\");\n}",
      blanks: ["containsKey", "paciente desconocido"],
      pool: ["containsKey", "paciente desconocido", "get", "duracion invalida"],
      explanation: "containsKey no confunde \"no está\" con \"está y vale null\".",
    },
    {
      kind: "choice",
      prompt: "¿Por qué comprobar los errores antes de crear la cita?",
      options: ["Por costumbre", "Para que un fallo a medias no deje la agenda con datos inconsistentes", "Porque si no, no compila"],
      correct: 1,
      explanation: "Si lanzas después de haber añadido la cita, el estado queda a medio camino.",
    },
    {
      kind: "order",
      prompt: "Ordena por dónde conviene empezar.",
      lines: ["Los campos y el record privado de la cita", "Los métodos fáciles: agregarPaciente y citasDe", "reservar, con sus comprobaciones", "cancelar y minutosOcupados"],
      explanation: "De lo comprobable a lo complejo, ejecutando a cada paso.",
    },
  ],
  tests: [
    {
      name: 'No se puede reservar para un paciente que no existe',
      code:
        'Agenda agenda = new Agenda();\n        assertThrows(IllegalArgumentException.class, () -> agenda.reservar("p1", 30));',
    },
    {
      name: 'Una reserva valida devuelve c1',
      code:
        'Agenda agenda = new Agenda();\n        agenda.agregarPaciente("p1", "Ana");\n        assertEquals("c1", agenda.reservar("p1", 30));',
    },
    {
      name: 'Las citas se numeran en orden',
      code:
        'Agenda agenda = new Agenda();\n        agenda.agregarPaciente("p1", "Ana");\n        agenda.reservar("p1", 30);\n        assertEquals("c2", agenda.reservar("p1", 15));',
    },
    {
      name: 'Rechaza una duracion de cero o negativa',
      code:
        'Agenda agenda = new Agenda();\n        agenda.agregarPaciente("p1", "Ana");\n        assertThrows(IllegalArgumentException.class, () -> agenda.reservar("p1", 0));\n        assertThrows(IllegalArgumentException.class, () -> agenda.reservar("p1", -5));',
    },
    {
      name: 'Agregar dos veces el mismo id no duplica al paciente',
      code:
        'Agenda agenda = new Agenda();\n        agenda.agregarPaciente("p1", "Ana");\n        agenda.agregarPaciente("p1", "Otro");\n        assertEquals("c1", agenda.reservar("p1", 30));',
    },
    {
      name: 'citasDe devuelve solo las del paciente, en orden',
      code:
        'Agenda agenda = new Agenda();\n        agenda.agregarPaciente("p1", "Ana");\n        agenda.agregarPaciente("p2", "Luis");\n        agenda.reservar("p1", 30);\n        agenda.reservar("p2", 45);\n        agenda.reservar("p1", 15);\n        assertEquals(List.of("c1", "c3"), agenda.citasDe("p1"));\n        assertEquals(List.of(), agenda.citasDe("p9"));',
    },
    {
      name: 'Cancelar dos veces devuelve false la segunda',
      code:
        'Agenda agenda = new Agenda();\n        agenda.agregarPaciente("p1", "Ana");\n        agenda.reservar("p1", 30);\n        assertTrue(agenda.cancelar("c1"));\n        assertFalse(agenda.cancelar("c1"));\n        assertFalse(agenda.cancelar("c99"));',
    },
    {
      name: 'minutosOcupados no cuenta las canceladas',
      code:
        'Agenda agenda = new Agenda();\n        agenda.agregarPaciente("p1", "Ana");\n        agenda.reservar("p1", 30);\n        agenda.reservar("p1", 45);\n        agenda.cancelar("c2");\n        assertEquals(30, agenda.minutosOcupados());',
    },
  ],
}
