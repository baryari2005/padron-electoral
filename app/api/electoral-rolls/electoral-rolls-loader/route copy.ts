// import { NextRequest, NextResponse } from "next/server";
// import * as XLSX from "xlsx";
// import { db } from "@/lib/db";
// import { getAuthOrThrow } from "@/utils/auth";


// export async function POST(req: NextRequest) {
//   try {
//     const auth = getAuthOrThrow(req);
//     const loggedUserId = auth.userId;
    
//     if (!loggedUserId)
//       return NextResponse.json({ error: "Usuario no autorizado para realizar el proceso." }, { status: 401 });
        
//     const formData = await req.formData();
//     const file = formData.get("file");

//     if (!(file instanceof File)) {
//       return NextResponse.json({ error: "No se subió ningún archivo válido." }, { status: 400 });
//     }


//     const arrayBuffer = await file.arrayBuffer();
//     const data = new Uint8Array(arrayBuffer);
//     const workbook = XLSX.read(data, { type: "array" });
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const rows = XLSX.utils.sheet_to_json(sheet, { raw: true, defval: "" }) as any[];

//     const cleanRows = rows.map((row) => {
//       const cleaned: any = {};
//       for (const key in row) {
//         cleaned[key.trim()] = row[key];
//       }
//       return cleaned;
//     });

//     const filteredRows = cleanRows.filter(row =>
//       Object.values(row).some(val => val !== null && val !== "" && val !== 0)
//     );

//     const padronData = filteredRows.map((row: any) => ({
//       distrito: row["DISTRITO"] ?? "",
//       tipo_ejemplar: row["TX_TIPO_EJEMPLAR"] ?? "",
//       numero_matricula: String(row["NU_MATRICULA"] ?? ""),
//       apellido: row["TX_APELLIDO"] ?? "",
//       nombre: row["TX_NOMBRE"] ?? "",
//       clase: Number(row["TX_CLASE"] ?? 0),
//       genero: row["TX_GENERO"] ?? "",
//       domicilio: row["TX_DOMICILIO"] ?? "",
//       seccion: row["TX_SECCION"] ?? "",
//       circuito: row["TX_CIRCUITO"] ?? "",
//       localidad: row["TX_LOCALIDAD"] ?? "",
//       codigo_postal: String(row["TX_CODIGO_POSTAL"] ?? ""),
//       tipo_nacionalidad: row["TX_TIPO_NACIONALIDAD"] ?? "",
//       numero_mesa: Number(row["NUMERO_MESA"] ?? 0),
//       orden_mesa: Number(row["NU_ORDEN_MESA"] ?? 0),
//       establecimiento: row["ESTBLECIMIENTO"] ?? "",
//       direccion_establecimiento: row["DIRECCION_ESTABLECIMIENTO"] ?? "",
//       voto_sino: row["VOTO_SINO"]?.toString().trim().toUpperCase() || "NO",
//     }));

//     // Extraer establecimientos únicos
//     const establecimientosUnicos = Array.from(
//       new Set(padronData.map((row) => `${row.establecimiento}|${row.direccion_establecimiento}`))
//     ).map((combo) => {
//       const [nombre, direccion] = combo.split("|");
//       return { nombre, direccion };
//     });

//     // Insertar o buscar los establecimientos
//     for (const est of establecimientosUnicos) {
//       await db.establecimiento.upsert({
//         where: {
//           // Usamos la clave compuesta única
//           nombre_direccion: {
//             nombre: est.nombre,
//             direccion: est.direccion,
//           },
//         },
//         update: {},
//         create: {
//           nombre: est.nombre,
//           direccion: est.direccion,
//           userId: userId
//         },
//       });
//     }

//     const establecimientos = await db.establecimiento.findMany();
//     const mapEstablecimientos = new Map<string, number>();
//     establecimientos.forEach((e) => {
//       mapEstablecimientos.set(`${e.nombre}|${e.direccion}`, e.id);
//     });

//     let errors = 0;
//     const registrosFinales = padronData
//       .map((row) => {
//         const key = `${row.establecimiento}|${row.direccion_establecimiento}`;
//         const establecimientoId = mapEstablecimientos.get(key);
//         if (!establecimientoId) {
//           errors++;
//           return null;
//         }
//         return {
//           distrito: row.distrito,
//           tipo_ejemplar: row.tipo_ejemplar,
//           numero_matricula: row.numero_matricula,
//           apellido: row.apellido,
//           nombre: row.nombre,
//           clase: row.clase,
//           genero: row.genero,
//           domicilio: row.domicilio,
//           seccion: row.seccion,
//           circuito: row.circuito,
//           localidad: row.localidad,
//           codigo_postal: row.codigo_postal,
//           tipo_nacionalidad: row.tipo_nacionalidad,
//           numero_mesa: row.numero_mesa,
//           orden_mesa: row.orden_mesa,
//           voto_sino: row.voto_sino,
//           establecimientoId,
//         };
//       })
//       .filter((r): r is Exclude<typeof r, null> => r !== null);

//     await db.padronElectoral.deleteMany();

//     await db.padronElectoral.createMany({
//       data: registrosFinales,
//       skipDuplicates: true,
//     });

//     return NextResponse.json({
//       message: `Se importaron ${registrosFinales.length} registros.`,
//       rows: registrosFinales.length,
//       establishments: establecimientosUnicos.length,
//       people: registrosFinales.length,
//       errors,
//     });
//   } catch (error: any) {
//     console.error("Error al procesar el Excel:", error);
//     return NextResponse.json(
//       { error: "Error interno al importar.", detalle: error.message },
//       { status: 500 }
//     );
//   }
// }
