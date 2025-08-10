// lib/permissions/checkPermissions.ts
export function hasPermission(
  permisos: string[],
  clave: string
): boolean {
  return permisos.includes(clave);
}
