-- CreateEnum
CREATE TYPE "AgrupacionTipo" AS ENUM ('Partido', 'Frente', 'Alianza', 'Movimiento');

-- CreateEnum
CREATE TYPE "Ambito" AS ENUM ('Nacional', 'Provincial', 'Municipal');

-- CreateTable
CREATE TABLE "AgrupacionPolitica" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "sigla" TEXT,
    "color" TEXT,
    "logoUrl" TEXT,
    "fechaFundacion" TIMESTAMP(3),
    "estado" BOOLEAN NOT NULL DEFAULT true,
    "tipo" "AgrupacionTipo" NOT NULL,
    "ambito" "Ambito" NOT NULL,
    "lider" TEXT,
    "paginaWeb" TEXT,
    "descripcion" TEXT,
    "jurisdiccion" TEXT,
    "inscripcionNacional" BOOLEAN NOT NULL DEFAULT false,
    "afiliados" INTEGER,
    "cuit" TEXT,
    "contactoEmail" TEXT,
    "domicilio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgrupacionPolitica_pkey" PRIMARY KEY ("id")
);
