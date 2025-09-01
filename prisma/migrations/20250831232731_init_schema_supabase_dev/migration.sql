-- AlterTable
ALTER TABLE "Rol" ADD COLUMN     "puedeAsignarEstablecimientos" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requiereEstablecimientos" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UsuarioEstablecimiento" (
    "id" SERIAL NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "establecimientoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioEstablecimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UsuarioEstablecimiento_usuarioId_idx" ON "UsuarioEstablecimiento"("usuarioId");

-- CreateIndex
CREATE INDEX "UsuarioEstablecimiento_establecimientoId_idx" ON "UsuarioEstablecimiento"("establecimientoId");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioEstablecimiento_usuarioId_establecimientoId_key" ON "UsuarioEstablecimiento"("usuarioId", "establecimientoId");
