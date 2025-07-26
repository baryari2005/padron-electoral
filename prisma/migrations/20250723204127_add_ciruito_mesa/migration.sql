/*
  Warnings:

  - You are about to drop the column `circuito` on the `Mesa` table. All the data in the column will be lost.
  - Added the required column `circuitoId` to the `Mesa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mesa" DROP COLUMN "circuito",
ADD COLUMN     "circuitoId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Pais" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provincia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "paisId" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provincia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Localidad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "provinciaId" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Localidad_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pais_nombre_key" ON "Pais"("nombre");

-- CreateIndex
CREATE INDEX "Provincia_paisId_idx" ON "Provincia"("paisId");

-- CreateIndex
CREATE UNIQUE INDEX "Provincia_nombre_paisId_key" ON "Provincia"("nombre", "paisId");

-- CreateIndex
CREATE INDEX "Localidad_provinciaId_idx" ON "Localidad"("provinciaId");

-- CreateIndex
CREATE UNIQUE INDEX "Localidad_nombre_provinciaId_key" ON "Localidad"("nombre", "provinciaId");

-- CreateIndex
CREATE INDEX "Mesa_circuitoId_idx" ON "Mesa"("circuitoId");
