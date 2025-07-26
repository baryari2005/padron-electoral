-- CreateTable
CREATE TABLE "DiferenciaCategoria" (
    "id" SERIAL NOT NULL,
    "diferencia" INTEGER NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,

    CONSTRAINT "DiferenciaCategoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiferenciaCategoria_mesaId_idx" ON "DiferenciaCategoria"("mesaId");

-- CreateIndex
CREATE INDEX "DiferenciaCategoria_categoriaId_idx" ON "DiferenciaCategoria"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "DiferenciaCategoria_mesaId_categoriaId_key" ON "DiferenciaCategoria"("mesaId", "categoriaId");
