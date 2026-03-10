// src/lib/padron.ts
import type { Prisma, PrismaClient } from "@prisma/client";
import { stripLeadingZeros } from "../features/utils/stripLeadingZeros";
import { toUpperEs } from "../features/utils/toUpperEs";
import type { ImportErrorDetail as AppImportErrorDetail, ImportMode } from "../features/electoral-rolls/types";
import { NuevoPadron } from "../features/electoral-rolls/newElectoralRoll";
import { DbClient } from "./dbTypes";


const CIRCUITO_KEYS = ["TX_CIRCUITO", "TX CIRCUITO", "CIRCUITO", "COD_CIRC", "CODIGO_CIRCUITO"];
const ESTABLECIMIENTO_KEYS = ["ESTABLECIMIENTO", "ESTBLECIMIENTO", "TX_ESTABLECIMIENTO", "NOMBRE_ESTABLECIMIENTO"];

const DISTRITO_KEYS = ["DISTRITO", "ID_DISTRITO", "TX_SECCION"];
const TIPO_EJEMPLAR_KEYS = ["TX_TIPO_EJEMPLAR", "TIPO_EJEMPLAR", "TIPO_DOC"];
const MATRICULA_KEYS = ["NU_MATRICULA", "MATRICULA", "DOCUMENTO"];
const APELLIDO_KEYS = ["TX_APELLIDO", "APELLIDO"];
const NOMBRE_KEYS = ["TX_NOMBRE", "NOMBRE"];
const APELLIDO_NOMBRE_KEYS = ["APELLIDO_NOMBRE"];
const CLASE_KEYS = ["TX_CLASE", "CLASE"];
const GENERO_KEYS = ["TX_GENERO", "GENERO", "SEXO"];
const DOMICILIO_KEYS = ["TX_DOMICILIO", "DOMICILIO"];
const SECCION_KEYS = ["TX_SECCION", "SECCION", "SECCION_ID", "ID_DISTRITO"];
const LOCALIDAD_KEYS = ["TX_LOCALIDAD", "LOCALIDAD", "LODALIDAD"];
const CP_KEYS = ["TX_CODIGO_POSTAL", "CODIGO_POSTAL"];
const NACIONALIDAD_KEYS = ["TX_TIPO_NACIONALIDAD", "TIPO_NACIONALIDAD", "NACIONALIDAD"];
const MESA_KEYS = ["NUMERO_MESA", "NRO_MESA", "MESA"];
const ORDEN_MESA_KEYS = ["NU_ORDEN_MESA", "ORDEN_MESA", "ORDEN"];
const VOTO_KEYS = ["voto_sino", "VOTO", "VOTO_SI_NO"];

const TELEFONO_KEYS = ["TELEFONO", "TELEFONO_AFILIADO"];
const REFERENTE_KEYS = ["REFERENTE"];
const PLANILLERO_KEYS = ["PLANILLERO"];
const CHOFER_KEYS = ["CHOFER"];
const PLANILLA_KEYS = ["N_PLANILLA", "NUMERO_PLANILLA"];

// ===== Helpers =====
const s = (val: any): string | null => {
  const out = (val ?? "").toString().trim();
  return out.length ? out : null;
};

const splitApellidoNombre = (raw: string): { apellido: string; nombre: string } => {
  const txt = (raw ?? "").trim();
  if (!txt) return { apellido: "", nombre: "" };
  const idx = txt.indexOf(" ");
  if (idx === -1) return { apellido: txt, nombre: "" };
  return { apellido: txt.slice(0, idx).trim(), nombre: txt.slice(idx + 1).trim() };
};

