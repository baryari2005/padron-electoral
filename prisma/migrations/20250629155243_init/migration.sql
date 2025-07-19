-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "profileImage" TEXT,
    "cif" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "website" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "title" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "allDay" BOOLEAN NOT NULL,
    "timeFormat" TEXT NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "padron_electoral" (
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
    "establecimiento" TEXT NOT NULL,
    "direccion_establecimiento" TEXT NOT NULL,
    "voto_sino" TEXT NOT NULL,

    CONSTRAINT "padron_electoral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Contact_companyId_idx" ON "Contact"("companyId");

-- CreateIndex
CREATE INDEX "Event_companyId_idx" ON "Event"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "padron_electoral_nu_matricula_key" ON "padron_electoral"("nu_matricula");

-- CreateIndex
CREATE INDEX "padron_electoral_apellido_idx" ON "padron_electoral"("apellido");

-- CreateIndex
CREATE INDEX "padron_electoral_nombre_idx" ON "padron_electoral"("nombre");

-- CreateIndex
CREATE INDEX "padron_electoral_voto_sino_idx" ON "padron_electoral"("voto_sino");

-- CreateIndex
CREATE INDEX "padron_electoral_localidad_idx" ON "padron_electoral"("localidad");

-- CreateIndex
CREATE INDEX "padron_electoral_voto_sino_localidad_idx" ON "padron_electoral"("voto_sino", "localidad");
