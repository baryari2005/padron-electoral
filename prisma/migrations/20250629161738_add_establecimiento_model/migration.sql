/*
  Warnings:

  - You are about to drop the `padron_electoral` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "padron_electoral";

-- CreateTable
CREATE TABLE "Establecimiento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,

    CONSTRAINT "Establecimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PadronElectoral" (
    "id" SERIAL NOT NULL,
    "distrito" TEXT NOT NULL,
    "tipo_ejemplar" TEXT NOT NULL,
    "nu_matricula" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "clase" INTEGER NOT NULL,
    "genero" TEXT NOT NULL,
    "domicilio" TEXT NOT NULL,
    "seccion" TEXT NOT NULL,
    "circuito" TEXT NOT NULL,
    "localidad" TEXT NOT NULL,
    "codigo_postal" TEXT NOT NULL,
    "tipo_nacionalidad" TEXT NOT NULL,
    "numero_mesa" INTEGER NOT NULL,
    "orden_mesa" INTEGER NOT NULL,
    "establecimientoId" INTEGER NOT NULL,
    "voto_sino" TEXT NOT NULL,

    CONSTRAINT "PadronElectoral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PadronElectoral_establecimientoId_idx" ON "PadronElectoral"("establecimientoId");

-- CreateIndex
CREATE INDEX "PadronElectoral_apellido_idx" ON "PadronElectoral"("apellido");

-- CreateIndex
CREATE INDEX "PadronElectoral_nombre_idx" ON "PadronElectoral"("nombre");

-- CreateIndex
CREATE INDEX "PadronElectoral_voto_sino_idx" ON "PadronElectoral"("voto_sino");

-- CreateIndex
CREATE INDEX "PadronElectoral_localidad_idx" ON "PadronElectoral"("localidad");

-- CreateIndex
CREATE INDEX "PadronElectoral_voto_sino_localidad_idx" ON "PadronElectoral"("voto_sino", "localidad");

-- CreateIndex
CREATE UNIQUE INDEX "PadronElectoral_nu_matricula_key" ON "PadronElectoral"("nu_matricula");
