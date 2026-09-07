import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import javax.tools.Diagnostic;
import javax.tools.DiagnosticCollector;
import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Local compile-and-run service for the Java track of CodeLab.
 *
 * Se arranca con un solo comando y sin dependencias:
 *   java backend/CodeLabServer.java
 *
 * Escucha SOLO en 127.0.0.1 a proposito: compila y ejecuta codigo, asi que no
 * debe quedar expuesto fuera de este equipo.
 */
public class CodeLabServer {

    private static final int PUERTO = 8099;
    /** Un ejercicio que no termina en este tiempo se considera colgado. */
    private static final long TIMEOUT_SEGUNDOS = 8;
    /** Separador de los campos que el proceso hijo escribe por su salida. */
    static final String SEP = "|::|";

    public static void main(String[] args) throws IOException {
        if (ToolProvider.getSystemJavaCompiler() == null) {
            System.err.println("No hay compilador disponible: arranca esto con un JDK, no con un JRE.");
            System.exit(1);
        }

        HttpServer servidor = HttpServer.create(
                new InetSocketAddress(InetAddress.getLoopbackAddress(), PUERTO), 0);
        servidor.createContext("/api/run", CodeLabServer::manejarEjecucion);
        servidor.createContext("/api/salud", intercambio -> responder(intercambio, 200, "{\"ok\":true}"));
        servidor.setExecutor(java.util.concurrent.Executors.newFixedThreadPool(2));
        servidor.start();

        System.out.println("CodeLab (Java) escuchando en http://localhost:" + PUERTO);
        System.out.println("Deja esta ventana abierta mientras practicas.");
    }

    // ---------------------------------------------------------------- HTTP

    private static void manejarEjecucion(HttpExchange intercambio) throws IOException {
        if ("OPTIONS".equals(intercambio.getRequestMethod())) {
            // El preflight se responde sin cuerpo, pero necesita las cabeceras.
            cabecerasCors(intercambio);
            intercambio.sendResponseHeaders(204, -1);
            intercambio.close();
            return;
        }
        if (!"POST".equals(intercambio.getRequestMethod())) {
            responder(intercambio, 405, "{\"error\":\"Usa POST\"}");
            return;
        }

        try {
            String cuerpo = new String(intercambio.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            Map<String, Object> peticion = Json.comoMapa(Json.parse(cuerpo));

            String fuente = String.valueOf(peticion.getOrDefault("source", ""));
            List<Object> pruebas = Json.comoLista(peticion.get("tests"));

            responder(intercambio, 200, Json.write(Ejecucion.ejecutar(fuente, pruebas, TIMEOUT_SEGUNDOS)));
        } catch (Exception e) {
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("fatal", "El servicio no pudo procesar la peticion: " + e);
            responder(intercambio, 200, Json.write(error));
        }
    }

    private static void cabecerasCors(HttpExchange intercambio) {
        // La aplicacion se sirve desde otro puerto (Vite) o desde Vercel.
        intercambio.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        intercambio.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
        intercambio.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");
    }

    private static void responder(HttpExchange intercambio, int codigo, String cuerpo) throws IOException {
        cabecerasCors(intercambio);
        byte[] datos = cuerpo.getBytes(StandardCharsets.UTF_8);
        intercambio.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
        intercambio.sendResponseHeaders(codigo, datos.length);
        try (OutputStream salida = intercambio.getResponseBody()) {
            salida.write(datos);
        }
    }
}

/**
 * Compiles the student's source together with a generated test class, then runs
 * the tests in a child process so a hung exercise can be killed.
 */
class Ejecucion {

