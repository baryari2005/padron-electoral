'use client';

import { useActiveElection } from "@/hooks/useActiveElection";
import { SidebarItem } from "../SidebarItem";
import {
    dataGeneralSidebar,
    dataSupportSidebar,
    getToolsSidebar,
    getdataAnalyticsSidebar,
    getAdminSidebar,
    getScrutinyCertificatesSidebar,
    getDataConfigSidebar,
} from "./SidebarRoutes.data";
import { Separator } from "@/components/ui/separator";
import { formatMessage } from "@/lib/utils/formatters";
import { Copyright } from "lucide-react";

export function SidebarRoutes() {
    const { electionType, electionState,  loading } = useActiveElection();

    const adminItems = getAdminSidebar(electionType, electionState) ?? [];
    const scrutinyItems = getScrutinyCertificatesSidebar(electionType, electionState) ?? [];
    const toolsItems = getToolsSidebar(electionType, electionState) ?? [];
    const analyticsItems = getdataAnalyticsSidebar(electionType, electionState) ?? [];
    const usersItems = getDataConfigSidebar(electionType, electionState) ?? [];

    return (
        <div className='flex flex-col justify-between h-full'>
            <div>
                <div className='p-2 md:p-6'>
                    <p className='text-slate-500 mb-2'>GENERAL</p>
                    {dataGeneralSidebar.map((item) => (
                        <SidebarItem key={item.label} item={item} />
                    ))}
                </div>

                {/* CERTIFICADO */}
                {scrutinyItems.length > 0 && (
                    <>
                <Separator />
                        <div className="p-2 md:p-6">
                            <p className="text-slate-500 mb-2">CERTIFICADO DE ESCRUTINIO</p>
                            {scrutinyItems.map((item) => (
                        <SidebarItem key={item.label} item={item} />
                    ))}
                </div>
                    </>
                )}

                {/* ADMIN */}
                {adminItems.length > 0 && (
                    <>
                <Separator />
                        <div className="p-2 md:p-6">
                            <p className="text-slate-500 mb-2">ADMINISTRACIÓN</p>
                    {adminItems.map((item) => (
                        <SidebarItem key={item.label} item={item} />
                    ))}
                </div>
                    </>
                )}

                {/* TOOLS */}
                {toolsItems.length > 0 && (
                    <>
                <Separator />
                        <div className="p-2 md:p-6">
                            <p className="text-slate-500 mb-2">HERRAMIENTAS</p>
                            {toolsItems.map((item) => (
                        <SidebarItem key={item.label} item={item} />
                    ))}
                </div>
                    </>
                )}

                <Separator />
                <div className="p-2 md:p-6">
                    <p className="text-slate-500 mb-2">SOPORTE</p>
                    {dataSupportSidebar.map((item) => (
                        <SidebarItem key={item.label} item={item} />
                    ))}
                </div>

                <Separator />
                <div className="p-2 md:p-6">
                    <p className="text-slate-500 mb-2">REPORTES</p>
                    {analyticsItems.map((item) => (
                        <SidebarItem key={item.label} item={item} />
                    ))}
                </div>


                <Separator />
                <div className="p-2 md:p-6">
                    <p className="text-slate-500 mb-2">CONFIGURACION</p>
                    {usersItems.map((item) => (
                        <SidebarItem key={item.label} item={item} />
                    ))}
                </div>
            </div>

            <div>
                <Separator />
                <div className="flex flex-col items-center text-center py-6 px-4 bg-muted/50 rounded-md shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Copyright width={16} height={16} />
                        <span>{formatMessage("2025. Todos los derechos reservados")}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
