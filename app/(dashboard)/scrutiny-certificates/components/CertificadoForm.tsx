"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import axiosInstance from "@/utils/axios";

import { certificadoSchema, CertificadoFormData } from "../utils/schema";
import MesaSelector from "./MesaSelector";
import CargoResultados from "./CargoResultados";
import VotosEspecialesForm from "./VotosEspecialesForm";
import TotalesForm from "./TotalesForm";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import ResultadosPresidencialesForm from "./ResultadosPresidencialesForm";
import { AgrupacionPolitica } from "@prisma/client";
import CompensacionForm from "./CompensacionFirmasForm";
import FiscalesForm from "./FiscalesForm";

interface CertificadoFormProps {
    onMesaChange: (mesa: string) => void;
}

export default function CertificadoForm({ onMesaChange }: CertificadoFormProps) {
    const [agrupaciones, setAgrupaciones] = useState<AgrupacionPolitica[]>([]);
    const [categorias, setCategorias] = useState<{ id: string; nombre: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CertificadoFormData>({
        resolver: zodResolver(certificadoSchema),
        defaultValues: {
            mesa: { escuelaId: "", numeroMesa: "" },
            resultados: [],
            votosEspeciales: {
                presidente: { blancos: 0, nulos: 0, recurridos: 0, impugnados: 0, comandoElectoral: 0 },
                parlamentario: { blancos: 0, nulos: 0, recurridos: 0, impugnados: 0, comandoElectoral: 0 },
            },
            totales: { sobres: 0, votantes: 0, diferencia: 0 },
            firmas: {
                presidente: "",
                vocal: "",
                fiscales: [],
            },
            resultadosPresidenciales: [],
            compensacion: {
                presidente: { firma: "", aclaracion: "", dni: "" },
                vocal: { firma: "", aclaracion: "", dni: "" },
            },
        },
    });

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const res = await axiosInstance.get("/api/categories");
                setCategorias(res.data.categories); // asegurate que venga como [{ id: 'presidente', nombre: 'PRESIDENTE' }, ...]
            } catch {
                toast.error("Error al cargar categorías.");
            }
        };

        fetchCategorias();
    }, []);

    useEffect(() => {
        const fetchAgrupaciones = async () => {
            try {
                const res = await axiosInstance.get("/api/political-groups");
                setAgrupaciones(res.data.politicalGroups);
            } catch {
                toast.error("Error al cargar agrupaciones políticas.");
            } finally {
                setLoading(false);
            }
        };

        fetchAgrupaciones();
    }, []);

    useEffect(() => {
        if (!loading && agrupaciones.length > 0 && categorias.length > 0) {
            form.reset({
                ...form.getValues(),
                resultadosPresidenciales: agrupaciones.map((a) => {
                    const base: any = {
                        nombre: a.nombre,
                        numero: a.numero,
                        profileImage: a.profileImage ?? "",
                    };

                    // Inicializar cada categoría dinámica en 0
                    categorias.forEach((cat) => {
                        base[cat.id] = 0;
                    });

                    return base;
                }),
            });
        }
    }, [agrupaciones, categorias, loading]);

    useEffect(() => {
        const subscription = form.watch((value) => {
            if (value.mesa?.numeroMesa) {
                onMesaChange(value.mesa.numeroMesa);
            }
        });
        return () => subscription?.unsubscribe?.();
    }, [form.watch, onMesaChange]);

    const onSubmit = async (data: CertificadoFormData) => {
        setIsSubmitting(true);
        try {
            await axiosInstance.post("/api/scrutiny-certificates", data);
            toast.success("Certificado guardado con éxito.");
            form.reset();
        } catch (error: any) {
            const msg = error?.response?.data?.error || "Error al guardar el certificado.";
            toast.error(msg);
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <MesaSelector control={form.control} />
                <Separator />
                <TotalesForm control={form.control} setValue={form.setValue} />
                <Separator />
                <div className="text-sm font-medium italic text-center text-muted-foreground px-4">
                    CERTIFICO:  en mi carácter de presidente de esta mesa, de acuerdo con lo establecido en los arts. 102 y 102 bis del Código Electoral
                    Nacional que el escrutinio arrojó los siguientes resultados
                </div>
                <Separator />
                {!loading && (
                    <ResultadosPresidencialesForm
                        control={form.control}
                        resultadosPresidenciales={form.getValues().resultadosPresidenciales}
                        categorias={categorias}
                    />
                )}
                <Separator />
                <CargoResultados control={form.control} />
                <VotosEspecialesForm
                    control={form.control}
                    categorias={categorias} />
                <Separator />
                <div className="text-sm font-medium italic text-center text-muted-foreground px-4">
                    (*) La suma de los totales por columna debera coincidir con la cantidad de sobres utilizados en la urna
                </div>
                <Separator />
                <div className="text-sm font-medium italic text-center text-muted-foreground px-4">
                    (*)  Información indispensable para el cobre de la compensación - ART 72 - CEN (Por favor completar con letra imprenta CON LETRA IMPRENTA)
                </div>
                <Separator />
                <CompensacionForm control={form.control} />
                <Separator />
                <FiscalesForm
                    control={form.control}
                    agrupaciones={agrupaciones.map(({ id, nombre, numero }) => ({
                        id: id.toString(),
                        nombre,
                        numero,
                    }))}
                />
                <Separator />
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Guardando..." : "Guardar certificado"}
                </Button>
            </form>
        </Form>
    );
}
