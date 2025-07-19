/*
  Warnings:

  - You are about to drop the column `rol` on the `Firma` table. All the data in the column will be lost.
  - You are about to drop the column `categoria` on the `Resultado` table. All the data in the column will be lost.
  - Added the required column `roleId` to the `Firma` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoriaId` to the `Resultado` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Firma" DROP COLUMN "rol",
ADD COLUMN     "roleId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Resultado" DROP COLUMN "categoria",
ADD COLUMN     "categoriaId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE INDEX "Firma_roleId_idx" ON "Firma"("roleId");

-- CreateIndex
CREATE INDEX "Resultado_categoriaId_idx" ON "Resultado"("categoriaId");
