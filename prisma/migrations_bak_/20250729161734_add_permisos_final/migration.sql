/*
  Warnings:

  - Added the required column `accion` to the `Permiso` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modulo` to the `Permiso` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Permiso" ADD COLUMN     "accion" TEXT NOT NULL,
ADD COLUMN     "modulo" TEXT NOT NULL;
