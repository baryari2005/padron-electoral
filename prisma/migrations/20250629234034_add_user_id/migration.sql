/*
  Warnings:

  - Added the required column `userId` to the `Establecimiento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Establecimiento" ADD COLUMN     "userId" TEXT NOT NULL;
