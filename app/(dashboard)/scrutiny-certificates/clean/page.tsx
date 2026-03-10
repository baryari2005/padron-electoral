// app/(dashboard)/tools/clean/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShieldAlert, SquareAsterisk } from "lucide-react";
import CleanResultsForm from "../../scrutiny-certificates/clean/components/CleanForm";
import { Label } from "@/components/ui/label";

// (Opcional) SEO
export const metadata: Metadata = {
    title: "Limpieza de resultados | Herramientas",
};

export default function CleanPage() {    
    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            {/* <nav className="text-sm text-muted-foreground" aria-label="breadcrumb">
        <ol className="flex items-center gap-1">
          <li>
            <Link href="/" className="hover:text-foreground">Inicio</Link>
          </li>
          <li aria-hidden className="px-1">/</li>
          <li>
            <Link href="/tools" className="hover:text-foreground">Herramientas</Link>
          </li>
          <li aria-hidden className="px-1">/</li>
          <li className="text-foreground font-medium">Limpieza de resultados</li>
        </ol>
      </nav> */}

            {/* Título de la página */}
            <div className="space-y-4">
                <div className="mb-6">
                    <h2 className="text-2xl">Importar Padrón Electoral</h2>
                    <p className="text-sm text-muted-foreground">
                        Vacía tablas de escrutinio y muestra métricas del proceso.
                    </p>
                </div>
            </div>

            {/* Danger Zone wrapper (envoltorio visual rojo) */}
            <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader className="pb-2">
                    {/* <CardTitle className="text-sm text-destructive flex items-center gap-2 animate-pulse">
                        <ShieldAlert className="w-4 h-4" />
                        Zona peligrosa
                    </CardTitle> */}
                </CardHeader>
                <CardContent>
                    {/* Tu formulario ya tiene su confirmación y KPIs */}
                    <CleanResultsForm />
                    <Separator className="my-4" />
                    <div className="flex items-center">

                        <SquareAsterisk className="w-4 h-4 mr-2" />
                        <Label className="text-xs-plus text-muted-foreground">

                            Esta acción no se puede deshacer. Asegurate de tener respaldo antes de limpiar.
                        </Label>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