// ===== Mapper de fila a registro de padrón =====
function mapRowToPadron<T extends Record<string, any>>(row: T, ctx: {
  getField: (row: T, keys: string[]) => any;
  norm: (s: string | null) => string;
  toInt: (s: string | number | null) => number | null;
  userId: string;
  circuitoMap: Map<string, number>;                 // codigoCircuito (sin ceros) -> id
  establecimientoMapByNombre: Map<string, number>;  // clave = toUpperEs(norm(nombre))
  onError?: (e: AppImportErrorDetail) => void;
}): NuevoPadron | null {
  const { getField, norm, toInt, userId, circuitoMap, establecimientoMapByNombre, onError } = ctx;

  // Circuito
  const circuitoTxt = norm(s(getField(row, CIRCUITO_KEYS)));
  const [codigoRaw] = (circuitoTxt ?? "").split(/\s*-\s*/);
  const codigoCircuito = stripLeadingZeros(norm(codigoRaw ?? null));
  const circuitoId = circuitoMap.get(codigoCircuito);

  // Establecimiento por NOMBRE
  const estNombreUC = toUpperEs(norm(s(getField(row, ESTABLECIMIENTO_KEYS))));

  // Identificación
  const numeroMatricula = (s(getField(row, MATRICULA_KEYS)) ?? "") as string;

  // Apellido / Nombre (con soporte combinado)
  let apellido = "";
  let nombre = "";
  const apNomRaw = s(getField(row, APELLIDO_NOMBRE_KEYS));
  if (apNomRaw) {
    const split = splitApellidoNombre(apNomRaw);
    apellido = norm(split.apellido);
    nombre = norm(split.nombre);
  } else {
    apellido = norm(s(getField(row, APELLIDO_KEYS)));
    nombre = norm(s(getField(row, NOMBRE_KEYS)));
  }

  if (!circuitoId || !estNombreUC) {
    onError?.({
      numeroMatricula,
      nombre: nombre ?? "",
      apellido: apellido ?? "",
      motivo: !circuitoId ? "Circuito inválido" : "Establecimiento (nombre) vacío",
    });
    return null;
  }

  const establecimientoId = establecimientoMapByNombre.get(estNombreUC);
  if (!establecimientoId) {
    onError?.({
      numeroMatricula,
      nombre: nombre ?? "",
      apellido: apellido ?? "",
      motivo: `No se encontró establecimiento por nombre: ${estNombreUC}`,
    });
    return null;
  }

  // Num/orden mesa
  const numeroMesa = toInt(s(getField(row, MESA_KEYS)));
  const ordenMesa = toInt(s(getField(row, ORDEN_MESA_KEYS)));

  // Resto de campos (con defaults)
  const distrito = norm(s(getField(row, DISTRITO_KEYS)));
  const tipoEjemplarRaw = norm(s(getField(row, TIPO_EJEMPLAR_KEYS)));
  const tipoEjemplar = tipoEjemplarRaw && tipoEjemplarRaw.trim() !== ""
    ? tipoEjemplarRaw
    : "DNI-EA";

  const clase = toInt(s(getField(row, CLASE_KEYS)));
  const genero = norm(s(getField(row, GENERO_KEYS)));
  const domicilio = norm(s(getField(row, DOMICILIO_KEYS)));
  const seccion = norm(s(getField(row, SECCION_KEYS)));
  const localidad = norm(s(getField(row, LOCALIDAD_KEYS))) || "San Miguel 2025";
  const codigoPostal = (s(getField(row, CP_KEYS)) || "") as string;
  const tipoNacionalidad = norm(s(getField(row, NACIONALIDAD_KEYS))) || "ARGENTINO";

  const referenteNombre = norm(s(getField(row, REFERENTE_KEYS)))?.toUpperCase();

  let votoSiNo: "S" | "N" = "N"; // default seguro

  if (!referenteNombre) {
    const votoBruto = norm(s(getField(row, VOTO_KEYS)));

    if (votoBruto === "S" || votoBruto === "SI") {
      votoSiNo = "S";
    } else {
      votoSiNo = "N";
    }
  }
  const telefono = norm(s(getField(row, TELEFONO_KEYS)));

  
  const planilleroNombre = norm(s(getField(row, PLANILLERO_KEYS)))?.toUpperCase();
  const choferNombre = norm(s(getField(row, CHOFER_KEYS)))?.toUpperCase();
  const planillaNumero = norm(s(getField(row, PLANILLA_KEYS)));

  return {
    distrito,
    tipoEjemplar,
    numeroMatricula,
    apellido,
    nombre,
    clase,
    genero,
    domicilio,
    seccion,
    localidad,
    codigoPostal,
    tipoNacionalidad,
    numeroMesa,
    ordenMesa,
    votoSiNo,
    circuitoId,
    establecimientoId,
    userId,
    telefono,
    referenteNombre,
    planilleroNombre,
    choferNombre,
    planillaNumero,
  };
}

