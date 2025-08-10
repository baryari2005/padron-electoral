/*
  Warnings:

  - You are about to drop the column `rolId` on the `Firma` table. All the data in the column will be lost.
  - Added the required column `cargoId` to the `Firma` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Firma_rolId_idx";

-- AlterTable
ALTER TABLE "Firma" DROP COLUMN "rolId",
ADD COLUMN     "cargoId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Permiso" (
    "id" SERIAL NOT NULL,
    "clave" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermisoPorRol" (
    "id" TEXT NOT NULL,
    "rolId" INTEGER NOT NULL,
    "permisoId" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermisoPorRol_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permiso_clave_key" ON "Permiso"("clave");

-- CreateIndex
CREATE INDEX "PermisoPorRol_rolId_idx" ON "PermisoPorRol"("rolId");

-- CreateIndex
CREATE INDEX "PermisoPorRol_permisoId_idx" ON "PermisoPorRol"("permisoId");

-- CreateIndex
CREATE INDEX "Firma_cargoId_idx" ON "Firma"("cargoId");
