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
    "telefono" TEXT,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rol" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "puedeAsignarEstablecimientos" BOOLEAN NOT NULL DEFAULT false,
    "requiereEstablecimientos" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permiso" (
    "id" SERIAL NOT NULL,
    "clave" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "accion" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,

    CONSTRAINT "Permiso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermisoPorRol" (
    "id" TEXT NOT NULL,
    "rolId" INTEGER NOT NULL,
    "permisoId" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermisoPorRol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Eleccion" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "fecha" TIMESTAMP(3),
    "activa" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Eleccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Circuito" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "eleccionId" INTEGER NOT NULL,

    CONSTRAINT "Circuito_pkey" PRIMARY KEY ("id")
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
    "deletedAt" TIMESTAMP(3),
    "eleccionId" INTEGER NOT NULL,
    "establecimientoStatsEstablecimientoId" INTEGER,

    CONSTRAINT "Establecimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MesasPorEstablecimiento" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "establecimientoId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "eleccionId" INTEGER NOT NULL,

    CONSTRAINT "MesasPorEstablecimiento_pkey" PRIMARY KEY ("id")
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
    "deletedAt" TIMESTAMP(3),
    "votedAt" TIMESTAMP(3),
    "votedBy" TEXT,
    "actorId" TEXT,
    "eleccionId" INTEGER NOT NULL,
    "planillaId" INTEGER,
    "telefono" TEXT,
    "choferId" INTEGER,
    "planilleroId" INTEGER,
    "referenteId" INTEGER,

    CONSTRAINT "PadronElectoral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MesaEscrutada" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "circuitoId" INTEGER NOT NULL,
    "establecimientoId" INTEGER NOT NULL,
    "resumenJson" JSONB,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "eleccionId" INTEGER NOT NULL,

    CONSTRAINT "MesaEscrutada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CargoPolitico" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "orden" INTEGER,
    "eleccionId" INTEGER NOT NULL,

    CONSTRAINT "CargoPolitico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgrupacionPolitica" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "profileImage" TEXT,
    "color_hex" TEXT NOT NULL DEFAULT '#cccccc',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "orden" INTEGER,
    "eleccionId" INTEGER NOT NULL,

    CONSTRAINT "AgrupacionPolitica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Planilla" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "eleccionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nombre" TEXT,

    CONSTRAINT "Planilla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActorPadronHistory" (
    "id" SERIAL NOT NULL,
    "padronId" INTEGER NOT NULL,
    "actorId" TEXT,
    "changedBy" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActorPadronHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgrupacionCargoPerm" (
    "id" SERIAL NOT NULL,
    "agrupacionId" INTEGER NOT NULL,
    "cargoId" INTEGER NOT NULL,
    "eleccionId" INTEGER NOT NULL,
    "allowed" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AgrupacionCargoPerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultadoPorMesa" (
    "id" SERIAL NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "electoresVotaron" INTEGER NOT NULL,
    "sobresEnUrna" INTEGER NOT NULL,
    "diferencia" INTEGER NOT NULL,
    "eleccionId" INTEGER NOT NULL,

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
    "eleccionId" INTEGER NOT NULL,

    CONSTRAINT "ResultadoVotosEspeciales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResultadoPorAgrupacionPolitica" (
    "id" SERIAL NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "agrupacionId" INTEGER NOT NULL,
    "votos" INTEGER NOT NULL,
    "eleccionId" INTEGER NOT NULL,

    CONSTRAINT "ResultadoPorAgrupacionPolitica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioEstablecimiento" (
    "id" SERIAL NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "establecimientoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsuarioEstablecimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MesaStats" (
    "mesaId" INTEGER NOT NULL,
    "padronTotal" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eleccionId" INTEGER NOT NULL,

    CONSTRAINT "MesaStats_pkey" PRIMARY KEY ("mesaId")
);

-- CreateTable
CREATE TABLE "EstablecimientoStats" (
    "establecimientoId" INTEGER NOT NULL,
    "padronTotal" INTEGER NOT NULL,
    "mesasCount" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eleccionId" INTEGER NOT NULL,

    CONSTRAINT "EstablecimientoStats_pkey" PRIMARY KEY ("establecimientoId")
);

-- CreateTable
CREATE TABLE "CircuitoStats" (
    "circuitoId" INTEGER NOT NULL,
    "padronTotal" INTEGER NOT NULL,
    "mesasCount" INTEGER NOT NULL,
    "eleccionId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CircuitoStats_pkey" PRIMARY KEY ("circuitoId")
);

-- CreateTable
CREATE TABLE "GlobalStats" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "padronTotal" INTEGER NOT NULL,
    "mesasTotales" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eleccionId" INTEGER NOT NULL,

    CONSTRAINT "GlobalStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiferenciasPorCargosPoliticos" (
    "id" SERIAL NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "diferencia" INTEGER NOT NULL,
    "eleccionId" INTEGER NOT NULL,

    CONSTRAINT "DiferenciasPorCargosPoliticos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Firma" (
    "id" SERIAL NOT NULL,
    "mesaId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "agrupacionId" INTEGER,
    "cargoId" INTEGER NOT NULL,

    CONSTRAINT "Firma_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonaOperativa" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "tipo" TEXT NOT NULL,
    "eleccionId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonaOperativa_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "Permiso_clave_key" ON "Permiso"("clave");

-- CreateIndex
CREATE INDEX "PermisoPorRol_rolId_idx" ON "PermisoPorRol"("rolId");

-- CreateIndex
CREATE INDEX "PermisoPorRol_permisoId_idx" ON "PermisoPorRol"("permisoId");

-- CreateIndex
CREATE UNIQUE INDEX "PermisoPorRol_rolId_permisoId_key" ON "PermisoPorRol"("rolId", "permisoId");

-- CreateIndex
CREATE INDEX "Eleccion_activa_idx" ON "Eleccion"("activa");

-- CreateIndex
CREATE INDEX "Circuito_eleccionId_idx" ON "Circuito"("eleccionId");

-- CreateIndex
CREATE INDEX "Circuito_deletedAt_idx" ON "Circuito"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Circuito_codigo_eleccionId_key" ON "Circuito"("codigo", "eleccionId");

-- CreateIndex
CREATE INDEX "Establecimiento_eleccionId_idx" ON "Establecimiento"("eleccionId");

-- CreateIndex
CREATE INDEX "Establecimiento_deletedAt_idx" ON "Establecimiento"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Establecimiento_nombre_direccion_eleccionId_key" ON "Establecimiento"("nombre", "direccion", "eleccionId");

-- CreateIndex
CREATE INDEX "MesasPorEstablecimiento_deletedAt_idx" ON "MesasPorEstablecimiento"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MesasPorEstablecimiento_numero_establecimientoId_eleccionId_key" ON "MesasPorEstablecimiento"("numero", "establecimientoId", "eleccionId");

-- CreateIndex
CREATE INDEX "PadronElectoral_deletedAt_idx" ON "PadronElectoral"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PadronElectoral_numeroMatricula_eleccionId_key" ON "PadronElectoral"("numeroMatricula", "eleccionId");

-- CreateIndex
CREATE INDEX "MesaEscrutada_deletedAt_idx" ON "MesaEscrutada"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MesaEscrutada_numero_establecimientoId_eleccionId_key" ON "MesaEscrutada"("numero", "establecimientoId", "eleccionId");

-- CreateIndex
CREATE INDEX "CargoPolitico_deletedAt_idx" ON "CargoPolitico"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CargoPolitico_nombre_eleccionId_key" ON "CargoPolitico"("nombre", "eleccionId");

-- CreateIndex
CREATE INDEX "AgrupacionPolitica_deletedAt_idx" ON "AgrupacionPolitica"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "AgrupacionPolitica_nombre_eleccionId_key" ON "AgrupacionPolitica"("nombre", "eleccionId");

-- CreateIndex
CREATE UNIQUE INDEX "AgrupacionPolitica_numero_eleccionId_key" ON "AgrupacionPolitica"("numero", "eleccionId");

-- CreateIndex
CREATE UNIQUE INDEX "Planilla_numero_eleccionId_key" ON "Planilla"("numero", "eleccionId");

-- CreateIndex
CREATE UNIQUE INDEX "AgrupacionCargoPerm_agrupacionId_cargoId_eleccionId_key" ON "AgrupacionCargoPerm"("agrupacionId", "cargoId", "eleccionId");

-- CreateIndex
CREATE UNIQUE INDEX "ResultadoPorMesa_mesaId_key" ON "ResultadoPorMesa"("mesaId");

-- CreateIndex
CREATE INDEX "ResultadoVotosEspeciales_categoriaId_idx" ON "ResultadoVotosEspeciales"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "ResultadoVotosEspeciales_mesaId_categoriaId_key" ON "ResultadoVotosEspeciales"("mesaId", "categoriaId");

-- CreateIndex
CREATE INDEX "ResultadoPorAgrupacionPolitica_categoriaId_idx" ON "ResultadoPorAgrupacionPolitica"("categoriaId");

-- CreateIndex
CREATE INDEX "ResultadoPorAgrupacionPolitica_agrupacionId_idx" ON "ResultadoPorAgrupacionPolitica"("agrupacionId");

-- CreateIndex
CREATE UNIQUE INDEX "ResultadoPorAgrupacionPolitica_mesaId_categoriaId_agrupacio_key" ON "ResultadoPorAgrupacionPolitica"("mesaId", "categoriaId", "agrupacionId");

-- CreateIndex
CREATE INDEX "UsuarioEstablecimiento_usuarioId_idx" ON "UsuarioEstablecimiento"("usuarioId");

-- CreateIndex
CREATE INDEX "UsuarioEstablecimiento_establecimientoId_idx" ON "UsuarioEstablecimiento"("establecimientoId");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioEstablecimiento_usuarioId_establecimientoId_key" ON "UsuarioEstablecimiento"("usuarioId", "establecimientoId");

-- CreateIndex
CREATE INDEX "DiferenciasPorCargosPoliticos_categoriaId_idx" ON "DiferenciasPorCargosPoliticos"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "DiferenciasPorCargosPoliticos_mesaId_categoriaId_key" ON "DiferenciasPorCargosPoliticos"("mesaId", "categoriaId");

-- CreateIndex
CREATE INDEX "Firma_mesaId_idx" ON "Firma"("mesaId");

-- CreateIndex
CREATE INDEX "Firma_cargoId_idx" ON "Firma"("cargoId");

-- CreateIndex
CREATE INDEX "Firma_agrupacionId_idx" ON "Firma"("agrupacionId");

-- CreateIndex
CREATE INDEX "PersonaOperativa_eleccionId_idx" ON "PersonaOperativa"("eleccionId");

-- CreateIndex
CREATE INDEX "PersonaOperativa_tipo_idx" ON "PersonaOperativa"("tipo");

-- CreateIndex
CREATE UNIQUE INDEX "PersonaOperativa_nombre_tipo_eleccionId_key" ON "PersonaOperativa"("nombre", "tipo", "eleccionId");