// ===== Builder (sin persistir) =====
export function buildPadronFromRows<T extends Record<string, any>>(
  data: T[],
  opts: {
    getField: (row: T, keys: string[]) => any;
    norm: (s: string | null) => string;
    toInt: (s: string | number | null) => number | null;
    userId: string;
    circuitoMap: Map<string, number>;
    establecimientoMapByNombre: Map<string, number>;
    onError?: (e: AppImportErrorDetail) => void;
    debug?: boolean;
  }
): { records: NuevoPadron[]; errors: number } {
  const { getField, norm, toInt, userId, circuitoMap, establecimientoMapByNombre, onError, debug } = opts;

  const records: NuevoPadron[] = [];
  let errors = 0;
  let vistos = 0;

  for (const row of data) {
    vistos++;
    const rec = mapRowToPadron(row, {
      getField, norm, toInt, userId, circuitoMap, establecimientoMapByNombre,
      onError: (e) => { errors++; onError?.(e); }
    });
    if (rec) records.push(rec);
  }

  if (debug) {
    console.log(`🗂️ padrón filas vistas: ${vistos} | válidas: ${records.length} | con error: ${errors}`);
  }

  return { records, errors };
}

// ===== Persistencia batched =====
export async function persistPadronFromRowsBatched<T extends Record<string, any>>(
  prisma: DbClient,
  data: T[],
  opts: {
    getField: (row: T, keys: string[]) => any;
    norm: (s: string | null) => string;
    toInt: (s: string | number | null) => number | null;
    userId: string;
    circuitoMap: Map<string, number>;
    establecimientoMapByNombre: Map<string, number>;

    // 🔥 NUEVOS
    personaIdMap: Map<string, number>;
    planillaIdMap: Map<string, number>;
    eleccionId: number;

    batchSize?: number;
    skipDuplicates?: boolean;
    onError?: (e: AppImportErrorDetail) => void;
    debug?: boolean;
    mode?: ImportMode;
  }
) {
  const {
    getField,
    norm,
    toInt,
    userId,
    circuitoMap,
    establecimientoMapByNombre,
    personaIdMap,
    planillaIdMap,
    eleccionId,
    batchSize = 1000,
    skipDuplicates = true,
    onError,
    debug,
    mode = "append",
  } = opts;

  let inserted = 0;
  let processed = 0;
  let errors = 0;
  const buffer: NuevoPadron[] = [];


  const flush = async () => {
    if (!buffer.length) return;

    const toCreate: Prisma.PadronElectoralCreateManyInput[] =
      buffer.map((r) => ({
        distrito: r.distrito ?? "",
        tipoEjemplar: r.tipoEjemplar ?? "",
        numeroMatricula: r.numeroMatricula,
        apellido: r.apellido ?? "",
        nombre: r.nombre ?? "",
        genero: r.genero ?? "",
        domicilio: r.domicilio ?? "",
        seccion: r.seccion ?? "",
        localidad: r.localidad ?? "San Miguel 2025",
        codigoPostal: r.codigoPostal ?? "",
        tipoNacionalidad: r.tipoNacionalidad ?? "ARGENTINO",
        votoSiNo: r.votoSiNo ?? "S",

        clase: r.clase ?? 0,
        numeroMesa: r.numeroMesa ?? 0,
        ordenMesa: r.ordenMesa ?? 0,

        telefono: r.telefono ?? null,

        circuitoId: r.circuitoId,
        establecimientoId: r.establecimientoId,
        userId: r.userId,
        eleccionId,

        referenteId: r.referenteNombre
          ? personaIdMap.get(`${r.referenteNombre}|REFERENTE`) ?? null
          : null,

        planilleroId: r.planilleroNombre
          ? personaIdMap.get(`${r.planilleroNombre}|PLANILLERO`) ?? null
          : null,

        choferId: r.choferNombre
          ? personaIdMap.get(`${r.choferNombre}|CHOFER`) ?? null
          : null,

        planillaId: r.planillaNumero
          ? planillaIdMap.get(r.planillaNumero) ?? null
          : null,
      }));

    const doSkip = mode === "append" ? !!skipDuplicates : false;

    const res = await prisma.padronElectoral.createMany({
      data: toCreate,
      skipDuplicates: doSkip,
    });

    inserted += res.count;

    if (debug)
      console.log("📦 batch insertado. total acumulado:", inserted);

    buffer.length = 0;
  };

  for (const row of data) {
    processed++;

    const rec = mapRowToPadron(row, {
      getField,
      norm,
      toInt,
      userId,
      circuitoMap,
      establecimientoMapByNombre,
      onError: (e) => {
        errors++;
        onError?.(e);
      },
    });

    if (!rec) continue;

    buffer.push(rec);

    if (buffer.length >= batchSize) await flush();
  }

  await flush();

  if (debug) {
    console.log(
      `✅ padrón procesado | filas: ${processed} | insertadas: ${inserted} | errores: ${errors} | mode=${mode}`
    );
  }

  return { inserted, processed, errors };
}
