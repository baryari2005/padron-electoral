// lib/messages.ts
export const messages = {
  required: {
    name: "El nombre es obligatorio.",
    number: "El número es obligatorio.",
    code: "El código es obligatorio.",
    email: "El correo electrónico es obligatorio.",
    circuite: "El circuito es obligatorio.",
    clave: "La clave es obligatoria.",
    modulo: "El módulo es obligatorio.",
    descripcion: "La descripción es obligatoria.",
    accion: "La acción es obligatoria.",
    street: "El domicilio es obligatorio.",
    fileXLS: "Por favor seleccioná un archivo Excel.",
    
  },
  success: {
    roleCreated: "Rol creado correctamente.",
    roleDeleted: "Rol eliminado correctamente.",
    roleUpdated: "Rol actualizado correctamente.",

    categoryCreated: "Cargo político creado correctamente.",
    categoryDeleted: "Cargo político eliminado correctamente.",
    categorieDeleted: "Cargo político eliminado correctamente.",
    categoryUpdated: "Cargo político actualizado correctamente.",

    politicalGroupCreated: "Agrupación política creada correctamente.",
    "political-groupDeleted": "Agrupación política eliminada correctamente.",
    politicalGroupUpdated: "Agrupación política actualizada correctamente.",

    circuiteCreated: "Circuito creado correctamente.",
    circuiteDeleted: "Circuito eliminado correctamente.",
    circuiteUpdated: "Circuito actualizado correctamente.",

    establishmentCreated: "Establecimiento creado correctamente.",
    establishmentDeleted: "Establecimiento eliminado correctamente.",
    establishmentUpdated: "Establecimiento actualizado correctamente.",

    userUpdated: "Usuario actualizado correctamente.",
    usersCreated: "Usuario creado correctamente.",
    userDeleted: "Usuario eliminado correctamente.",    
    "electoral-rollDeleted": "Elector eliminado correctamente.",
    "electoral-rollsUpdated": "Elector modificado correctamente.",
    "electoral-rollCreated": "Elector creado correctamente.",

    permissionsCreated: "Clave creada correctamente.",    
    "permissions/keyDeleted": "Clave eliminada correctamente.",    
    permissionsUpdated: "Clave actualizada correctamente.",    
  },
  errors: {
    fileNotFound: "Archivo no encontrado.",
    roleNotFound: "Rol no encontrado.",
    circuiteNotFound: "Circuito no encontrado",
    categoryNotFound: "Cargo político no encontrado.",
    establishmentNotFound: "Establecimiento no encontrado.",
    politicalGroupNotFound: "Agrupación política no encontrada.",
    userNotFound: "Usuario no encontrado.",

    categoryBadRequest: "Error al cargar categorias.",
    certificateBadRequest: "Error al cargar certificado.",
    politicalGroupBadRequest: "Error al cargar agrupaciones políticas",

    permissionKeyNotFound: "Permiso no encontrado.",
    permissionKeyExists: "Ya existe una clave con ese nombre.",    
    roleExists: "Ya existe un rol con ese nombre.",    
    categoryExists: "Ya existe un cargo político con ese nombre.",
    establishmentExists: "Ya existe un establecimiento con ese nombre.",
    politicalGroupExists: "Ya existe una agrupación política con ese nombre.",
    circuiteExists: "Ya existe un circuito con ese nombre.",
    
    invalidPassword: "Contraseña inválida.",
    dataIsMissing: "Faltan datos obligatorios.",
    notAllowed: "Este usuario no tiene permiso para realizar dicha operación.",
    notAutorized: "Usuario no autorizado.",
    idInvalid: "ID inválido",
    tokenInvalid: "Token inválido.",
    tokenNotFound: "Token no proporcionado.",
    internal: "Error interno del servidor.",    

  },
} as const;
