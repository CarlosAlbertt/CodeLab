/**
 * Test harness injected around the student's code.
 *
 * `HARNESS_DTS` is fed to the TypeScript program so the checker knows about
 * `console` and `expect` (the ES2020 lib alone has neither). `RUNTIME_PRELUDE`
 * and `RUNTIME_EPILOGUE` are plain JavaScript concatenated around the emitted
 * output at execution time — the compiler never sees them.
 */

export const HARNESS_DTS = `
declare const console: {
  log(...data: unknown[]): void
  info(...data: unknown[]): void
  warn(...data: unknown[]): void
  error(...data: unknown[]): void
}

interface CodeLabMatchers {
  /** Igualdad estricta (===). Para objetos y arrays usa toEqual. */
  toBe(expected: unknown): void
  /** Igualdad profunda: compara el contenido de objetos y arrays. */
  toEqual(expected: unknown): void
  /** Igualdad de numeros con decimales. */
  toBeCloseTo(expected: number, digits?: number): void
  toBeTruthy(): void
  toBeFalsy(): void
  /** El array o string contiene el elemento indicado. */
  toContain(item: unknown): void
  toHaveLength(length: number): void
  /** El valor recibido debe ser una funcion: expect(() => f()).toThrow(). */
  toThrow(message?: string): void
  readonly not: Omit<CodeLabMatchers, 'not'>
}

declare function expect(actual: unknown): CodeLabMatchers
`

export const RUNTIME_PRELUDE = `'use strict';
function __show(v) {
  if (typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'bigint') return v.toString() + 'n';
  if (typeof v === 'function') return '[funcion ' + (v.name || 'anonima') + ']';
  if (v instanceof Error) return v.name + ': ' + v.message;
  try { var s = JSON.stringify(v); return s === undefined ? String(v) : s; }
  catch (e) { return String(v); }
}
function __fail(msg) { var e = new Error(msg); e.__assertion = true; throw e; }
function __deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  var ka = Object.keys(a), kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  for (var i = 0; i < ka.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(b, ka[i])) return false;
    if (!__deepEqual(a[ka[i]], b[ka[i]])) return false;
  }
  return true;
}
function __matchers(actual, negated) {
  function check(pass, msg, negMsg) {
    if (negated ? pass : !pass) __fail(negated ? negMsg : msg);
  }
  var m = {
    toBe: function (expected) {
      check(Object.is(actual, expected),
        'Esperaba ' + __show(expected) + ' pero recibi ' + __show(actual),
        'No esperaba recibir ' + __show(expected));
    },
    toEqual: function (expected) {
      check(__deepEqual(actual, expected),
        'Esperaba ' + __show(expected) + ' pero recibi ' + __show(actual),
        'No esperaba recibir ' + __show(expected));
    },
    toBeCloseTo: function (expected, digits) {
      var d = digits === undefined ? 2 : digits;
      var pass = typeof actual === 'number' && Math.abs(actual - expected) < Math.pow(10, -d) / 2;
      check(pass,
        'Esperaba un numero cercano a ' + __show(expected) + ' pero recibi ' + __show(actual),
        'No esperaba un numero cercano a ' + __show(expected));
    },
    toBeTruthy: function () {
      check(!!actual, 'Esperaba un valor verdadero pero recibi ' + __show(actual), 'Esperaba un valor falso');
    },
    toBeFalsy: function () {
      check(!actual, 'Esperaba un valor falso pero recibi ' + __show(actual), 'Esperaba un valor verdadero');
    },
    toContain: function (item) {
      var pass = false;
      if (typeof actual === 'string') pass = actual.indexOf(item) !== -1;
      else if (Array.isArray(actual)) pass = actual.some(function (x) { return __deepEqual(x, item); });
      else __fail('toContain() solo funciona con strings o arrays, recibi ' + __show(actual));
      check(pass,
        __show(actual) + ' no contiene ' + __show(item),
        __show(actual) + ' no deberia contener ' + __show(item));
    },
    toHaveLength: function (length) {
      var actualLength = actual == null ? undefined : actual.length;
      check(actualLength === length,
        'Esperaba longitud ' + length + ' pero recibi ' + __show(actualLength),
        'No esperaba longitud ' + length);
    },
    toThrow: function (message) {
      if (typeof actual !== 'function') {
        __fail('toThrow() necesita una funcion: expect(() => miFuncion()).toThrow()');
      }
      var threw = false, err = null;
      try { actual(); } catch (e) { threw = true; err = e; }
      var text = err && err.message ? String(err.message) : String(err);
      var pass = threw && (message === undefined || text.indexOf(message) !== -1);
      check(pass,
        threw ? 'Lanzo un error, pero su mensaje (' + __show(text) + ') no contiene ' + __show(message)
              : 'Esperaba que lanzase un error, pero termino sin lanzar nada',
        'Esperaba que no lanzase ningun error');
    }
  };
  if (!negated) {
    Object.defineProperty(m, 'not', { get: function () { return __matchers(actual, true); } });
  }
  return m;
}
function expect(actual) { return __matchers(actual, false); }
var console = {
  log: function () { __out.logs.push(Array.prototype.map.call(arguments, __show).join(' ')); },
  info: function () { console.log.apply(null, arguments); },
  warn: function () { console.log.apply(null, arguments); },
  error: function () { console.log.apply(null, arguments); }
};
`

export const RUNTIME_EPILOGUE = `
for (var __i = 0; __i < __tests.length; __i++) {
  var __t = __tests[__i];
  try {
    await __t.fn();
    __out.results.push({ name: __t.name, status: 'pass' });
  } catch (__e) {
    __out.results.push({
      name: __t.name,
      status: __e && __e.__assertion ? 'fail' : 'error',
      message: __e && __e.message ? String(__e.message) : String(__e)
    });
  }
}
`

/** Builds the generated `tests.ts` file for a set of test cases. */
export function buildTestsSource(tests: { name: string; code: string }[]): string {
  const entries = tests
    .map((t) => `  { name: ${JSON.stringify(t.name)}, fn: async () => {\n${t.code}\n  } },`)
    .join('\n')
  return `const __tests: { name: string; fn: () => Promise<void> }[] = [\n${entries}\n];\n`
}
