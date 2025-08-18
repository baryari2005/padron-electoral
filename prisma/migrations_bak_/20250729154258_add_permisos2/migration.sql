/*
  Warnings:

  - A unique constraint covering the columns `[rolId,permisoId]` on the table `PermisoPorRol` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PermisoPorRol_rolId_permisoId_key" ON "PermisoPorRol"("rolId", "permisoId");
