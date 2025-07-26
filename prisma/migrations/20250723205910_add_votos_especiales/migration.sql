/*
  Warnings:

  - You are about to drop the column `diferencia` on the `Mesa` table. All the data in the column will be lost.
  - You are about to drop the column `electoresVotaron` on the `Mesa` table. All the data in the column will be lost.
  - You are about to drop the column `sobresEnUrna` on the `Mesa` table. All the data in the column will be lost.
  - You are about to drop the `TotalesMesa` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `totalMesaId` to the `Mesa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mesa" DROP COLUMN "diferencia",
DROP COLUMN "electoresVotaron",
DROP COLUMN "sobresEnUrna",
ADD COLUMN     "totalMesaId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "TotalesMesa";

-- CreateTable
CREATE TABLE "TotalMesa" (
    "id" SERIAL NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "electoresVotaron" INTEGER NOT NULL,
    "sobresEnUrna" INTEGER NOT NULL,
    "diferencia" INTEGER NOT NULL,

    CONSTRAINT "TotalMesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotosEspeciales" (
    "id" SERIAL NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "votosNulos" INTEGER NOT NULL,
    "votosEnBlanco" INTEGER NOT NULL,
    "votosRecurridos" INTEGER NOT NULL,
    "votosImpugnados" INTEGER NOT NULL,
    "votosComandoElectoral" INTEGER NOT NULL,

    CONSTRAINT "VotosEspeciales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TotalMesa_mesaId_key" ON "TotalMesa"("mesaId");

-- CreateIndex
CREATE INDEX "TotalMesa_mesaId_idx" ON "TotalMesa"("mesaId");

-- CreateIndex
CREATE UNIQUE INDEX "VotosEspeciales_mesaId_key" ON "VotosEspeciales"("mesaId");

-- CreateIndex
CREATE INDEX "VotosEspeciales_mesaId_idx" ON "VotosEspeciales"("mesaId");