    static Map<String, Object> ejecutar(String fuente, List<Object> pruebas, long timeoutSegundos) {
        Map<String, Object> respuesta = new LinkedHashMap<>();
        List<Object> diagnosticos = new ArrayList<>();
        List<Object> resultados = new ArrayList<>();
        List<Object> registros = new ArrayList<>();

        Path carpeta = null;
        try {
            carpeta = Files.createTempDirectory("codelab-java-");
            String claseAlumno = nombreDeClase(fuente);

            Path ficheroAlumno = carpeta.resolve(claseAlumno + ".java");
            Path ficheroPruebas = carpeta.resolve("Pruebas.java");
            Files.writeString(ficheroAlumno, fuente, StandardCharsets.UTF_8);
            Files.writeString(ficheroPruebas, Generador.pruebas(pruebas), StandardCharsets.UTF_8);

            diagnosticos.addAll(compilar(carpeta, ficheroAlumno, ficheroPruebas, claseAlumno));

            boolean hayErrores = diagnosticos.stream()
                    .anyMatch(d -> "error".equals(Json.comoMapa(d).get("severity")));

            if (!hayErrores) {
                Salida salida = correr(carpeta, timeoutSegundos);
                if (salida.fatal != null) {
                    respuesta.put("fatal", salida.fatal);
                }
                resultados.addAll(salida.resultados);
                registros.addAll(salida.registros);
            }
        } catch (Exception e) {
            respuesta.put("fatal", "Fallo interno del servicio: " + e);
        } finally {
            borrar(carpeta);
        }

        respuesta.put("diagnostics", diagnosticos);
        respuesta.put("tests", resultados);
        respuesta.put("logs", registros);
        return respuesta;
    }

    /**
     * El fichero tiene que llamarse como la clase publica que contiene, asi que
     * hay que averiguar su nombre antes de escribirlo en disco.
     */
    private static String nombreDeClase(String fuente) {
        String plano = fuente.replace((char) 10, ' ').replace((char) 13, ' ').replace((char) 9, ' ');
        List<String> palabras = new ArrayList<>();
        for (String palabra : plano.split(" ")) {
            if (!palabra.isBlank()) palabras.add(palabra.strip());
        }

        for (int i = 0; i < palabras.size() - 1; i++) {
            if (!"public".equals(palabras.get(i))) continue;

            // Entre public y el tipo pueden colarse final o abstract.
            int j = i + 1;
            while (j < palabras.size() - 1
                    && ("final".equals(palabras.get(j)) || "abstract".equals(palabras.get(j)))) {
                j++;
            }

            String tipo = palabras.get(j);
            boolean esTipo = "class".equals(tipo) || "interface".equals(tipo)
                    || "enum".equals(tipo) || "record".equals(tipo);
            if (!esTipo || j + 1 >= palabras.size()) continue;

            String nombre = palabras.get(j + 1);
            int corte = nombre.length();
            for (char limite : new char[] {'{', '(', '<'}) {
                int posicion = nombre.indexOf(limite);
                if (posicion >= 0) corte = Math.min(corte, posicion);
            }
            String limpio = nombre.substring(0, corte);
            if (!limpio.isEmpty()) return limpio;
        }
        return "Solucion";
    }

    // ---------------------------------------------------------- compilacion

    private static List<Object> compilar(Path carpeta, Path alumno, Path pruebas, String claseAlumno) {
        JavaCompiler compilador = ToolProvider.getSystemJavaCompiler();
        DiagnosticCollector<JavaFileObject> recogidos = new DiagnosticCollector<>();

        try (StandardJavaFileManager gestor = compilador.getStandardFileManager(recogidos, null, StandardCharsets.UTF_8)) {
            Iterable<? extends JavaFileObject> unidades =
                    gestor.getJavaFileObjectsFromFiles(List.of(alumno.toFile(), pruebas.toFile()));

            List<String> opciones = List.of("-d", carpeta.toString(), "-encoding", "UTF-8");
            compilador.getTask(null, gestor, recogidos, opciones, null, unidades).call();
        } catch (IOException e) {
            // Si el gestor de ficheros falla, los diagnosticos recogidos siguen valiendo.
        }

        List<Object> salida = new ArrayList<>();
        for (Diagnostic<? extends JavaFileObject> diagnostico : recogidos.getDiagnostics()) {
            String fichero = diagnostico.getSource() == null ? "" : diagnostico.getSource().getName();
            boolean esDelAlumno = fichero.endsWith(claseAlumno + ".java");

            Map<String, Object> mapa = new LinkedHashMap<>();
            mapa.put("origin", esDelAlumno ? "solution" : "tests");
            mapa.put("severity", diagnostico.getKind() == Diagnostic.Kind.ERROR ? "error" : "warning");
            mapa.put("line", (double) Math.max(1, diagnostico.getLineNumber()));
            mapa.put("column", (double) Math.max(1, diagnostico.getColumnNumber()));
            mapa.put("message", diagnostico.getMessage(java.util.Locale.getDefault()));
            salida.add(mapa);
        }
        // Primero lo del alumno: es donde puede arreglarlo.
        salida.sort(Comparator.comparing(d -> "solution".equals(Json.comoMapa(d).get("origin")) ? 0 : 1));
        return salida;
    }

