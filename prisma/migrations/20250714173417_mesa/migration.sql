/*
  Warnings:

  - A unique constraint covering the columns `[numero,establecimientId]` on the table `Mesa` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `establecimientId` to the `Mesa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mesa" ADD COLUMN     "establecimientId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Mesa_numero_establecimientId_key" ON "Mesa"("numero", "establecimientId");
