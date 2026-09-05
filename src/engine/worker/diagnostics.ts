/**
 * Plain-Spanish explanations for the TypeScript error codes a beginner hits
 * most often. The compiler message (English) is always kept; the hint is shown
 * underneath it.
 */
const HINTS: Record<number, string> = {
  1005: 'Falta un simbolo de puntuacion. Revisa comas, parentesis y llaves sin cerrar.',
  1109: 'Se esperaba una expresion. Suele ser un operador suelto o una linea a medias.',
  1128: 'Se esperaba una declaracion. Revisa si te sobra o falta una llave.',
  1148: 'Aqui no se usan modulos: escribe las funciones directamente, sin import ni export.',
  2304: 'Ese nombre no existe. Comprueba que lo has declarado y que esta escrito igual (mayusculas incluidas).',
  2322: 'El valor no encaja con el tipo declarado. Revisa la anotacion de tipo o el valor que asignas.',
  2339: 'Esa propiedad no existe en el tipo. Comprueba el nombre o amplia la interfaz.',
  2345: 'El argumento no encaja con el parametro que espera la funcion.',
  2349: 'Estas llamando a algo que no es una funcion.',
  2355: 'La funcion declara que devuelve un valor, pero hay caminos que no llegan a ningun return.',
  2366: 'Falta un return en alguna rama de la funcion (por ejemplo, en el else).',
  2451: 'Ya existe una variable con ese nombre en el mismo bloque.',
  2531: 'El valor puede ser null. Comprueba antes de usarlo.',
  2551: 'Esa propiedad no existe; probablemente sea una errata en el nombre.',
  2554: 'Numero de argumentos incorrecto: revisa cuantos parametros pide la funcion.',
  2571: 'El valor es de tipo unknown: hay que comprobar su tipo antes de usarlo.',
  7006: 'Falta anotar el tipo del parametro; en modo estricto no se permite un any implicito.',
  7053: 'No se puede indexar ese objeto con una clave arbitraria sin declarar un index signature.',
  18047: 'El valor puede ser null. Comprueba antes de usarlo.',
  18048: 'El valor puede ser undefined. Comprueba antes de usarlo.',
}

export function friendlyHint(code: number): string | undefined {
  return HINTS[code]
}