    // ---------------------------------------------------------- ejecucion

    private record Salida(List<Object> resultados, List<Object> registros, String fatal) {}

    private static Salida correr(Path carpeta, long timeoutSegundos) throws Exception {
        ProcessBuilder constructor = new ProcessBuilder(
                javaEjecutable(), "-cp", carpeta.toString(), "Pruebas");
        constructor.redirectErrorStream(true);

        Process proceso = constructor.start();
        List<Object> resultados = new ArrayList<>();
        List<Object> registros = new ArrayList<>();
        StringBuilder crudo = new StringBuilder();

        Thread lector = new Thread(() -> {
            try (var entrada = proceso.getInputStream()) {
                crudo.append(new String(entrada.readAllBytes(), StandardCharsets.UTF_8));
            } catch (IOException ignorado) {
                // El proceso se ha matado por timeout: lo leido basta.
            }
        });
        lector.start();

        if (!proceso.waitFor(timeoutSegundos, TimeUnit.SECONDS)) {
            proceso.destroyForcibly();
            lector.join(1000);
            return new Salida(resultados, registros,
                    "La ejecucion tardo demasiado y se detuvo. Suele ser un bucle sin condicion de salida.");
        }
        lector.join(2000);

        for (String linea : crudo.toString().split("\n")) {
            String texto = linea.strip();
            if (texto.isEmpty()) continue;

            if (texto.startsWith("R" + CodeLabServer.SEP)) {
                String[] partes = texto.split(java.util.regex.Pattern.quote(CodeLabServer.SEP), -1);
                Map<String, Object> resultado = new LinkedHashMap<>();
                resultado.put("status", partes.length > 1 ? partes[1] : "error");
                resultado.put("name", partes.length > 2 ? partes[2] : "");
                resultado.put("message", partes.length > 3 ? partes[3] : "");
                resultados.add(resultado);
            } else if (texto.startsWith("L" + CodeLabServer.SEP)) {
                registros.add(texto.substring(("L" + CodeLabServer.SEP).length()));
            } else {
                registros.add(texto);
            }
        }
        return new Salida(resultados, registros, null);
    }

    private static String javaEjecutable() {
        return Path.of(System.getProperty("java.home"), "bin", "java").toString();
    }

    private static void borrar(Path carpeta) {
        if (carpeta == null) return;
        try (var rutas = Files.walk(carpeta)) {
            rutas.sorted(Comparator.reverseOrder()).forEach(ruta -> {
                try {
                    Files.deleteIfExists(ruta);
                } catch (IOException ignorado) {
                    // Windows a veces retiene el fichero: el temporal se limpiara solo.
                }
            });
        } catch (IOException ignorado) {
            // Nada que hacer: es un directorio temporal.
        }
    }
}

/** Builds the `Pruebas.java` that wraps each exercise assertion in its own try. */
class Generador {

    static String pruebas(List<Object> pruebas) {
        StringBuilder llamadas = new StringBuilder();
        for (Object prueba : pruebas) {
            Map<String, Object> mapa = Json.comoMapa(prueba);
            String nombre = String.valueOf(mapa.getOrDefault("name", "prueba"));
            String codigo = String.valueOf(mapa.getOrDefault("code", ""));

            llamadas.append("        ejecutar(").append(Json.texto(nombre)).append(", () -> {").append(salto());
            llamadas.append(codigo).append(salto());
            llamadas.append("        });").append(salto());
        }
        return CABECERA.replace("/*LLAMADAS*/", llamadas.toString());
    }

    private static String salto() {
        return String.valueOf((char) 10);
    }

