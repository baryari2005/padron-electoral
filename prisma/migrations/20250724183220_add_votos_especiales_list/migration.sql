/*
  Warnings:

  - A unique constraint covering the columns `[mesaId,categoriaId]` on the table `VotosEspeciales` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoriaId` to the `VotosEspeciales` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "VotosEspeciales_mesaId_key";

-- AlterTable
ALTER TABLE "VotosEspeciales" ADD COLUMN     "categoriaId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "VotosEspeciales_categoriaId_idx" ON "VotosEspeciales"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "VotosEspeciales_mesaId_categoriaId_key" ON "VotosEspeciales"("mesaId", "categoriaId");
