/*
  Warnings:

  - The primary key for the `GlobalStats` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `GlobalStats` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mesaId,categoriaId,eleccionId]` on the table `DiferenciasPorCargosPoliticos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mesaId,categoriaId,agrupacionId,eleccionId]` on the table `ResultadoPorAgrupacionPolitica` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mesaId,eleccionId]` on the table `ResultadoPorMesa` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mesaId,categoriaId,eleccionId]` on the table `ResultadoVotosEspeciales` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "DiferenciasPorCargosPoliticos_mesaId_categoriaId_key";

-- DropIndex
DROP INDEX "ResultadoPorAgrupacionPolitica_mesaId_categoriaId_agrupacio_key";

-- DropIndex
DROP INDEX "ResultadoPorMesa_mesaId_key";

-- DropIndex
DROP INDEX "ResultadoVotosEspeciales_mesaId_categoriaId_key";

-- AlterTable
ALTER TABLE "GlobalStats" DROP CONSTRAINT "GlobalStats_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "GlobalStats_pkey" PRIMARY KEY ("eleccionId");

-- CreateIndex
CREATE UNIQUE INDEX "DiferenciasPorCargosPoliticos_mesaId_categoriaId_eleccionId_key" ON "DiferenciasPorCargosPoliticos"("mesaId", "categoriaId", "eleccionId");

-- CreateIndex
CREATE UNIQUE INDEX "ResultadoPorAgrupacionPolitica_mesaId_categoriaId_agrupacio_key" ON "ResultadoPorAgrupacionPolitica"("mesaId", "categoriaId", "agrupacionId", "eleccionId");

-- CreateIndex
CREATE UNIQUE INDEX "ResultadoPorMesa_mesaId_eleccionId_key" ON "ResultadoPorMesa"("mesaId", "eleccionId");

-- CreateIndex
CREATE UNIQUE INDEX "ResultadoVotosEspeciales_mesaId_categoriaId_eleccionId_key" ON "ResultadoVotosEspeciales"("mesaId", "categoriaId", "eleccionId");
