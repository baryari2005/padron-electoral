export type FaqItem = {
  id: number;
  question: string;
  answer: string; // ← string, NO ReactMarkdown
};

export const faqs: FaqItem[] = [
  {
    id: 1,
    question: "¿Para qué sirve el campo Orden en Cargo Político?",
    answer: `**Finalidad:** define la prioridad de visualización de los cargos en listados, combos y reportes. Un número más chico = aparece antes.

**Regla de ordenado:**
1) Primero por **orden** (ascendente)
2) A igualdad de orden, por **nombre** (A–Z)

**Sin orden:** se muestra después de los que sí tienen orden y se ordena por nombre.

**Validación:** entero positivo (≥ 1). No se permiten 0 ni negativos. Puede dejarse vacío si no se requiere prioridad.

**Borrado lógico / reactivación:** si un cargo existía y fue borrado lógicamente, al reactivarlo (deletedAt = NULL) se **conserva** su orden anterior. Opcionalmente se puede actualizar.

**Buenas prácticas:**
- Dejá “saltos” (p. ej. 10, 20, 30) para insertar cargos entre medio.
- Evitá empates de orden; si los hay, se desempata por nombre (A–Z).
- Definí una convención interna (p. ej. “cargos más usados → orden más bajo”).

**Impacta en:**
- Listados de cargos, selectores/combos y reportes.
- Endpoints GET que devuelven datos ordenados por **orden asc** y **nombre asc**.

**Ejemplo:** 1 - Presidente, 10 - Senadores, 20 - Diputados, 30 - Concejales (quedan espacios para insertar otros cargos).`,
  },
  {
    id: 2,
    question: "¿Qué hace el módulo de Importación del Padrón?",
    answer: `Es el “puente” entre tu archivo de padrón (.xlsx/.xls) y la base de datos. Se encarga de leer, limpiar y cargar la info a máxima velocidad y con controles para evitar líos.

Cómo trabaja, en criollo:

Lee tu archivo y normaliza campos (mayúsculas, espacios, ceros a la izquierda, etc.).

Construye y persiste las tablas maestras en este orden:
Circuitos → Establecimientos → Mesas → Padrón Electoral.

Evita duplicados usando claves únicas (p. ej. circuito por código; mesa por (establecimientoId, número); padrón por (númeroMatricula, establecimientoId)).

Procesa por lotes (batch) para que puedas subir cientos de miles de filas sin que explote nada.

Muestra progreso y resumen: filas importadas, nuevos circuitos/establecimientos/mesas, y una lista descargable de errores de validación.

Dos modos de importación (vos elegís):

Agregar (append) ➜ suma registros nuevos sin borrar lo existente. Si encuentra duplicados (según claves únicas), los salta sin romper. Ideal para cargas incrementales.

Reemplazar (replace) ➜ vacía las tablas del padrón y maestras relacionadas y reconstruye todo desde cero. Es la opción “limpia y rápida” para un reseteo total.

Qué no hace (a propósito):

No recalcula estadísticas automáticamente al terminar; eso vive en el módulo de estadísticas (abajo) para que controles cuándo correrlo.`
  },
  {
    id: 3,
    question: "¿Qué hace el módulo de Estadísticas?",
    answer: `Toma los datos ya cargados y calcula resúmenes listos para consultar. Pensalo como el “tablero de control” del padrón.

Qué calcula:

MesaStats: padrón total por mesa.

EstablecimientoStats: padrón total y cantidad de mesas por establecimiento.

CircuitoStats: padrón total y cantidad de mesas por circuito.

GlobalStats: totales globales (personas en padrón, mesas totales, etc.).
Cada tabla guarda su updatedAt para saber cuándo se refrescó.

Cómo se ejecuta:

Lo corrés desde su formulario/acción dedicada.

No modifica tus datos maestros; solo lee y escribe los agregados.

Es idempotente: podés ejecutarlo las veces que quieras (por ejemplo, después de cada importación o cuando agregás nuevas mesas).

Qué ves al finalizar:

Un resumen con la cantidad de filas calculadas por nivel (mesas/establecimientos/circuitos/global) y tiempos de ejecución.

Si algo no cierra (p. ej. una mesa sin establecimiento), el resumen te lo marca para que lo revises.

Cuándo conviene correrlo:

Siempre que hagas una importación (append o replace).

Tras correcciones manuales en mesas/establecimientos/circuitos. `
  }
];