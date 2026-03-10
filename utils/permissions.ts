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
    "generarusuario",
    "permisos",
    "permisosrol",
    "roles",
    "estadisticas",
    "importarpadron",
    "certificados",
    "resultados",
    "elecciones",
    "actores",
    "planillas"



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
    elecciones: "Elecciones",
    reportes: "Reportes",
    estadoelector: "Flag Voto",
    generarusuario: "Generar usuarios",
    permisos: "Permisos",
    permisosrol: "Permisos Por Rol",
    roles: "Roles",
    estadisticas: "Estadisticas",
    importarpadron: "Importar Padrón",
    certificados: "Certificado Escrutinio",
    resultados: "Resultados de Escrutinio",
    actores: "Actores Presidenciales",
    planillas: "Planillas",

};

export const ACCION_LABELS: Record<Accion, string> = {
    ver: "Ver",
    crear: "Crear",
    editar: "Editar",
    eliminar: "Eliminar",
};