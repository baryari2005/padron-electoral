"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UseFormReturn, useWatch } from "react-hook-form";
import axiosInstance from "@/utils/axios";
import { CertificadoFormData } from "../utils/schema";
import { EstablecimientoConCircuito } from "./types";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FormCombo } from "../../components/FormsCreate/FormCombo";

interface MesaSelectorProps {
  control: UseFormReturn<CertificadoFormData>["control"];
  setValue: UseFormReturn<CertificadoFormData>["setValue"];
  onEscuelaSeleccionada?: (establecimiento: EstablecimientoConCircuito) => void;

  /** Si viene true, el campo "Número de mesa" queda en solo lectura */
  disabled?: boolean;

  /** Prefijar escuela: objeto completo o id */
  fixedEscuela?: EstablecimientoConCircuito | null;
  fixedEscuelaId?: number | string;

  /**
   * true  => RESTRINGE a la escuela fija (readonly, no lista)
   * false => PREFILL pero PERMITE ver/cambiar por cualquiera
   * default: false
   */
  restrictToFixed?: boolean;
}

export function MesaSelector({
  control,
  setValue,
  onEscuelaSeleccionada,
  disabled,
  fixedEscuela,
  fixedEscuelaId,
  restrictToFixed = false, 
}: MesaSelectorProps) {
// ————— Política de "disabled" fijada al montar —————
  const hadFixedAtMount = useRef(Boolean(fixedEscuela || fixedEscuelaId)).current;
  const locked = restrictToFixed && hadFixedAtMount; // modo readonly total
  const disabledEstablishment = hadFixedAtMount && !locked; // combo deshabilitado

  // Lista de escuelas (en modo no-bloqueado)
  const [escuelas, setEscuelas] = useState<EstablecimientoConCircuito[]>([]);
  const [loadingEstabs, setLoadingEstabs] = useState(!locked);

  const [escuelaSeleccionada, setEscuelaSeleccionada] =
    useState<EstablecimientoConCircuito | null>(null);

  const [mesasDisponibles, setMesasDisponibles] = useState<{ numero: number }[]>([]);
  const [loadingMesas, setLoadingMesas] = useState(false);

  // Evitar condiciones de carrera al cambiar rápido de escuela
  const lastReqId = useRef(0);

  /** Carga mesas disponibles para una escuela (filtra no escrutadas) */
  const loadMesasDisponibles = async (establecimientoId: number | string) => {
    const reqId = ++lastReqId.current;
    try {
      setLoadingMesas(true);
      setMesasDisponibles([]); // limpia para no mostrar restos
      const res = await axiosInstance.get(
        `/api/establishments/${establecimientoId}/available-tables`
      );
      if (reqId !== lastReqId.current) return; // respuesta vieja, descartar
      const mesasFiltradas = (res.data.items ?? []).filter((m: any) => !m.escrutada);
      setMesasDisponibles(mesasFiltradas);
    } catch (err) {
      if (reqId !== lastReqId.current) return;
      console.error("Error al cargar mesas disponibles", err);
      setMesasDisponibles([]);
    } finally {
      if (reqId === lastReqId.current) setLoadingMesas(false);
    }
  };

  /** Aplica escuela al form + estado + callback + recarga mesas */
  const applyEscuela = async (establecimiento: EstablecimientoConCircuito | null) => {
    if (!establecimiento) return;
    if (escuelaSeleccionada?.id === establecimiento.id) return; // evita re-aplicar

    setValue("mesa.escuelaId", String(establecimiento.id), { shouldDirty: true });
    const circuitoId = establecimiento.circuito?.id ?? establecimiento.circuito?.id;
    if (circuitoId) {
      setValue("mesa.circuitoId", String(circuitoId), { shouldDirty: true });
    }

    // reset número de mesa y cargar disponibles
    setValue("mesa.numeroMesa", "", { shouldDirty: true });
    await loadMesasDisponibles(establecimiento.id);

    setEscuelaSeleccionada(establecimiento);
    onEscuelaSeleccionada?.(establecimiento);
  };

  

  /** Manejo de logs */
  // 1) Log de props (una vez y cuando cambien)
  // useEffect(() => {
    // console.groupCollapsed("[MesaSelector] props");
    // console.log("disabledEstablishment:", disabledEstablishment);
    // console.log({ disabled, fixedEscuelaId, restrictToFixed, hasOnEscuelaSeleccionada: !!onEscuelaSeleccionada });
    // console.log("fixedEscuela:", fixedEscuela);
    // console.groupEnd();
  //   console.log("loadingEstabs: ", loadingEstabs);
  //   console.log("disabledEstablishment: ", disabledEstablishment);
  // }, [disabledEstablishment, disabled, fixedEscuela, fixedEscuelaId, restrictToFixed, onEscuelaSeleccionada]);

  // // 2) Si querés ver valores del form que controla este selector:
  // const escuelaId = useWatch({ control: control as any, name: "mesa.escuelaId" as any });
  // const numeroMesa = useWatch({ control: control as any, name: "mesa.numero" as any });

  // useEffect(() => {
  //   console.log("[MesaSelector] watch form fields →", { escuelaId, numeroMesa });
  // }, [escuelaId, numeroMesa]);

  // // 3) Envolver setValue para ver cuándo lo llamás desde este componente
  // const setValueLog = useCallback(
  //   (name: any, value: any, options?: any) => {
  //     console.log("[MesaSelector] setValue:", name, value, options);
  //     return setValue(name, value, options as any);
  //   },
  //   [setValue]
  // );



  /** Prefill si viene fixed (objeto o id) — NO fuerza bloqueo por sí solo */
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!hadFixedAtMount) return;

      if (fixedEscuela && mounted) {
        await applyEscuela(fixedEscuela);
        return;
      }
      if (fixedEscuelaId) {
        try {
          const { data } = await axiosInstance.get<EstablecimientoConCircuito>(
            `/api/establishments/${fixedEscuelaId}`
          );
          if (mounted) await applyEscuela(data);
        } catch (e) {
          console.error("No se pudo cargar la escuela fija por id:", e);
        }
      }
    })();
    return () => {
      mounted = false;
    };    
  }, []); // ← vacío: sólo al montar

  /** Cargar lista de escuelas (sólo si NO está restringido a la fija) */
  useEffect(() => {
    if (locked) return; // en modo restringido mostramos sólo el readonly
    (async () => {
      try {
        setLoadingEstabs(true);
        const res = await axiosInstance.get("/api/establishments?all=true");
        setEscuelas(res.data.items ?? []);
      } catch (err) {
        console.error("Error al cargar escuelas", err);
      } finally {
        setLoadingEstabs(false);
      }
    })();
  }, [locked]);

  /**
   * Si estamos en modo PREFILL (hasFixed === true, locked === false) y la escuela
   * prefijada no aparece en la lista (por permisos/paginación), la inyectamos arriba
   * para que el combo muestre el label correcto y se pueda cambiar a otra.
   */
  const escuelasOptions = useMemo(() => {
    if (locked) return escuelas; // en locked no se usa el combo
    if (!escuelaSeleccionada) return escuelas;
    const exists = escuelas.some((e) => String(e.id) === String(escuelaSeleccionada.id));
    return exists ? escuelas : [escuelaSeleccionada, ...escuelas];
  }, [locked, escuelas, escuelaSeleccionada]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[68%_30%] gap-4 md:gap-x-6 md:px-1 items-start">
      {/* ===== ESCUELA ===== */}
      <FormField
        control={control}
        name="mesa.escuelaId"
        render={({ field }) => {
          const triggerId = "escuela-escuelaId-trigger";
          const labelId = "escuela-escuelaId-label";

          // READ-ONLY real SOLO si restrictToFixed === true
          if (locked) {
            return (
              <FormItem>
                <FormLabel id={labelId} htmlFor="escuela-readonly">
                  Escuela / Establecimiento
                </FormLabel>
                <FormControl>
                  <Input
                    id="escuela-readonly"
                    value={escuelaSeleccionada?.nombre ?? ""}
                    disabled
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }

          // Editable (aunque venga prefijada): permite ver TODAS
          return (
            <FormItem>
              <FormLabel id={labelId} htmlFor={triggerId}>
                Escuela / Establecimiento
              </FormLabel>
              <FormControl>
                <FormCombo<EstablecimientoConCircuito>
                  id={triggerId}
                  labelId={labelId}
                  value={String(field.value ?? "")}
                  onChange={(v) => field.onChange(v)}
                  options={escuelasOptions}
                  getOptionLabel={(e) => e.nombre}
                  getOptionValue={(e) => String(e.id)}
                  onOptionSelected={async (establecimiento) => {
                    await applyEscuela(establecimiento);
                  }}
                  loading={loadingEstabs}
                  disabled={loadingEstabs || disabledEstablishment}
                  placeholder={loadingEstabs ? "Cargando…" : "Seleccionar"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      {/* ===== NÚMERO DE MESA ===== */}
      <FormField
        control={control}
        name="mesa.numeroMesa"
        render={({ field }) => {
          const triggerId = "escuela-nromesa-trigger";
          const labelId = "escuela-nromesa-label";

          // Si disabled externo está activo, la mesa queda readonly
          if (disabled) {
            return (
              <FormItem>
                <FormLabel id={labelId} htmlFor="nro-mesa-readonly">
                  Número de Mesa
                </FormLabel>
                <FormControl>
                  <Input
                    id="nro-mesa-readonly"
                    value={`${field.value ?? ""}`}
                    disabled
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }

          return (
            <FormItem>
              <FormLabel id={labelId} htmlFor={triggerId}>
                Número de Mesa
              </FormLabel>
              <FormControl>
                <FormCombo<{ numero: number }>
                  id={triggerId}
                  labelId={labelId}
                  value={String(field.value ?? "")}
                  onChange={(v) => field.onChange(v)}
                  options={mesasDisponibles}
                  getOptionLabel={(m) => `Mesa ${m.numero}`}
                  getOptionValue={(m) => String(m.numero)}
                  disabled={!escuelaSeleccionada || loadingMesas}
                  loading={loadingMesas}
                  placeholder={
                    !escuelaSeleccionada
                      ? "Seleccionar establecimiento primero"
                      : loadingMesas
                        ? "Cargando mesas…"
                        : "Seleccionar"
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
}
