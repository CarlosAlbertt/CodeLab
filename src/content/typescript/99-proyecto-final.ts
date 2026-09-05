import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'ts-99-proyecto-final',
  language: 'typescript',
  title: 'Agenda de una clínica',
  kind: 'project',
  difficulty: 3,
  concepts: ['interfaces', 'uniones', 'genéricos', 'clases', 'arrays', 'async'],
  theory: `## Qué vas a construir

Una agenda de citas completa: registrar pacientes, reservar horas evitando solapamientos,
confirmar y cancelar, sacar un resumen y importar pacientes desde una fuente asíncrona.

Es el mismo problema que resuelve cualquier backend sanitario, reducido a una clase.

## Cómo encajan las piezas

Cada unidad de la pista aporta algo:

- **Interfaces** para \`Paciente\` y \`Cita\`: describen la forma de los datos.
- **Unión discriminada** para el resultado de reservar: o sale bien y hay cita, o falla y hay motivo. Nunca las dos cosas.
- **Genéricos** para \`indexarPor\`, una utilidad que sirve para cualquier lista.
- **Clase con estado privado** para la agenda: nadie toca las citas por fuera.
- **Arrays** (\`filter\`, \`some\`, \`reduce\`) para consultar ese estado.
- **async/await** para importar pacientes de una fuente que tarda.

## Cómo abordar algo así

No empieces por el método más difícil. Un orden que funciona:

1. Declara primero los tipos. Si los tipos están bien, el resto casi se escribe solo.
2. Haz lo fácil y comprobable: \`agregarPaciente\`, \`citasDe\`, \`resumen\`.
3. Ataca \`reservar\`, que es donde está la lógica de verdad, comprobando los casos de error **antes** de crear nada.
4. Deja \`importarPacientes\` para el final: se apoya en \`agregarPaciente\`.

Ejecuta a menudo: aunque falten métodos, los tests que ya pasan te dicen que vas bien.

## Un apunte sobre las horas

Las horas llegan como texto (\`'09:30'\`). Comparar textos no sirve para saber si dos citas
se pisan: conviértelas a minutos desde medianoche y compara números.

~~~ts
function aMinutos(hora: string): number {
  const partes = hora.split(':')
  return Number(partes[0]) * 60 + Number(partes[1])
}
~~~

Dos intervalos se solapan si cada uno empieza antes de que acabe el otro:

~~~ts
const seSolapan = inicioA < finB && inicioB < finA
~~~`,
  brief: `Implementa la agenda completa. Los tipos y la estructura de la clase ya están en el
editor; falta el cuerpo de los métodos.

## Reservar

\`reservar(pacienteId, inicio, minutos)\` devuelve \`{ ok: true, cita }\` o \`{ ok: false, motivo }\`.
Comprueba los errores **en este orden** y con estos motivos exactos:

1. \`'paciente desconocido'\` si no hay ningún paciente con ese id.
2. \`'duración inválida'\` si \`minutos\` es cero o negativo.
3. \`'solapamiento'\` si el hueco se pisa con otra cita que no esté cancelada.

Las citas se numeran \`c1\`, \`c2\`, \`c3\`... en el orden en que se reservan **con éxito**,
y nacen en estado \`'pendiente'\`.

## El resto de métodos

- \`agregarPaciente(paciente)\`: lo añade; si ya existe un paciente con ese id, no hace nada.
- \`confirmar(idCita)\`: pasa una cita **pendiente** a \`'confirmada'\` y devuelve \`true\`. Si no existe o no estaba pendiente, devuelve \`false\`.
- \`cancelar(idCita)\`: pasa la cita a \`'cancelada'\` y devuelve \`true\`. Si no existe o ya estaba cancelada, devuelve \`false\`.
- \`citasDe(pacienteId)\`: sus citas, en el orden en que se reservaron.
- \`resumen()\`: cuántas citas hay en cada estado. Siempre las tres claves, con \`0\` si no hay ninguna.
- \`minutosOcupados()\`: suma de los minutos de las citas **no canceladas**.
- \`importarPacientes(cargar)\`: espera a la función que recibe, añade los pacientes que aún no existan y devuelve **cuántos ha añadido**. Si \`cargar\` falla, deja que el error salga.

Y la utilidad genérica \`indexarPor(items, clave)\`, que convierte una lista en un objeto
indexado por la clave que devuelva la función.`,
  starterCode: `type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada'

interface Paciente {
  id: string
  nombre: string
  telefono?: string
}

interface Cita {
  id: string
  pacienteId: string
  inicio: string
  minutos: number
  estado: EstadoCita
}

type ResultadoReserva = { ok: true; cita: Cita } | { ok: false; motivo: string }

function indexarPor<T>(items: T[], clave: (item: T) => string): Record<string, T> {
  return {}
}

class Agenda {
  private pacientes: Paciente[] = []
  private citas: Cita[] = []
  private siguienteId = 1

  agregarPaciente(paciente: Paciente): void {
    // Si ya hay un paciente con ese id, no hagas nada
  }

  reservar(pacienteId: string, inicio: string, minutos: number): ResultadoReserva {
    return { ok: false, motivo: 'sin implementar' }
  }

  confirmar(idCita: string): boolean {
    return false
  }

  cancelar(idCita: string): boolean {
    return false
  }

  citasDe(pacienteId: string): Cita[] {
    return []
  }

  resumen(): Record<EstadoCita, number> {
    return { pendiente: 0, confirmada: 0, cancelada: 0 }
  }

  minutosOcupados(): number {
    return 0
  }

  async importarPacientes(cargar: () => Promise<Paciente[]>): Promise<number> {
    return 0
  }
}
`,
  solution: `type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada'

interface Paciente {
  id: string
  nombre: string
  telefono?: string
}

interface Cita {
  id: string
  pacienteId: string
  inicio: string
  minutos: number
  estado: EstadoCita
}

type ResultadoReserva = { ok: true; cita: Cita } | { ok: false; motivo: string }

function indexarPor<T>(items: T[], clave: (item: T) => string): Record<string, T> {
  const indice: Record<string, T> = {}
  for (const item of items) {
    indice[clave(item)] = item
  }
  return indice
}

/** Las horas llegan como texto: en minutos desde medianoche se pueden comparar. */
function aMinutos(hora: string): number {
  const partes = hora.split(':')
  return Number(partes[0]) * 60 + Number(partes[1])
}

class Agenda {
  private pacientes: Paciente[] = []
  private citas: Cita[] = []
  private siguienteId = 1

  agregarPaciente(paciente: Paciente): void {
    if (this.pacientes.some((existente) => existente.id === paciente.id)) return
    this.pacientes.push(paciente)
  }

  reservar(pacienteId: string, inicio: string, minutos: number): ResultadoReserva {
    const porId = indexarPor(this.pacientes, (paciente) => paciente.id)
    const paciente: Paciente | undefined = porId[pacienteId]
    if (!paciente) return { ok: false, motivo: 'paciente desconocido' }
    if (minutos <= 0) return { ok: false, motivo: 'duración inválida' }

    const desde = aMinutos(inicio)
    const hasta = desde + minutos
    const seSolapa = this.citas.some((cita) => {
      if (cita.estado === 'cancelada') return false
      const otroDesde = aMinutos(cita.inicio)
      return desde < otroDesde + cita.minutos && otroDesde < hasta
    })
    if (seSolapa) return { ok: false, motivo: 'solapamiento' }

    const cita: Cita = {
      id: 'c' + this.siguienteId,
      pacienteId,
      inicio,
      minutos,
      estado: 'pendiente',
    }
    this.siguienteId++
    this.citas.push(cita)
    return { ok: true, cita }
  }

  confirmar(idCita: string): boolean {
    const cita = this.citas.find((item) => item.id === idCita)
    if (!cita || cita.estado !== 'pendiente') return false
    cita.estado = 'confirmada'
    return true
  }

  cancelar(idCita: string): boolean {
    const cita = this.citas.find((item) => item.id === idCita)
    if (!cita || cita.estado === 'cancelada') return false
    cita.estado = 'cancelada'
    return true
  }

  citasDe(pacienteId: string): Cita[] {
    return this.citas.filter((cita) => cita.pacienteId === pacienteId)
  }

  resumen(): Record<EstadoCita, number> {
    const conteo: Record<EstadoCita, number> = { pendiente: 0, confirmada: 0, cancelada: 0 }
    for (const cita of this.citas) {
      conteo[cita.estado]++
    }
    return conteo
  }

  minutosOcupados(): number {
    return this.citas
      .filter((cita) => cita.estado !== 'cancelada')
      .reduce((total, cita) => total + cita.minutos, 0)
  }

  async importarPacientes(cargar: () => Promise<Paciente[]>): Promise<number> {
    const entrantes = await cargar()
    const antes = this.pacientes.length
    for (const paciente of entrantes) {
      this.agregarPaciente(paciente)
    }
    return this.pacientes.length - antes
  }
}
`,
  hints: [
    'Empieza por indexarPor: es la pieza más pequeña y la usa reservar.',
    'En reservar, comprueba los tres errores antes de crear la cita; así no dejas citas a medias.',
    'Para el solapamiento: convierte las horas a minutos y usa desde < otroFin && otroDesde < hasta.',
    'confirmar y cancelar trabajan sobre el objeto que devuelve find(): al cambiar su estado cambia el que está en el array.',
    'importarPacientes puede apoyarse en agregarPaciente y contar la diferencia de longitud antes y después.',
  ],
  tests: [
    {
      name: 'indexarPor convierte una lista en un objeto indexado',
      code: `const indice = indexarPor([{ id: 'a' }, { id: 'b' }], (item) => item.id)
    expect(Object.keys(indice)).toEqual(['a', 'b'])
    expect(indice.b).toEqual({ id: 'b' })`,
    },
    {
      name: 'No se puede reservar para un paciente que no existe',
      code: `const agenda = new Agenda()
    expect(agenda.reservar('p1', '09:00', 30)).toEqual({ ok: false, motivo: 'paciente desconocido' })`,
    },
    {
      name: 'Una reserva válida crea la cita c1 en estado pendiente',
      code: `const agenda = new Agenda()
    agenda.agregarPaciente({ id: 'p1', nombre: 'Ana' })
    expect(agenda.reservar('p1', '09:00', 30)).toEqual({
      ok: true,
      cita: { id: 'c1', pacienteId: 'p1', inicio: '09:00', minutos: 30, estado: 'pendiente' },
    })`,
    },
    {
      name: 'Las citas se numeran en orden de reserva',
      code: `const agenda = new Agenda()
    agenda.agregarPaciente({ id: 'p1', nombre: 'Ana' })
    agenda.reservar('p1', '09:00', 30)
    const segunda = agenda.reservar('p1', '10:00', 30)
    expect(segunda.ok && segunda.cita.id).toBe('c2')`,
    },
    {
      name: 'Rechaza una duración de cero o negativa',
      code: `const agenda = new Agenda()
    agenda.agregarPaciente({ id: 'p1', nombre: 'Ana' })
    expect(agenda.reservar('p1', '09:00', 0)).toEqual({ ok: false, motivo: 'duración inválida' })
    expect(agenda.reservar('p1', '09:00', -15)).toEqual({ ok: false, motivo: 'duración inválida' })`,
    },
    {
      name: 'Rechaza una cita que se pisa con otra',
      code: `const agenda = new Agenda()
    agenda.agregarPaciente({ id: 'p1', nombre: 'Ana' })
    agenda.agregarPaciente({ id: 'p2', nombre: 'Luis' })
    agenda.reservar('p1', '09:00', 30)
    expect(agenda.reservar('p2', '09:15', 30)).toEqual({ ok: false, motivo: 'solapamiento' })`,
    },
    {
      name: 'Una cita que empieza justo cuando acaba la anterior sí cabe',
      code: `const agenda = new Agenda()
    agenda.agregarPaciente({ id: 'p1', nombre: 'Ana' })
    agenda.reservar('p1', '09:00', 30)
    expect(agenda.reservar('p1', '09:30', 30).ok).toBe(true)`,
    },
    {
      name: 'Cancelar una cita libera su hueco',
      code: `const agenda = new Agenda()
    agenda.agregarPaciente({ id: 'p1', nombre: 'Ana' })
    agenda.reservar('p1', '09:00', 30)
    agenda.cancelar('c1')
    expect(agenda.reservar('p1', '09:00', 30).ok).toBe(true)`,
    },
    {
      name: 'Confirmar solo funciona sobre una cita pendiente',
      code: `const agenda = new Agenda()
    agenda.agregarPaciente({ id: 'p1', nombre: 'Ana' })
    agenda.reservar('p1', '09:00', 30)
    expect(agenda.confirmar('c1')).toBe(true)
    expect(agenda.confirmar('c1')).toBe(false)
    expect(agenda.confirmar('c99')).toBe(false)`,
    },
    {
      name: 'Cancelar dos veces la misma cita devuelve false la segunda',
      code: `const agenda = new Agenda()
    agenda.agregarPaciente({ id: 'p1', nombre: 'Ana' })
    agenda.reservar('p1', '09:00', 30)
    expect(agenda.cancelar('c1')).toBe(true)
    expect(agenda.cancelar('c1')).toBe(false)`,
    },
    {
      name: 'citasDe devuelve solo las del paciente, en orden',
      code: `const agenda = new Agenda()
    agenda.agregarPaciente({ id: 'p1', nombre: 'Ana' })
    agenda.agregarPaciente({ id: 'p2', nombre: 'Luis' })
    agenda.reservar('p1', '09:00', 30)
    agenda.reservar('p2', '10:00', 30)
    agenda.reservar('p1', '11:00', 30)
    expect(agenda.citasDe('p1').map((cita) => cita.inicio)).toEqual(['09:00', '11:00'])
    expect(agenda.citasDe('p3')).toEqual([])`,
    },
    {
      name: 'El resumen incluye siempre los tres estados',
      code: `const agenda = new Agenda()
    agenda.agregarPaciente({ id: 'p1', nombre: 'Ana' })
    agenda.reservar('p1', '09:00', 30)
    agenda.reservar('p1', '10:00', 30)
    agenda.reservar('p1', '11:00', 30)
    agenda.confirmar('c1')
    agenda.cancelar('c2')
    expect(agenda.resumen()).toEqual({ pendiente: 1, confirmada: 1, cancelada: 1 })`,
    },
    {
      name: 'minutosOcupados no cuenta las citas canceladas',
      code: `const agenda = new Agenda()
    agenda.agregarPaciente({ id: 'p1', nombre: 'Ana' })
    agenda.reservar('p1', '09:00', 30)
    agenda.reservar('p1', '10:00', 45)
    agenda.cancelar('c2')
    expect(agenda.minutosOcupados()).toBe(30)`,
    },
    {
      name: 'importarPacientes añade solo los que faltan y devuelve cuántos',
      code: `const agenda = new Agenda()
    agenda.agregarPaciente({ id: 'p1', nombre: 'Ana' })
    const cargar = async () => [
      { id: 'p1', nombre: 'Ana' },
      { id: 'p2', nombre: 'Luis' },
      { id: 'p3', nombre: 'Zoe' },
    ]
    expect(await agenda.importarPacientes(cargar)).toBe(2)
    expect(agenda.reservar('p3', '09:00', 30).ok).toBe(true)`,
    },
    {
      name: 'Si la carga falla, el error sale de importarPacientes',
      code: `const agenda = new Agenda()
    const cargar = async (): Promise<Paciente[]> => {
      throw new Error('sin conexion')
    }
    let mensaje = ''
    try {
      await agenda.importarPacientes(cargar)
    } catch (error) {
      mensaje = error instanceof Error ? error.message : String(error)
    }
    expect(mensaje).toBe('sin conexion')`,
    },
  ],
}
