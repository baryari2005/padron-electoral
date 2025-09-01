export const runtime = 'nodejs';       // no Edge
export const dynamic = 'force-dynamic';// desactiva static render
export const revalidate = 0; 

import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const establecimientoId = searchParams.get("establecimientoId");
    const mesaId = searchParams.get("mesaId");
    const q = (searchParams.get("q") || "").trim();

    const where: any = {
      // "No votó" = todo lo que NO es "S"
      NOT: { votoSiNo: "S" as any },
      ...(establecimientoId ? { establecimientoId: Number(establecimientoId) } : {}),
      ...(mesaId ? { mesaId: Number(mesaId) } : {}),
      ...(q
        ? {
            OR: [
              { apellido: { contains: q, mode: "insensitive" } },
              { nombre: { contains: q, mode: "insensitive" } },
              // ajustá el campo si tu DNI es string o number
              { dni: { contains: q } as any },
            ],
          }
        : {}),
    };

    const electores = await prisma.padronElectoral.findMany({
      where,
      select: {
        id: true,
        numeroMatricula: true,
        apellido: true,
        nombre: true,
        ordenMesa: true,
        votoSiNo: true,
        numeroMesa: true, 
        establecimiento: { select: { nombre: true } },
      },
      orderBy: [{ apellido: "asc" }, { nombre: "asc" }],
    });

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("No votaron");

    ws.columns = [
      { header: "DNI", key: "dni", width: 14 },
      { header: "Apellido", key: "apellido", width: 26 },
      { header: "Nombre", key: "nombre", width: 26 },
      { header: "Establecimiento", key: "establecimiento", width: 40 },
      { header: "Mesa", key: "mesa", width: 10 },
      { header: "N° Orden", key: "orden", width: 10 },
      { header: "Estado", key: "estado", width: 12 },
    ];

    electores.forEach((e) =>
      ws.addRow({
        dni: e.numeroMatricula ?? "",
        apellido: e.apellido ?? "",
        nombre: e.nombre ?? "",
        establecimiento: e.establecimiento?.nombre ?? "",
        mesa: e.numeroMesa ?? "",
        orden: e.ordenMesa ?? "",
        estado: e.votoSiNo === "S" ? "VOTÓ" : "NO VOTÓ",
      })
    );

    // header bold
    ws.getRow(1).font = { bold: true };

    const buffer = await wb.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="no-votaron-${Date.now()}.xlsx"`,
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "No se pudo generar el Excel" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
