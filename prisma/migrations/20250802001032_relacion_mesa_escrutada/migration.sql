/*
  Warnings:

  - A unique constraint covering the columns `[numero,establecimientoId]` on the table `MesasPorEstablecimiento` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "MesasPorEstablecimiento_numero_key";

-- CreateIndex
CREATE UNIQUE INDEX "MesasPorEstablecimiento_numero_establecimientoId_key" ON "MesasPorEstablecimiento"("numero", "establecimientoId");
