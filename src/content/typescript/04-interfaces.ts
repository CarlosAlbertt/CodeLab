import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'ts-04-interfaces',
  language: 'typescript',
  title: 'Interfaces y objetos',
  difficulty: 2,
  concepts: ['interface', 'objetos', 'arrays de objetos'],
  theory: `## Describir la forma de un objeto

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
~~~`,
  brief: `Una clínica quiere un resumen de su agenda.

1. Declara la interfaz \`Cita\` con estas propiedades: \`paciente\` (texto),
   \`hora\` (texto), \`minutos\` (número) y \`confirmada\` (booleano).
2. Implementa \`resumen(citas: Cita[]): string\`, que devuelve exactamente:

~~~
3 citas, 2 confirmadas, 90 min
~~~

donde el último número es la **suma de los minutos de todas las citas** (confirmadas o no).`,
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
