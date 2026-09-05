import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'ts-06-interfaces',
  language: 'typescript',
  title: 'Interfaces y objetos',
  difficulty: 2,
  concepts: ['interface', 'objetos', 'arrays de objetos'],
  theory: `## La idea

Hasta ahora tus datos eran valores sueltos: un nombre por un lado, una edad por otro. En
cuanto el programa crece, esos valores viajan juntos: *el paciente* tiene nombre, edad y
teléfono, y se pasan de una función a otra como una sola cosa. Eso es un **objeto**.

Una \`interface\` es la ficha que dice qué campos tiene ese objeto y de qué tipo es cada
uno. Como el formulario en papel de una consulta: los huecos están definidos de antemano y,
si te dejas uno, alguien se da cuenta. Ese alguien es el compilador.

## Describir la forma de un objeto

Una \`interface\` pone nombre a la forma que debe tener un objeto. No genera código:
solo existe mientras el compilador comprueba tu programa.

~~~ts
interface Usuario {
  nombre: string
  edad: number
  admin: boolean
}

const ana: Usuario = { nombre: 'Ana', edad: 30, admin: false }
~~~

Si te falta una propiedad, sobra otra o el tipo no encaja, el compilador te avisa.

## Propiedades opcionales

Un \`?\` marca una propiedad que puede no venir:

~~~ts
interface Usuario {
  nombre: string
  telefono?: string   // string | undefined
}
~~~

## Recorrer arrays de objetos

~~~ts
const usuarios: Usuario[] = [ana]
const admins = usuarios.filter((u) => u.admin).length
~~~

## interface o type

Para describir objetos sirven las dos. \`interface\` es lo habitual al modelar entidades del dominio (un paciente, un pedido) y se puede ampliar más adelante; \`type\` sirve además para uniones y alias. Elige una y sé consistente.

## Las interfaces no existen en tiempo de ejecución

Una interfaz solo vive mientras el compilador comprueba tu código: no genera nada. Si los datos vienen de fuera (una API, un formulario), el compilador se fía de lo que le digas, así que ahí sí hay que comprobarlos a mano.

## Errores típicos

- Escribir una propiedad con un nombre distinto al que espera quien usa el objeto.
- Separar las propiedades con comas: dentro de una interfaz van con salto de línea o punto y coma.
- Marcar todo como opcional con \`?\` para que deje de quejarse: entonces te toca comprobarlo todo después.`,
  brief: `Una clínica quiere un resumen de su agenda.

1. Declara la interfaz \`Cita\` con estas propiedades: \`paciente\` (texto),
   \`hora\` (texto), \`minutos\` (número) y \`confirmada\` (booleano).
2. Implementa \`resumen(citas: Cita[]): string\`, que devuelve exactamente:

~~~
3 citas, 2 confirmadas, 90 min
~~~

donde el último número es la **suma de los minutos de todas las citas** (confirmadas o no).`,
  quiz: [
    {
      kind: 'fill',
      prompt: "Declara la forma que debe tener un objeto.",
      snippet: "___ Usuario { nombre: string }",
      answers: ["interface"],
      explanation: "interface pone nombre a la forma de un objeto; no genera código.",
    },
    {
      kind: 'fill',
      prompt: "Haz que el teléfono pueda no venir.",
      snippet: "interface Usuario { telefono___: string }",
      answers: ["?"],
      explanation: "El ? marca la propiedad como opcional: su tipo pasa a ser string | undefined.",
    },
    {
      kind: 'fill',
      prompt: "Escribe el tipo de una lista de usuarios.",
      snippet: "const lista: ___ = []",
      answers: ["Usuario[]", "Array<Usuario>"],
      explanation: "Añadir [] al final de un tipo indica un array de ese tipo.",
    },
    {
      kind: "order",
      prompt: "Ordena la declaración de la interfaz.",
      lines: ["interface Cita {", "  paciente: string", "  minutos: number", "  confirmada: boolean", "}"],
      explanation: "Cada propiedad va en su línea, con su tipo, dentro de las llaves.",
    },
    {
      kind: "choice",
      prompt: "¿Qué queda de una interface cuando el programa se ejecuta?",
      options: ["Se convierte en una clase", "Nada: solo existe mientras se compila", "Una función que valida los datos"],
      correct: 1,
      explanation: "Por eso, si los datos vienen de una API, hay que comprobarlos a mano: el compilador se fía de lo que le dijiste.",
    },
    {
      kind: "drag",
      prompt: "Completa el resumen de la agenda.",
      snippet: "const confirmadas = citas.___((c) => c.confirmada).___\nconst minutos = citas.___((total, c) => total + c.minutos, 0)",
      blanks: ["filter", "length", "reduce"],
      pool: ["filter", "length", "reduce", "map"],
      explanation: "Contar es filtrar y mirar la longitud; sumar es acumular con reduce.",
    },
  ],
  starterCode: `interface Cita {
  // Declara aquí las propiedades
}

function resumen(citas: Cita[]): string {
  return ''
}
`,
  solution: `interface Cita {
  paciente: string
  hora: string
  minutos: number
  confirmada: boolean
}

function resumen(citas: Cita[]): string {
  const confirmadas = citas.filter((cita) => cita.confirmada).length
  const minutos = citas.reduce((total, cita) => total + cita.minutos, 0)

  return \`\${citas.length} citas, \${confirmadas} confirmadas, \${minutos} min\`
}
`,
  hints: [
    'Los nombres de las propiedades tienen que coincidir exactamente con los del enunciado.',
    'citas.length te da el total sin recorrer nada.',
    'Para contar las confirmadas: citas.filter((c) => c.confirmada).length.',
  ],
  tests: [
    {
      name: 'Resume una agenda con citas confirmadas y sin confirmar',
      code: `const agenda: Cita[] = [
      { paciente: 'Ana', hora: '09:00', minutos: 30, confirmada: true },
      { paciente: 'Luis', hora: '09:30', minutos: 30, confirmada: true },
      { paciente: 'Zoe', hora: '10:00', minutos: 30, confirmada: false },
    ]
    expect(resumen(agenda)).toBe('3 citas, 2 confirmadas, 90 min')`,
    },
    {
      name: 'Suma los minutos aunque las citas duren distinto',
      code: `const agenda: Cita[] = [
      { paciente: 'Ana', hora: '09:00', minutos: 45, confirmada: false },
      { paciente: 'Luis', hora: '10:00', minutos: 15, confirmada: false },
    ]
    expect(resumen(agenda)).toBe('2 citas, 0 confirmadas, 60 min')`,
    },
    {
      name: 'Funciona con una agenda vacía',
      code: `expect(resumen([])).toBe('0 citas, 0 confirmadas, 0 min')`,
    },
  ],
}
