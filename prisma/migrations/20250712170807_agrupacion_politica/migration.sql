/*
  Warnings:

  - A unique constraint covering the columns `[numero]` on the table `AgrupacionPolitica` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `numero` to the `AgrupacionPolitica` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AgrupacionPolitica" ADD COLUMN     "numero" INTEGER NOT NULL,
ADD COLUMN     "profileImage" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AgrupacionPolitica_numero_key" ON "AgrupacionPolitica"("numero");
