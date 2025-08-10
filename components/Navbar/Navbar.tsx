import { LogOut, Menu, Search, UserRound } from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { SidebarRoutes } from '@/components/SidebarRoutes';
import { ToggleTheme } from '@/components/ToggleTheme';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useAuthStore } from '@/auth';
import { ContextualSearch } from '../ContextualSearch/ContextualSearch';


interface User {
    nombre: string;
    apellido: string;
    email: string;
    avatarUrl?: string;
    userId?: string;
}

export function Navbar({ user }: { user: User | null }) {
    return (
        <nav className='flex items-center px-2 gap-x-4 md:px-6 
                    justify-between w-full 
                    bg-background border-b h-20 '>
            <div className='block xl:hidden'>
                <Sheet>
                    <SheetTrigger className='flex items-center'>
                        <Menu />
                    </SheetTrigger>
                    <SheetContent side={'left'} className="p-0 overflow-y-auto max-h-screen">
                        <SheetTitle className="sr-only">Menú</SheetTitle>
                        <SheetDescription className="sr-only">Navegación del sistema</SheetDescription>
                        <SidebarRoutes />
                    </SheetContent>
                </Sheet>
            </div>
            
            <ContextualSearch />

            <div className='flex gap-x-2 items-center'>
                <ToggleTheme />
                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar className="cursor-pointer">
                                {user.avatarUrl ? (
                                    <AvatarImage src={user.avatarUrl} alt={user.nombre} />
                                ) : (
                                    <AvatarFallback>{user.nombre}</AvatarFallback>
                                )}
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <div className="px-4 py-2 border-b">
                                <p className="text-sm font-semibold">{user.userId}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <DropdownMenuItem
                                onSelect={() => {
                                    window.location.href = "/settings";
                                }}
                            >
                                <UserRound width={20} height={20} />Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => {
                                    const logout = useAuthStore.getState().logout;
                                    logout();
                                    window.location.href = "/sign-in";
                                }}
                            >
                                <LogOut width={20} height={20} />Cerrar sesión
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </nav>
    )
}
