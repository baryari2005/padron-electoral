-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT,
    "apellido" TEXT,
    "avatarUrl" TEXT,
    "rolId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rol" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pais" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provincia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "paisId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Provincia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Localidad" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "provinciaId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Localidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Circuito" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Circuito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MesasPorEstablecimiento" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "establecimientoId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MesasPorEstablecimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Establecimiento" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "circuitoId" INTEGER NOT NULL,
    "profileImage" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Establecimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PadronElectoral" (
    "id" SERIAL NOT NULL,
    "distrito" TEXT NOT NULL,
    "tipoEjemplar" TEXT NOT NULL,
    "numeroMatricula" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "clase" INTEGER NOT NULL,
    "genero" TEXT NOT NULL,
    "domicilio" TEXT NOT NULL,
    "seccion" TEXT NOT NULL,
    "localidad" TEXT NOT NULL,
    "codigoPostal" TEXT NOT NULL,
    "tipoNacionalidad" TEXT NOT NULL,
    "numeroMesa" INTEGER NOT NULL,
    "ordenMesa" INTEGER NOT NULL,
    "votoSiNo" TEXT NOT NULL,
    "circuitoId" INTEGER NOT NULL,
    "establecimientoId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PadronElectoral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MesaEscrutada" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "seccion" TEXT,
    "circuitoId" INTEGER NOT NULL,
    "establecimientoId" INTEGER NOT NULL,
    "resumenJson" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MesaEscrutada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultadoPorAgrupacionPolitica" (
    "id" SERIAL NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "agrupacionId" INTEGER NOT NULL,
    "votos" INTEGER NOT NULL,

    CONSTRAINT "ResultadoPorAgrupacionPolitica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultadoPorMesa" (
    "id" SERIAL NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "electoresVotaron" INTEGER NOT NULL,
    "sobresEnUrna" INTEGER NOT NULL,
    "diferencia" INTEGER NOT NULL,

    CONSTRAINT "ResultadoPorMesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultadoVotosEspeciales" (
    "id" SERIAL NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "votosNulos" INTEGER NOT NULL,
    "votosEnBlanco" INTEGER NOT NULL,
    "votosRecurridos" INTEGER NOT NULL,
    "votosImpugnados" INTEGER NOT NULL,
    "votosComandoElectoral" INTEGER NOT NULL,

    CONSTRAINT "ResultadoVotosEspeciales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiferenciasPorCargosPoliticos" (
    "id" SERIAL NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "diferencia" INTEGER NOT NULL,

    CONSTRAINT "DiferenciasPorCargosPoliticos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Firma" (
    "id" SERIAL NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "rolId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "agrupacionId" INTEGER,

    CONSTRAINT "Firma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CargoPolitico" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CargoPolitico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgrupacionPolitica" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "profileImage" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgrupacionPolitica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "imagen" TEXT,
    "cif" TEXT,
    "telefono" TEXT,
    "pais" TEXT,
    "sitioWeb" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contacto" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "rol" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contacto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evento" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT,
    "titulo" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "todoElDia" BOOLEAN NOT NULL,
    "formatoHora" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_userId_key" ON "Usuario"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_rolId_idx" ON "Usuario"("rolId");

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_key" ON "Rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Pais_nombre_key" ON "Pais"("nombre");

-- CreateIndex
CREATE INDEX "Pais_userId_idx" ON "Pais"("userId");

-- CreateIndex
CREATE INDEX "Provincia_userId_idx" ON "Provincia"("userId");

-- CreateIndex
CREATE INDEX "Provincia_paisId_idx" ON "Provincia"("paisId");

-- CreateIndex
CREATE UNIQUE INDEX "Provincia_nombre_paisId_key" ON "Provincia"("nombre", "paisId");

-- CreateIndex
CREATE INDEX "Localidad_userId_idx" ON "Localidad"("userId");

-- CreateIndex
CREATE INDEX "Localidad_provinciaId_idx" ON "Localidad"("provinciaId");

-- CreateIndex
CREATE UNIQUE INDEX "Localidad_nombre_provinciaId_key" ON "Localidad"("nombre", "provinciaId");

-- CreateIndex
CREATE UNIQUE INDEX "Circuito_codigo_key" ON "Circuito"("codigo");

-- CreateIndex
CREATE INDEX "Circuito_userId_idx" ON "Circuito"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MesasPorEstablecimiento_numero_key" ON "MesasPorEstablecimiento"("numero");

-- CreateIndex
CREATE INDEX "MesasPorEstablecimiento_userId_idx" ON "MesasPorEstablecimiento"("userId");

-- CreateIndex
CREATE INDEX "MesasPorEstablecimiento_establecimientoId_idx" ON "MesasPorEstablecimiento"("establecimientoId");

-- CreateIndex
CREATE INDEX "Establecimiento_userId_idx" ON "Establecimiento"("userId");

-- CreateIndex
CREATE INDEX "Establecimiento_circuitoId_idx" ON "Establecimiento"("circuitoId");

-- CreateIndex
CREATE UNIQUE INDEX "Establecimiento_nombre_direccion_key" ON "Establecimiento"("nombre", "direccion");

-- CreateIndex
CREATE UNIQUE INDEX "PadronElectoral_numeroMatricula_key" ON "PadronElectoral"("numeroMatricula");

-- CreateIndex
CREATE INDEX "PadronElectoral_userId_idx" ON "PadronElectoral"("userId");

-- CreateIndex
CREATE INDEX "PadronElectoral_circuitoId_idx" ON "PadronElectoral"("circuitoId");

-- CreateIndex
CREATE INDEX "PadronElectoral_establecimientoId_idx" ON "PadronElectoral"("establecimientoId");

-- CreateIndex
CREATE INDEX "MesaEscrutada_establecimientoId_idx" ON "MesaEscrutada"("establecimientoId");

-- CreateIndex
CREATE INDEX "MesaEscrutada_userId_idx" ON "MesaEscrutada"("userId");

-- CreateIndex
CREATE INDEX "MesaEscrutada_circuitoId_idx" ON "MesaEscrutada"("circuitoId");

-- CreateIndex
CREATE UNIQUE INDEX "MesaEscrutada_numero_establecimientoId_key" ON "MesaEscrutada"("numero", "establecimientoId");

-- CreateIndex
CREATE INDEX "ResultadoPorAgrupacionPolitica_mesaId_idx" ON "ResultadoPorAgrupacionPolitica"("mesaId");

-- CreateIndex
CREATE INDEX "ResultadoPorAgrupacionPolitica_categoriaId_idx" ON "ResultadoPorAgrupacionPolitica"("categoriaId");

-- CreateIndex
CREATE INDEX "ResultadoPorAgrupacionPolitica_agrupacionId_idx" ON "ResultadoPorAgrupacionPolitica"("agrupacionId");

-- CreateIndex
CREATE UNIQUE INDEX "ResultadoPorMesa_mesaId_key" ON "ResultadoPorMesa"("mesaId");

-- CreateIndex
CREATE INDEX "ResultadoVotosEspeciales_categoriaId_idx" ON "ResultadoVotosEspeciales"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "ResultadoVotosEspeciales_mesaId_categoriaId_key" ON "ResultadoVotosEspeciales"("mesaId", "categoriaId");

-- CreateIndex
CREATE INDEX "DiferenciasPorCargosPoliticos_categoriaId_idx" ON "DiferenciasPorCargosPoliticos"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "DiferenciasPorCargosPoliticos_mesaId_categoriaId_key" ON "DiferenciasPorCargosPoliticos"("mesaId", "categoriaId");

-- CreateIndex
CREATE INDEX "Firma_mesaId_idx" ON "Firma"("mesaId");

-- CreateIndex
CREATE INDEX "Firma_rolId_idx" ON "Firma"("rolId");

-- CreateIndex
CREATE INDEX "Firma_agrupacionId_idx" ON "Firma"("agrupacionId");

-- CreateIndex
CREATE UNIQUE INDEX "CargoPolitico_nombre_key" ON "CargoPolitico"("nombre");

-- CreateIndex
CREATE INDEX "CargoPolitico_userId_idx" ON "CargoPolitico"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AgrupacionPolitica_nombre_key" ON "AgrupacionPolitica"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "AgrupacionPolitica_numero_key" ON "AgrupacionPolitica"("numero");

-- CreateIndex
CREATE INDEX "AgrupacionPolitica_userId_idx" ON "AgrupacionPolitica"("userId");

-- CreateIndex
CREATE INDEX "Empresa_userId_idx" ON "Empresa"("userId");

-- CreateIndex
CREATE INDEX "Contacto_empresaId_idx" ON "Contacto"("empresaId");

-- CreateIndex
CREATE INDEX "Evento_empresaId_idx" ON "Evento"("empresaId");
