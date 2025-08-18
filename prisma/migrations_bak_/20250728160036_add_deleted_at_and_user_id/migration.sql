-- AlterTable
ALTER TABLE "AgrupacionPolitica" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CargoPolitico" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Circuito" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Establecimiento" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "MesaEscrutada" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PadronElectoral" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "AgrupacionPolitica_deletedAt_idx" ON "AgrupacionPolitica"("deletedAt");

-- CreateIndex
CREATE INDEX "CargoPolitico_deletedAt_idx" ON "CargoPolitico"("deletedAt");

-- CreateIndex
CREATE INDEX "Circuito_deletedAt_idx" ON "Circuito"("deletedAt");

-- CreateIndex
CREATE INDEX "Establecimiento_deletedAt_idx" ON "Establecimiento"("deletedAt");

-- CreateIndex
CREATE INDEX "MesaEscrutada_deletedAt_idx" ON "MesaEscrutada"("deletedAt");

-- CreateIndex
CREATE INDEX "PadronElectoral_deletedAt_idx" ON "PadronElectoral"("deletedAt");
