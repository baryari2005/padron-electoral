import * as React from "react";

type FAQ = {
  q: string;
  a: React.ReactNode;
  // opcional: para agrupar/filtrar más adelante
  tag?: "Importación" | "Estructura" | "Reportes" | "Permisos" | "Trazabilidad" | "General";
};

export const FAQS: FAQ[] = [
  // Importación y carga de datos
  {
    q: "¿Qué formatos de archivo acepta el sistema para importar el padrón electoral?",
    a: "Archivos Excel (.xlsx) con columnas de circuito, establecimiento, mesa y electores. Respetá encabezados y tipos.",
    tag: "Importación",
  },
  {
    q: "¿Qué hago si mi archivo Excel no se importa correctamente?",
    a: "Verificá que los nombres de columnas coincidan con la estructura esperada. El sistema muestra un log de errores por fila/campo.",
    tag: "Importación",
  },
  {
    q: "¿Puedo cargar más de un padrón en el mismo sistema?",
    a: "Sí. Podés reemplazar (truncar) los datos anteriores o mantenerlos. Recomendamos truncar para evitar inconsistencias.",
    tag: "Importación",
  },
  {
    q: "¿El sistema valida datos duplicados al importar?",
    a: "Sí. Se usan claves compuestas (por ejemplo, mesa + establecimiento) para prevenir duplicados. Los registros conflictivos se descartan con alerta.",
    tag: "Importación",
  },
  {
    q: "¿Qué pasa si vuelvo a importar y ya hay datos?",
    a: "Podés truncar (borrar) lo previo o coexistir. Para consistencia, lo ideal es truncar antes de una importación completa.",
    tag: "Importación",
  },

  // Gestión
  {
    q: "¿Cómo agrego manualmente un establecimiento?",
    a: "Desde “Establecimientos” → “Nuevo”. Definí nombre, dirección y mesas asociadas.",
    tag: "Estructura",
  },
  {
    q: "¿Puedo eliminar un circuito o establecimiento?",
    a: "Sí, con borrado lógico. No aparecen en reportes pero queda trazabilidad para auditoría.",
    tag: "Estructura",
  },
  {
    q: "¿Qué sucede si dos establecimientos repiten número de mesa?",
    a: "No hay conflicto: la clave única es (número de mesa + establecimiento).",
    tag: "Estructura",
  },
  {
    q: "¿Se pueden asignar mesas masivamente a un establecimiento?",
    a: "Sí. En el alta/edición podés cargar un rango o lista de mesas.",
    tag: "Estructura",
  },

  // Estadísticas y reportes
  {
    q: "¿Cómo recalculo las estadísticas del padrón?",
    a: "Desde “Estadísticas” → “Recalcular”. Se generan resúmenes por mesa, establecimiento y circuito.",
    tag: "Reportes",
  },
  {
    q: "¿Qué significa la duración del recálculo?",
    a: "Es el tiempo total de procesamiento (en segundos) para generar los resúmenes.",
    tag: "Reportes",
  },
  {
    q: "¿Puedo exportar las estadísticas a Excel o CSV?",
    a: "Sí, hay opciones de exportación para análisis externo.",
    tag: "Reportes",
  },
  {
    q: "El reporte no muestra resultados, ¿qué reviso?",
    a: "Confirmá que el padrón esté importado y que las estadísticas estén recalculadas.",
    tag: "Reportes",
  },
  {
    q: "¿Puedo filtrar reportes por circuito o establecimiento?",
    a: "Sí, los listados permiten filtros combinados por circuito, establecimiento y otros campos.",
    tag: "Reportes",
  },

  // Roles, permisos y usuarios
  {
    q: "¿Cómo funciona el sistema de roles y permisos?",
    a: "Cada usuario tiene un rol con permisos (ver, crear, editar, eliminar) por módulo. Podés ajustar el alcance.",
    tag: "Permisos",
  },
  {
    q: "¿Puedo limitar que un usuario vea solo su localidad?",
    a: "Sí, se puede restringir el acceso por ámbito/geografía.",
    tag: "Permisos",
  },
  {
    q: "¿Cómo cambio la contraseña o el avatar?",
    a: "Desde “Perfil”. Podés editar nombre, contraseña y avatar.",
    tag: "Permisos",
  },
  {
    q: "¿Qué pasa si un usuario elimina info por error?",
    a: "Hay trazabilidad (userId/fechas). Podés auditar quién y cuándo realizó una acción.",
    tag: "Trazabilidad",
  },

  // Otros
  {
    q: "¿Qué pasa si se corta internet durante la importación?",
    a: "El proceso falla y debe reiniciarse. No se guardan datos parciales para mantener consistencia.",
    tag: "General",
  },
  {
    q: "¿El sistema soporta grandes volúmenes?",
    a: "Sí. Maneja cientos de miles de registros con índices y consultas optimizadas.",
    tag: "General",
  },

  // Extras sugeridos
  {
    q: "¿Cómo sé qué usuario cargó un padrón?",
    a: "En el historial/auditoría se registra el userId asociado a las importaciones.",
    tag: "Trazabilidad",
  },
  {
    q: "¿Puedo asignar fiscales a mesas o establecimientos?",
    a: "Sí, mediante formularios específicos de asignación y control.",
    tag: "Estructura",
  },
  {
    q: "¿El sistema controla votos especiales (blanco, nulo, impugnado)?",
    a: "Sí. Se cargan por categoría, con validaciones y aparecen en reportes.",
    tag: "Reportes",
  },
  {
    q: "¿Puedo editar resultados de mesa luego del escrutinio?",
    a: "Sí, con permisos de edición. Queda traza de quién modificó.",
    tag: "Permisos",
  },
  {
    q: "¿Diferencia entre resumen por mesa y por establecimiento?",
    a: "Mesa: detalle por mesa. Establecimiento: totales agregados de todas sus mesas.",
    tag: "Reportes",
  },
];