    private static final String CABECERA = """
import java.util.*;

public class Pruebas {

    static final String SEP = "|::|";
    static final List<String> resultados = new ArrayList<>();

    interface Prueba { void correr() throws Exception; }

    public static void main(String[] args) throws Exception {
        java.io.ByteArrayOutputStream capturado = new java.io.ByteArrayOutputStream();
        java.io.PrintStream original = System.out;
        System.setOut(new java.io.PrintStream(capturado, true, java.nio.charset.StandardCharsets.UTF_8));

/*LLAMADAS*/

        System.out.flush();
        System.setOut(original);

        for (String linea : resultados) {
            System.out.println("R" + SEP + linea);
        }
        String texto = capturado.toString(java.nio.charset.StandardCharsets.UTF_8);
        for (String linea : texto.split(String.valueOf((char) 10))) {
            if (!linea.isBlank()) System.out.println("L" + SEP + linea.strip());
        }
    }

    static void ejecutar(String nombre, Prueba prueba) {
        try {
            prueba.correr();
            resultados.add("pass" + SEP + nombre + SEP + "");
        } catch (AssertionError e) {
            resultados.add("fail" + SEP + nombre + SEP + limpiar(e.getMessage()));
        } catch (Throwable e) {
            resultados.add("error" + SEP + nombre + SEP + limpiar(String.valueOf(e)));
        }
    }

    static String limpiar(String texto) {
        if (texto == null) return "";
        return texto.replace((char) 13, ' ').replace((char) 10, ' ').replace(SEP, " ");
    }

    static String mostrar(Object valor) {
        if (valor == null) return "null";
        if (valor instanceof String) return String.valueOf((char) 34) + valor + (char) 34;
        return String.valueOf(valor);
    }

    // ----- aserciones disponibles en los tests -----

    static void assertEquals(Object esperado, Object real) {
        if (!Objects.equals(esperado, real)) {
            throw new AssertionError("Esperaba " + mostrar(esperado) + " pero recibi " + mostrar(real));
        }
    }

    static void assertEquals(long esperado, long real) {
        if (esperado != real) {
            throw new AssertionError("Esperaba " + esperado + " pero recibi " + real);
        }
    }

    static void assertEquals(double esperado, double real, double tolerancia) {
        if (Math.abs(esperado - real) > tolerancia) {
            throw new AssertionError("Esperaba " + esperado + " pero recibi " + real);
        }
    }

    static void assertTrue(boolean condicion) {
        if (!condicion) throw new AssertionError("Esperaba que la condicion fuese cierta");
    }

    static void assertFalse(boolean condicion) {
        if (condicion) throw new AssertionError("Esperaba que la condicion fuese falsa");
    }

    static void assertNull(Object valor) {
        if (valor != null) throw new AssertionError("Esperaba null pero recibi " + mostrar(valor));
    }

    static void assertNotNull(Object valor) {
        if (valor == null) throw new AssertionError("Esperaba un valor y he recibido null");
    }

    static void assertThrows(Class<? extends Throwable> tipo, Prueba accion) {
        try {
            accion.correr();
        } catch (Throwable e) {
            if (tipo.isInstance(e)) return;
            throw new AssertionError("Esperaba " + tipo.getSimpleName() + " pero salto " + e.getClass().getSimpleName());
        }
        throw new AssertionError("Esperaba que lanzase " + tipo.getSimpleName() + " y no lanzo nada");
    }
}
""";
}

/**
 * Minimal JSON reader and writer. El servicio intercambia objetos muy simples,
 * asi que no merece la pena arrastrar una dependencia solo para esto.
 */
final class Json {

    private static final char COMILLA = (char) 34;
    private static final char BARRA = (char) 92;

    private final String texto;
    private int posicion;

    private Json(String texto) {
        this.texto = texto;
    }

    // ------------------------------------------------------------- lectura

    static Object parse(String texto) {
        Json lector = new Json(texto);
        lector.espacios();
        return lector.valor();
    }

    private Object valor() {
        espacios();
        if (posicion >= texto.length()) return null;

        char actual = texto.charAt(posicion);
        if (actual == '{') return objeto();
        if (actual == '[') return lista();
        if (actual == COMILLA) return cadena();
        if (texto.startsWith("true", posicion)) { posicion += 4; return Boolean.TRUE; }
        if (texto.startsWith("false", posicion)) { posicion += 5; return Boolean.FALSE; }
        if (texto.startsWith("null", posicion)) { posicion += 4; return null; }
        return numero();
    }

    private Map<String, Object> objeto() {
        Map<String, Object> mapa = new LinkedHashMap<>();
        posicion++;
        espacios();
        if (posicion < texto.length() && texto.charAt(posicion) == '}') {
            posicion++;
            return mapa;
        }
        while (posicion < texto.length()) {
            espacios();
            String clave = cadena();
            espacios();
            posicion++; // los dos puntos
            mapa.put(clave, valor());
            espacios();
            char siguiente = texto.charAt(posicion++);
            if (siguiente == '}') break;
        }
        return mapa;
    }

