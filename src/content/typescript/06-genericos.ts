import type { Exercise } from '@/types/exercise'

export const exercise: Exercise = {
  id: 'ts-06-genericos',
  language: 'typescript',
  title: 'Genéricos y funciones como parámetro',
  difficulty: 3,
  concepts: ['genéricos', 'callbacks', 'Record', 'acumuladores'],
  theory: `## Genéricos

Un genérico es un tipo que rellena quien llama a la función. Se declara entre \`< >\`:

~~~ts
function primero<T>(items: T[]): T | undefined {
  return items[0]
}

primero([1, 2, 3])       // number | undefined
primero(['a', 'b'])      // string | undefined
~~~

Sin genéricos tendrías que escribir la misma función una vez por tipo, o usar \`any\`
y perder toda la seguridad.

## Funciones como parámetro

El tipo de una función se escribe con una flecha:

~~~ts
function aplicar<T>(valor: T, transformar: (entrada: T) => string): string {
  return transformar(valor)
}
~~~

## Record

\`Record<string, T>\` es un objeto cuyas claves son textos y cuyos valores son de tipo \`T\`:

~~~ts
const edades: Record<string, number> = { ana: 30, luis: 45 }
~~~

## Restringir un genérico

\`extends\` limita qué tipos se aceptan, y a cambio te deja usar lo que tienen en común:

~~~ts
function nombreDe<T extends { nombre: string }>(item: T): string {
  return item.nombre
}
~~~

## Errores típicos

- Recurrir a \`any\` para que compile: pierdes toda la ayuda del compilador. Un genérico da la misma flexibilidad sin perderla.
- Declarar \`<T>\` y no usarlo en ningún parámetro: entonces no hay de dónde deducirlo.
- Olvidar inicializar el acumulador antes del bucle, o inicializarlo dentro (se reinicia en cada vuelta).`,
  brief: `Implementa \`agrupar\`, una función genérica que reparte los elementos de un array en
grupos según la clave que devuelva la función que recibe.

~~~ts
agrupar([1, 2, 3, 4], (n) => (n % 2 === 0 ? 'par' : 'impar'))
// { impar: [1, 3], par: [2, 4] }
~~~

Reglas:
- Los grupos deben aparecer en el **orden en que se descubren** al recorrer el array.
- Dentro de cada grupo se mantiene el orden original.
- Con un array vacío devuelve un objeto vacío.`,
  starterCode: `function agrupar<T>(items: T[], clave: (item: T) => string): Record<string, T[]> {
  return {}
}
`,
  solution: `function agrupar<T>(items: T[], clave: (item: T) => string): Record<string, T[]> {
  const grupos: Record<string, T[]> = {}

  for (const item of items) {
    const nombre = clave(item)
    if (!grupos[nombre]) {
      grupos[nombre] = []
    }
    grupos[nombre].push(item)
  }

  return grupos
}
`,
  hints: [
    'Crea el objeto acumulador antes del bucle: const grupos: Record<string, T[]> = {}.',
    'Antes de hacer push comprueba si la clave ya existe; si no, inicialízala con [].',
    'clave(item) te devuelve el nombre del grupo: úsalo como índice del objeto.',
  ],
  tests: [
    {
      name: 'Agrupa números en pares e impares',
      code: `const grupos = agrupar([1, 2, 3, 4], (n) => (n % 2 === 0 ? 'par' : 'impar'))
    expect(grupos).toEqual({ impar: [1, 3], par: [2, 4] })`,
    },
    {
      name: 'Agrupa objetos por una propiedad',
      code: `const personas = [
      { nombre: 'Ana', ciudad: 'Valencia' },
      { nombre: 'Luis', ciudad: 'Madrid' },
      { nombre: 'Zoe', ciudad: 'Valencia' },
    ]
    const porCiudad = agrupar(personas, (p) => p.ciudad)
    expect(Object.keys(porCiudad)).toEqual(['Valencia', 'Madrid'])
    expect(porCiudad.Valencia).toHaveLength(2)`,
    },
    {
      name: 'Devuelve un objeto vacío si no hay elementos',
      code: `expect(agrupar<string>([], (texto) => texto)).toEqual({})`,
    },
    {
      name: 'Mantiene el orden original dentro de cada grupo',
      code: `const grupos = agrupar(['ana', 'luis', 'alba'], (n) => n[0])
    expect(grupos.a).toEqual(['ana', 'alba'])`,
    },
  ],
}
