'use client';

import { SidebarItem } from '../SidebarItem';
import { dataAdminSidebar, dataGeneralSidebar, dataScrutinyCertificatesSidebar, dataSupportSidebar, dataToolsSidebar, dataConfigSidebar, dataAnalyticsSidebar } from './SidebarRoutes.data';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { formatMessage } from '@/lib/utils/formatters';
import { Copyright } from 'lucide-react';

export function SidebarRoutes() {
    return (
        <div className='flex flex-col justify-between h-full'>
            <div>
                <div className='p-2 md:p-6'>
                    <p className='text-slate-500 mb-2'>GENERAL</p>
                    {dataGeneralSidebar.map((item) => (
                        <SidebarItem key={item.label} item={item} />
                    ))}
                </div>

                <Separator />
                <div className='p-2 md:p-6'>
                    <p className='text-slate-500 mb-2'>CERTIFICADO DE ESCRUTINIO</p>
                    {dataScrutinyCertificatesSidebar.map((item) => (
                        <SidebarItem key={item.label} item={item} />
                    ))}
                </div>

                <Separator />
                <div className='p-2 md:p-6'>
                    <p className='text-slate-500 mb-2'>ADMINISTRACIÓN</p>
                    {dataAdminSidebar.map((item) => (
                        <SidebarItem key={item.label} item={item} />
                    ))}
                </div>

                <Separator />
                <div className='p-2 md:p-6'>
                    <p className='text-slate-500 mb-2'>HERRAMIENTAS</p>
                    {dataToolsSidebar.map((item) => (
                        <SidebarItem key={item.label} item={item} />
                    ))}
                </div>

                <Separator />
                <div className='p-2 md:p-6'>
                    <p className='text-slate-500 mb-2'>SOPORTE</p>
                    {dataSupportSidebar.map((item) => (
                        <SidebarItem key={item.label} item={item} />
                    ))}
                </div>

                <Separator />
                <div className='p-2 md:p-6'>
                    <p className='text-slate-500 mb-2'>REPORTES</p>
                    {dataAnalyticsSidebar.map((item) => (
                        <SidebarItem key={item.label} item={item} />
                    ))}
                </div>


                <Separator />
                <div className='p-2 md:p-6'>
                    <p className='text-slate-500 mb-2'>CONFIGURACION</p>
                    {dataConfigSidebar.map((item) => (
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
    )
}
