/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `Establecimiento` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Establecimiento_nombre_key" ON "Establecimiento"("nombre");
