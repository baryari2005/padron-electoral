/*
  Warnings:

  - You are about to drop the column `afiliados` on the `AgrupacionPolitica` table. All the data in the column will be lost.
  - You are about to drop the column `ambito` on the `AgrupacionPolitica` table. All the data in the column will be lost.
  - You are about to drop the column `color` on the `AgrupacionPolitica` table. All the data in the column will be lost.
  - You are about to drop the column `contactoEmail` on the `AgrupacionPolitica` table. All the data in the column will be lost.
  - You are about to drop the column `cuit` on the `AgrupacionPolitica` table. All the data in the column will be lost.
  - You are about to drop the column `descripcion` on the `AgrupacionPolitica` table. All the data in the column will be lost.
  - You are about to drop the column `domicilio` on the `AgrupacionPolitica` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `AgrupacionPolitica` table. All the data in the column will be lost.
  - You are about to drop the column `fechaFundacion` on the `AgrupacionPolitica` table. All the data in the column will be lost.
  - You are about to drop the column `inscripcionNacional` on the `AgrupacionPolitica` table. All the data in the column will be lost.
  - You are about to drop the column `jurisdiccion` on the `AgrupacionPolitica` table. All the data in the column will be lost.
  - You are about to drop the column `lider` on the `AgrupacionPolitica` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `AgrupacionPolitica` table. All the data in the column will be lost.
  - You are about to drop the column `paginaWeb` on the `AgrupacionPolitica` table. All the data in the column will be lost.
  - You are about to drop the column `sigla` on the `AgrupacionPolitica` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `AgrupacionPolitica` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nombre]` on the table `AgrupacionPolitica` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AgrupacionPolitica" DROP COLUMN "afiliados",
DROP COLUMN "ambito",
DROP COLUMN "color",
DROP COLUMN "contactoEmail",
DROP COLUMN "cuit",
DROP COLUMN "descripcion",
DROP COLUMN "domicilio",
DROP COLUMN "estado",
DROP COLUMN "fechaFundacion",
DROP COLUMN "inscripcionNacional",
DROP COLUMN "jurisdiccion",
DROP COLUMN "lider",
DROP COLUMN "logoUrl",
DROP COLUMN "paginaWeb",
DROP COLUMN "sigla",
DROP COLUMN "tipo";

-- DropEnum
DROP TYPE "AgrupacionTipo";

-- DropEnum
DROP TYPE "Ambito";

-- CreateTable
CREATE TABLE "Resultado" (
    "id" SERIAL NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "categoria" TEXT NOT NULL,
    "agrupacionId" INTEGER NOT NULL,
    "votos" INTEGER NOT NULL,

    CONSTRAINT "Resultado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mesa" (
    "id" SERIAL NOT NULL,
    "circuito" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "seccion" TEXT,
    "electoresVotaron" INTEGER NOT NULL,
    "sobresEnUrna" INTEGER NOT NULL,
    "diferencia" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TotalesMesa" (
    "id" SERIAL NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "votosNulos" INTEGER NOT NULL,
    "votosEnBlanco" INTEGER NOT NULL,
    "votosRecurridos" INTEGER NOT NULL,
    "votosImpugnados" INTEGER NOT NULL,
    "votosComandoElectoral" INTEGER NOT NULL,

    CONSTRAINT "TotalesMesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Firma" (
    "id" SERIAL NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "rol" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "agrupacionId" INTEGER,

    CONSTRAINT "Firma_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Resultado_agrupacionId_idx" ON "Resultado"("agrupacionId");

-- CreateIndex
CREATE INDEX "Resultado_mesaId_idx" ON "Resultado"("mesaId");

-- CreateIndex
CREATE INDEX "Mesa_numero_idx" ON "Mesa"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "TotalesMesa_mesaId_key" ON "TotalesMesa"("mesaId");

-- CreateIndex
CREATE INDEX "TotalesMesa_mesaId_idx" ON "TotalesMesa"("mesaId");

-- CreateIndex
CREATE INDEX "Firma_mesaId_idx" ON "Firma"("mesaId");

-- CreateIndex
CREATE INDEX "Firma_agrupacionId_idx" ON "Firma"("agrupacionId");

-- CreateIndex
CREATE UNIQUE INDEX "AgrupacionPolitica_nombre_key" ON "AgrupacionPolitica"("nombre");

-- CreateIndex
CREATE INDEX "AgrupacionPolitica_nombre_idx" ON "AgrupacionPolitica"("nombre");
