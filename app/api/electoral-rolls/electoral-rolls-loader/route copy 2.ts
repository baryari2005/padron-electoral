import { NextRequest, NextResponse } from "next/server";
import { getAuthOrThrow } from "@/utils/auth";

import { db } from "@/lib/db";

import { read, utils } from 'xlsx';
import { v4 as _uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthOrThrow(req);
    const loggedUserId = auth.userId;

    if (!loggedUserId)
      return NextResponse.json({ error: "Usuario no autorizado para realizar el proceso." }, { status: 401 });

    try {
      const formData = await req.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "No se subió ningún archivo válido." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      //const tempPath = path.join("/tmp", `${_uuidv4()}.xlsx`);
      //const tempPath = path.join(process.cwd(), "public", `${_uuidv4()}.xlsx`);
      //await writeFile(tempPath, buffer);

      const workbook = read(buffer, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = utils.sheet_to_json<any>(sheet);

      const circuitoMap = new Map<string, number>();
      const establecimientoMap = new Map<string, number>();

      let newPeople = 0;
      let newEstablishments = 0;
      let newCircuits = 0;
      let errors = 0;
      let rows = data.length;
      const errorDetails: any[] = [];

      await db.padronElectoral.deleteMany();

      for (const row of data) {
        const circuitoRaw = row["TX_CIRCUITO"];
        const [codigoCircuito, nombreCircuito] = circuitoRaw?.split(" - ") ?? [];

        let circuitoId: number;
        if (circuitoMap.has(codigoCircuito)) {
          circuitoId = circuitoMap.get(codigoCircuito)!;
        } else {
          const circuito = await db.circuito.upsert({
            where: { codigo: codigoCircuito },
            update: {},
            create: {
              codigo: codigoCircuito,
              nombre: nombreCircuito ?? codigoCircuito,
            },
          });
          circuitoId = circuito.id;
          circuitoMap.set(codigoCircuito, circuitoId);
          newCircuits++;
        }

        const nombreEstablecimiento = row["ESTBLECIMIENTO"];
        const direccion = row["DIRECCION_ESTABLECIMIENTO"];
        const keyEst = `${nombreEstablecimiento}-${direccion}`;
        let establecimientoId: number;

        if (establecimientoMap.has(keyEst)) {
          establecimientoId = establecimientoMap.get(keyEst)!;
        } else {
          const est = await db.establecimiento.upsert({
            where: {
              nombre_direccion: {
                nombre: nombreEstablecimiento,
                direccion: direccion,
              },
            },
            update: {},
            create: {
              nombre: nombreEstablecimiento,
              direccion: direccion,
              circuitoId,
              userId: loggedUserId,
            },
          });
          establecimientoId = est.id;
          establecimientoMap.set(keyEst, establecimientoId);
          newEstablishments++;
        }

        try {
          await db.padronElectoral.create({
            data: {
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
            },
          });
          newPeople++;
        } catch (err: any) {
          errorDetails.push({
            numero_matricula: row["NU_MATRICULA"],
            nombre: row["TX_NOMBRE"],
            apellido: row["TX_APELLIDO"],
            motivo: "Duplicado",
          });
          errors++;
        }
      }

      return NextResponse.json({
        rows: rows,
        establishments: newEstablishments,
        circuits: newCircuits,
        people: newPeople,
        errors,
      });
    } catch (error) {
      console.error("[IMPORT_PADRON]", error);
      return NextResponse.json({ error: "Error al procesar el archivo" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Fallo inesperado." }, { status: 500 });
  }
}
