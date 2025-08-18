-- AlterTable
ALTER TABLE "MesasPorEstablecimiento" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "MesasPorEstablecimiento_deletedAt_idx" ON "MesasPorEstablecimiento"("deletedAt");
