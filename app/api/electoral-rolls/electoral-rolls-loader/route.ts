// app/api/electoral-rolls/electoral-rolls-loader/route.ts
import { NextRequest, NextResponse } from "next/server";
import { read, utils } from "xlsx";
import { getAuthOrThrow } from "@/utils/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthOrThrow(req);
    const userId = auth.userId;

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const workbook = read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = utils.sheet_to_json<any>(sheet);

    const errorDetails: { numero_matricula: string; nombre: string; apellido: string; motivo: string }[] = [];

    // ======= CIRCUITOS =======
    let insertedCircuits = 0;
    const circuitosUnicos = Array.from(
      new Set(data.map((row) => row["TX_CIRCUITO"]))
    );

    const nuevosCircuitos: { codigo: string; nombre: string }[] = [];

    for (const item of circuitosUnicos) {
      const [codigo, nombre] = item?.split(" - ") ?? ["", ""];
      if (!codigo) continue;
      nuevosCircuitos.push({ codigo, nombre: nombre ?? codigo });
    }

    const resCircuito = await db.circuito.createMany({
      data: nuevosCircuitos,
      skipDuplicates: true,
    });
    
    const omitidosCircuitos = nuevosCircuitos.length - resCircuito.count;
    if (omitidosCircuitos > 0) {
      const duplicados = nuevosCircuitos.slice(nuevosCircuitos.length - omitidosCircuitos);
      duplicados.forEach((c) => {
        errorDetails.push({
          numero_matricula: c.codigo,
          nombre: c.nombre,
          apellido: "",
          motivo: `Circuito duplicado: '${c.codigo}'`,
        });
      });
    }

    const circuitosDB = await db.circuito.findMany();
    const circuitoMap = new Map(circuitosDB.map((c) => [c.codigo, c.id]));

    insertedCircuits = resCircuito.count;

    // ======= ESTABLECIMIENTOS =======
    let insertedEstablishments = 0;
    const establecimientosUnicos = Array.from(
      new Set(
        data.map((row) => `${row["ESTBLECIMIENTO"]}-${row["DIRECCION_ESTABLECIMIENTO"]}`)
      )
    );

    const nuevosEstablecimientos: { nombre: string; direccion: string; circuitoId: number; userId: string }[] = [];

    for (const key of establecimientosUnicos) {
      const [nombre, direccion] = key.split("-");
      const row = data.find(
        (r) => `${r["ESTBLECIMIENTO"]}-${r["DIRECCION_ESTABLECIMIENTO"]}` === key
      );
      const codigoCircuito = row["TX_CIRCUITO"]?.split(" - ")[0];
      const circuitoId = circuitoMap.get(codigoCircuito);
      if (!circuitoId) continue;
      nuevosEstablecimientos.push({ nombre, direccion, circuitoId, userId });
    }

    const resEstablecimientos = await db.establecimiento.createMany({
      data: nuevosEstablecimientos,
      skipDuplicates: true,
    });

    const omitidosEst = nuevosEstablecimientos.length - resEstablecimientos.count;
    if (omitidosEst > 0) {
      const duplicados = nuevosEstablecimientos.slice(nuevosEstablecimientos.length - omitidosEst);
      duplicados.forEach((e) => {
        errorDetails.push({
          numero_matricula: e.nombre,
          nombre: e.direccion,
          apellido: "",
          motivo: `Establecimiento duplicado: '${e.nombre}'`,
        });
      });
    }

    const establecimientosDB = await db.establecimiento.findMany();
    const establecimientoMap = new Map(
      establecimientosDB.map((e) => [`${e.nombre}-${e.direccion}`, e.id])
    );
    insertedEstablishments = resEstablecimientos.count;

    // ======= PADRON =======
    const registros: any[] = [];

    for (const row of data) {
      const circuitoId = circuitoMap.get(row["TX_CIRCUITO"]?.split(" - ")[0]);
      const establecimientoId = establecimientoMap.get(
        `${row["ESTBLECIMIENTO"]}-${row["DIRECCION_ESTABLECIMIENTO"]}`
      );

      if (!circuitoId || !establecimientoId) {
        errorDetails.push({
          numero_matricula: row["NU_MATRICULA"]?.toString() ?? "",
          nombre: row["TX_NOMBRE"] ?? "",
          apellido: row["TX_APELLIDO"] ?? "",
          motivo: "Falta circuito o establecimiento válido",
        });
        continue;
      }

      registros.push({
        distrito: row["DISTRITO"] ?? "",
        tipo_ejemplar: row["TX_TIPO_EJEMPLAR"] ?? "",
        numero_matricula: row["NU_MATRICULA"]?.toString() ?? "",
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
      });
    }

    const batchSize = 1000;
    let inserted = 0;

    await db.padronElectoral.deleteMany();

    for (let i = 0; i < registros.length; i += batchSize) {
      const batch = registros.slice(i, i + batchSize);
      try {
        const result = await db.padronElectoral.createMany({
          data: batch,
          skipDuplicates: true,
        });

        inserted += result.count;

        const noInsertados = batch.length - result.count;
        if (noInsertados > 0) {
          const omitidos = batch.slice(batch.length - noInsertados);
          omitidos.forEach((item) => {
            errorDetails.push({
              numero_matricula: item.numero_matricula,
              nombre: item.nombre,
              apellido: item.apellido,
              motivo: "Duplicado (omitido por skipDuplicates)",
            });
          });
        }
      } catch (error) {
        batch.forEach((item) => {
          errorDetails.push({
            numero_matricula: item.numero_matricula,
            nombre: item.nombre,
            apellido: item.apellido,
            motivo: "Duplicado u otro error en createMany",
          });
        });
      }
    }

    return NextResponse.json({
      rows: inserted,
      people: inserted,
      establishments: insertedEstablishments,
      circuits: insertedCircuits,
      errors: errorDetails.length,
      errorDetails,
    });
  } catch (error) {
    console.error("[IMPORT_ERROR]", error);
    return NextResponse.json({ error: "Fallo en el importador." }, { status: 500 });
  }
}
