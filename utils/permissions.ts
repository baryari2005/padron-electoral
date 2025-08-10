// utils/permissions.ts

export const MODULOS = [
    "usuarios",
    "circuitos",
    "establecimientos",
    "agrupaciones",
    "mesas",
    "categorias",
    "votantes",
    "reportes",
    "estadoelector",
] as const;

export const ACCIONES = ["ver", "crear", "editar", "eliminar"] as const;

export type Modulo = typeof MODULOS[number];
export type Accion = typeof ACCIONES[number];

export const MODULO_LABELS: Record<Modulo, string> = {
    usuarios: "Usuarios",
    circuitos: "Circuitos",
    establecimientos: "Establecimientos",
    agrupaciones: "Partidos Políticos",
    mesas: "Mesas",
    categorias: "Cargos Políticos",
    votantes: "Electores",
    reportes: "Reportes",
    estadoelector: "Elector"
};

export const ACCION_LABELS: Record<Accion, string> = {
    ver: "Ver",
    crear: "Crear",
    editar: "Editar",
    eliminar: "Eliminar",
};