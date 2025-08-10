// app/api/electoral-rolls/electoral-rolls-loader/route.ts
import { NextRequest, NextResponse } from "next/server";
import { read, utils } from "xlsx";
import { db } from "@/lib/db";
import { formatApiMessage } from "@/lib/utils/formatters";
import { getUserIdFromRequest } from "@/lib/auth/getUserIdFromRequest";

interface ErrorDetail {
  numeroMatricula: string;
  nombre: string;
  apellido: string;
  motivo: string;
}

export async function POST(req: NextRequest) {
  try {
    console.log("[LOADER]", req);
    const userId = getUserIdFromRequest(req);

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const overwrite = formData.get("overwrite") === "true";

    if (!file || !(file instanceof File)) return NextResponse.json({ error: formatApiMessage("errors.fileNotFound") }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = utils.sheet_to_json<any>(sheet);

    const requiredFields = [
      "TX_CIRCUITO", "ESTBLECIMIENTO", "DIRECCION_ESTABLECIMIENTO",
      "NU_MATRICULA", "TX_NOMBRE", "TX_APELLIDO", "NUMERO_MESA", "NU_ORDEN_MESA"
    ];
    const missingFields = requiredFields.filter(f => !(f in data[0]));
    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Faltan columnas requeridas: ${missingFields.join(", ")}` }, { status: 400 });
    }

    const errorDetails: ErrorDetail[] = [];
    let insertedCircuits = 0, insertedEstablishments = 0, insertedPadron = 0;

    // ======= CIRCUITOS =======    
    const circuitoSet = new Set(data.map(r => r["TX_CIRCUITO"]));
    const nuevosCircuitos = Array.from(circuitoSet).map((circuito) => {
      const [codigo, nombre] = (circuito as string)?.split(" - ") ?? ["", ""];
      return { codigo, nombre: nombre || codigo, userId };
    }).filter(c => c.codigo);

    const resCircuitos = await db.circuito.createMany({ data: nuevosCircuitos, skipDuplicates: true });
    insertedCircuits = resCircuitos.count;

    const circuitosDB = await db.circuito.findMany();
    const circuitoMap = new Map(circuitosDB.map(c => [c.codigo, c.id]));

    // ======= ESTABLECIMIENTOS =======
    const establecimientoSet = new Set(data.map(r => `${r["ESTBLECIMIENTO"]}-${r["DIRECCION_ESTABLECIMIENTO"]}`));
    const rowMap = new Map<string, any>();
    data.forEach((r) => {
      rowMap.set(`${r["ESTBLECIMIENTO"]}-${r["DIRECCION_ESTABLECIMIENTO"]}`, r);
    });

    const nuevosEstablecimientos = Array.from(establecimientoSet).map(key => {
      const row = rowMap.get(key);
      const [nombre, direccion] = key.split("-");
      const circuitoId = circuitoMap.get(row["TX_CIRCUITO"]?.split(" - ")[0]);
      return circuitoId ? { nombre, direccion, circuitoId, userId } : null;
    }).filter(Boolean) as any[];

    const resEst = await db.establecimiento.createMany({ data: nuevosEstablecimientos, skipDuplicates: true });
    insertedEstablishments = resEst.count;

    const establecimientosDB = await db.establecimiento.findMany();
    const establecimientoMap = new Map(
      establecimientosDB.map((e) => [`${e.nombre}-${e.direccion}`, e.id])
    );

    // === MESAS POR ESTABLECIMIENTO ===
    const mesasPorEstablecimiento = data.map((row) => {
      const establecimientoId = establecimientoMap.get(`${row["ESTBLECIMIENTO"]}-${row["DIRECCION_ESTABLECIMIENTO"]}`);
      return establecimientoId && row["NUMERO_MESA"]
        ? { numero: parseInt(row["NUMERO_MESA"]), establecimientoId, userId, }
        : null;
    }).filter(Boolean) as { numero: number; establecimientoId: number; userId: string }[];

    await db.mesasPorEstablecimiento.createMany({ data: mesasPorEstablecimiento, skipDuplicates: true });

    // === PADRÓN ===
    if (overwrite) await db.padronElectoral.deleteMany();

    const registros = data.map(row => {
      const circuitoId = circuitoMap.get(row["TX_CIRCUITO"]?.split(" - ")[0]);
      const establecimientoId = establecimientoMap.get(`${row["ESTBLECIMIENTO"]}-${row["DIRECCION_ESTABLECIMIENTO"]}`);
      if (!circuitoId || !establecimientoId) {
        errorDetails.push({
          numeroMatricula: row["NU_MATRICULA"]?.toString() ?? "",
          nombre: row["TX_NOMBRE"] ?? "",
          apellido: row["TX_APELLIDO"] ?? "",
          motivo: "Falta circuito o establecimiento válido",
        });
        return null;
      }

      return {
        distrito: row["DISTRITO"] ?? "",
        tipo_ejemplar: row["TX_TIPO_EJEMPLAR"] ?? "",
        numeroMatricula: row["NU_MATRICULA"]?.toString() ?? "",
        apellido: row["TX_APELLIDO"] ?? "",
        nombre: row["TX_NOMBRE"] ?? "",
        clase: parseInt(row["TX_CLASE"] ?? "0"),
        genero: row["TX_GENERO"] ?? "",
        domicilio: row["TX_DOMICILIO"] ?? "",
        seccion: row["TX_SECCION"] ?? "",
        localidad: row["TX_LOCALIDAD"] ?? "",
        codigo_postal: String(row["TX_CODIGO_POSTAL"] ?? ""),
        tipo_nacionalidad: row["TX_TIPO_NACIONALIDAD"] ?? "",
        numero_mesa: parseInt(row["NUMERO_MESA"] ?? "0"),
        orden_mesa: parseInt(row["NU_ORDEN_MESA"] ?? "0"),
        voto_sino: row["voto_sino"] ?? "S",
        circuitoId,
        establecimientoId,
      };
    }).filter(Boolean) as any[];

    const batchSize = 1000;
    for (let i = 0; i < registros.length; i += batchSize) {
      const batch = registros.slice(i, i + batchSize);
      try {
        const result = await db.padronElectoral.createMany({ data: batch, skipDuplicates: true });
        insertedPadron += result.count;
      } catch (err) {
        batch.forEach((item) => {
          errorDetails.push({
            numeroMatricula: item.numeroMatricula,
            nombre: item.nombre,
            apellido: item.apellido,
            motivo: "Duplicado u otro error en createMany",
          });
        });
      }
    }

    return NextResponse.json({
      summary: {
        rows: insertedPadron,
        people: insertedPadron,
        establishments: insertedEstablishments,
        circuits: insertedCircuits,
        errors: errorDetails.length,
      },
      errorDetails,
    });
  } catch (error) {
    console.error("[IMPORT_ERROR]", error);
    return NextResponse.json({ error: "Fallo en el importador." }, { status: 500 });
  }
}

