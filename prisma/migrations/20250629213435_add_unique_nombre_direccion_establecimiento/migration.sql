/*
  Warnings:

  - A unique constraint covering the columns `[nombre,direccion]` on the table `Establecimiento` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Establecimiento_nombre_key";

-- CreateIndex
CREATE UNIQUE INDEX "Establecimiento_nombre_direccion_key" ON "Establecimiento"("nombre", "direccion");
