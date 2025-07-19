"use client";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { pacifico, firmaFont } from "../lib/fonts";

export default function LayoutDashboard({ children }: { children: React.ReactElement }) {
    const { loading, user } = useAuthRedirect();
    if (loading) {
        return (
            <div className="flex items-center justify-center h-full w-full">
                <p>Verificando acceso...</p>
            </div>
        );
    }

    if (!user) {
        // Opcional: aquí podrías redirigir a login o mostrar mensaje
        return null;
    }

    return (
        <div className={`flex w-full h-full ${pacifico.variable} ${firmaFont.variable}`}>
            <div className="hidden xl:block w-80 h-full xl:fixed">
                <Sidebar />
            </div>
            <div className="w-full xl:ml-80">
                <Navbar user={user} />
                <div className="p-6 bg-[#fafbfc] dark:bg-secondary">
                    {children}
                </div>
            </div>
        </div>
    )
}
