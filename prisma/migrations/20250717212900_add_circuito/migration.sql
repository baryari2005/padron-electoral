/*
  Warnings:

  - You are about to drop the column `establecimientId` on the `Mesa` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[numero,establecimientoId]` on the table `Mesa` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `circuitoId` to the `Establecimiento` table without a default value. This is not possible if the table is not empty.
  - Added the required column `establecimientoId` to the `Mesa` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Mesa_numero_establecimientId_key";

-- DropIndex
DROP INDEX "Mesa_numero_idx";

-- AlterTable
ALTER TABLE "Establecimiento" ADD COLUMN     "circuitoId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Mesa" DROP COLUMN "establecimientId",
ADD COLUMN     "establecimientoId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Circuito" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Circuito_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Circuito_codigo_key" ON "Circuito"("codigo");

-- CreateIndex
CREATE INDEX "Establecimiento_circuitoId_idx" ON "Establecimiento"("circuitoId");

-- CreateIndex
CREATE INDEX "Mesa_establecimientoId_idx" ON "Mesa"("establecimientoId");

-- CreateIndex
CREATE UNIQUE INDEX "Mesa_numero_establecimientoId_key" ON "Mesa"("numero", "establecimientoId");
