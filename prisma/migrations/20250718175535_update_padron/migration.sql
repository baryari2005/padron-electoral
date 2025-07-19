/*
  Warnings:

  - You are about to drop the column `circuito` on the `PadronElectoral` table. All the data in the column will be lost.
  - Added the required column `circuitoId` to the `PadronElectoral` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PadronElectoral" DROP COLUMN "circuito",
ADD COLUMN     "circuitoId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "PadronElectoral_circuitoId_idx" ON "PadronElectoral"("circuitoId");
