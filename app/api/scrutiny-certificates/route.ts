import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/lib/db";
import { certificadoSchema } from "@/app/(dashboard)/scrutiny-certificates/utils/schema";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const numeroMesa = searchParams.get("numeroMesa");
  const establecimientoId = searchParams.get("escuelaId");

  // 🔍 Si se envían parámetros, verificamos si ya existe
  if (numeroMesa && establecimientoId) {
    const existing = await prisma.mesa.findFirst({
      where: {
        numero: numeroMesa,
        establecimientoId: parseInt(establecimientoId),
      },
      include: {
        resultados: true,
        firmas: true,
      },
    });

    if (existing && (existing.resultados.length > 0 || existing.firmas.length > 0)) {
      return NextResponse.json({ exists: true });
    }

    return NextResponse.json({ exists: false });
  }

  // 🧾 Si no hay params, devolvemos todas las mesas cargadas
  const certificados = await prisma.mesa.findMany({
    include: {
      establecimiento: true,
      resultados: true,
      totales: true,
      firmas: {
        include: {
          agrupacion: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(certificados);
}



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = certificadoSchema.parse(body);

    const numero = parsed.mesa.numeroMesa;
    const establecimientoId = parseInt(parsed.mesa.escuelaId);

    // Verificar si ya existe un certificado cargado para esta mesa
    const existingMesa = await prisma.mesa.findFirst({
      where: {
        numero,
        establecimientoId,
      },
      include: {
        resultados: true,
        firmas: true,
      },
    });

    if (existingMesa && (existingMesa.resultados.length > 0 || existingMesa.firmas.length > 0)) {
      return NextResponse.json(
        { error: "Ya existe un certificado cargado para esta escuela y mesa." },
        { status: 400 }
      );
    }

    // Crear o vincular la mesa
    const mesa = await prisma.mesa.upsert({
      where: {
        numero_establecimientoId: {
          numero,
          establecimientoId,
        },
      },
      update: {},
      create: {
        numero,
        establecimientoId,
        circuito: "Circuito Desconocido",
        electoresVotaron: parsed.totales.votantes,
        sobresEnUrna: parsed.totales.sobres,
        diferencia: parsed.totales.diferencia,
      },
    });

    const mesaId = mesa.id;

    // Guardar Totales
    await prisma.totalesMesa.create({
      data: {
        mesaId,
        votosNulos: parsed.votosEspeciales.presidente.nulos,
        votosEnBlanco: parsed.votosEspeciales.presidente.blancos,
        votosRecurridos: parsed.votosEspeciales.presidente.recurridos,
        votosImpugnados: parsed.votosEspeciales.presidente.impugnados,
        votosComandoElectoral: parsed.votosEspeciales.presidente.comandoElectoral,
      },
    });

    // Cargar roles
    const roles = await prisma.role.findMany();
    const rolePresidente = roles.find((r) => r.name.toLowerCase() === "presidente");
    const roleVocal = roles.find((r) => r.name.toLowerCase() === "vocal");
    const roleFiscal = roles.find((r) => r.name.toLowerCase() === "fiscal");

    if (!rolePresidente || !roleVocal || !roleFiscal) {
      return NextResponse.json({ error: "Roles no definidos." }, { status: 400 });
    }

    // Guardar firmas
    await prisma.firma.createMany({
      data: [
        {
          mesaId,
          roleId: rolePresidente.id,
          nombre: parsed.firmas.presidente,
          dni: parsed.compensacion.presidente.dni,
        },
        {
          mesaId,
          roleId: roleVocal.id,
          nombre: parsed.firmas.vocal,
          dni: parsed.compensacion.vocal.dni,
        },
        ...parsed.firmas.fiscales.map((f) => ({
          mesaId,
          roleId: roleFiscal.id,
          nombre: f.firma,
          dni: f.dni,
          agrupacionId: parseInt(f.agrupacionId),
        })),
      ],
    });

    // Guardar resultados generales
    await prisma.resultado.createMany({
      data: parsed.resultados.map((r) => ({
        mesaId,
        categoriaId: parseInt(r.cargoId),
        agrupacionId: parseInt(r.agrupacionId),
        votos: r.votos,
      })),
    });

    // Guardar resultados presidenciales
    const categoriaPresidente = await prisma.categoria.findFirst({ where: { nombre: "Presidente" } });
    const categoriaParlamentario = await prisma.categoria.findFirst({ where: { nombre: "Parlamentario" } });

    if (!categoriaPresidente || !categoriaParlamentario) {
      return NextResponse.json({ error: "Categorías no encontradas" }, { status: 400 });
    }

    await prisma.resultado.createMany({
      data: parsed.resultadosPresidenciales.flatMap((r) => [
        {
          mesaId,
          categoriaId: categoriaPresidente.id,
          agrupacionId: r.numero,
          votos: r.presidente,
        },
        {
          mesaId,
          categoriaId: categoriaParlamentario.id,
          agrupacionId: r.numero,
          votos: r.parlamentario,
        },
      ]),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al guardar el certificado", detalle: error.message },
      { status: 500 }
    );
  }
}