    private List<Object> lista() {
        List<Object> elementos = new ArrayList<>();
        posicion++;
        espacios();
        if (posicion < texto.length() && texto.charAt(posicion) == ']') {
            posicion++;
            return elementos;
        }
        while (posicion < texto.length()) {
            elementos.add(valor());
            espacios();
            char siguiente = texto.charAt(posicion++);
            if (siguiente == ']') break;
        }
        return elementos;
    }

    private String cadena() {
        StringBuilder salida = new StringBuilder();
        posicion++; // la comilla de apertura
        while (posicion < texto.length()) {
            char actual = texto.charAt(posicion++);
            if (actual == COMILLA) break;

            if (actual != BARRA) {
                salida.append(actual);
                continue;
            }
            char escapado = texto.charAt(posicion++);
            switch (escapado) {
                case 'n' -> salida.append((char) 10);
                case 'r' -> salida.append((char) 13);
                case 't' -> salida.append((char) 9);
                case 'b' -> salida.append((char) 8);
                case 'f' -> salida.append((char) 12);
                case 'u' -> {
                    salida.append((char) Integer.parseInt(texto.substring(posicion, posicion + 4), 16));
                    posicion += 4;
                }
                default -> salida.append(escapado);
            }
        }
        return salida.toString();
    }

    private Double numero() {
        int inicio = posicion;
        while (posicion < texto.length() && "-+.eE0123456789".indexOf(texto.charAt(posicion)) >= 0) {
            posicion++;
        }
        return Double.valueOf(texto.substring(inicio, posicion));
    }

    private void espacios() {
        while (posicion < texto.length() && Character.isWhitespace(texto.charAt(posicion))) {
            posicion++;
        }
    }

    // ------------------------------------------------------------ escritura

    static String write(Object valor) {
        if (valor == null) return "null";
        if (valor instanceof String cadena) return texto(cadena);
        if (valor instanceof Boolean booleano) return booleano.toString();
        if (valor instanceof Number numero) {
            double doble = numero.doubleValue();
            return doble == Math.rint(doble) && !Double.isInfinite(doble)
                    ? String.valueOf((long) doble)
                    : String.valueOf(doble);
        }
        if (valor instanceof Map<?, ?> mapa) {
            StringBuilder salida = new StringBuilder("{");
            boolean primero = true;
            for (Map.Entry<?, ?> entrada : mapa.entrySet()) {
                if (!primero) salida.append(',');
                salida.append(texto(String.valueOf(entrada.getKey()))).append(':').append(write(entrada.getValue()));
                primero = false;
            }
            return salida.append('}').toString();
        }
        if (valor instanceof Iterable<?> elementos) {
            StringBuilder salida = new StringBuilder("[");
            boolean primero = true;
            for (Object elemento : elementos) {
                if (!primero) salida.append(',');
                salida.append(write(elemento));
                primero = false;
            }
            return salida.append(']').toString();
        }
        return texto(String.valueOf(valor));
    }

    /** Escribe una cadena como literal JSON, con sus escapes. */
    static String texto(String valor) {
        StringBuilder salida = new StringBuilder();
        salida.append(COMILLA);
        for (char actual : valor.toCharArray()) {
            if (actual == COMILLA || actual == BARRA) {
                salida.append(BARRA).append(actual);
            } else if (actual == (char) 10) {
                salida.append(BARRA).append('n');
            } else if (actual == (char) 13) {
                salida.append(BARRA).append('r');
            } else if (actual == (char) 9) {
                salida.append(BARRA).append('t');
            } else if (actual < 32) {
                salida.append(BARRA).append('u').append(String.format("%04x", (int) actual));
            } else {
                salida.append(actual);
            }
        }
        return salida.append(COMILLA).toString();
    }

    @SuppressWarnings("unchecked")
    static Map<String, Object> comoMapa(Object valor) {
        return valor instanceof Map ? (Map<String, Object>) valor : new LinkedHashMap<>();
    }

    @SuppressWarnings("unchecked")
    static List<Object> comoLista(Object valor) {
        return valor instanceof List ? (List<Object>) valor : new ArrayList<>();
    }
}
