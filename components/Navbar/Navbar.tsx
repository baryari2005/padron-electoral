//import { UserButton } from '@clerk/nextjs';
import { Menu, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { SidebarRoutes } from '@/components/SidebarRoutes';
import { ToggleTheme } from '@/components/ToggleTheme';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';


interface User {
    name: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
}

export function Navbar({ user }: { user: User | null }) {
    return (
        <nav className='flex items-center px-2 gap-x-4 md:px-6 
                    justify-between w-full 
                    bg-background border-b h-20'>
            <div className='block xl:hidden'>
                <Sheet>
                    <SheetTrigger className='flex items-center'>
                        <Menu />
                    </SheetTrigger>
                    <SheetContent side={'left'}>                         
                        <SheetTitle className="sr-only">Menú</SheetTitle>
                        <SheetDescription className="sr-only">Navegación del sistema</SheetDescription>                        
                        <SidebarRoutes />
                    </SheetContent>
                </Sheet>
            </div>
            <div className='relative w-[300px]'>
                <Input placeholder='Search...' className='rounded-lg' />
                <Search strokeWidth={1} className='absolute top-2 right-2' />
            </div>
            <div className='flex gap-x-2 items-center'>
                <ToggleTheme />
                {user && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Avatar className="cursor-pointer">
                                {user.avatarUrl ? (
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                ) : (
                                    <AvatarFallback>{user.name}</AvatarFallback>
                                )}
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <div className="px-4 py-2 border-b">
                                <p className="font-semibold">{user.name} {user.lastName}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <DropdownMenuItem
                                onSelect={() => {
                                    localStorage.removeItem("token");
                                    window.location.href = "/sign-in";
                                }}
                            >
                                Cerrar sesión
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </nav>
    )
}
