import {
    BarChart4,
    PanelsTopLeft,
    Settings,
    CircleHelpIcon,
    Users,
    Upload,
    Landmark,
    Compass,
    UserCog,
    ShieldUser,
    BookUser,
    ReceiptText,
    MapPinned
} from 'lucide-react'

export const dataGeneralSidebar = [
    {
        icon: PanelsTopLeft,
        label: "Dashboard",
        href: "/"
    },
    {
        icon: Users,          // icono para padron electoral
        label: "Padrón Electoral",
        href: "/electoral-rolls"
    },
];

export const dataAdminSidebar = [
        {
        icon: Compass,
        label: "Agrupaciones Políticas",
        href: "/political-groups"
    },
    {
        icon: Landmark,       // icono para establecimientos
        label: "Establecimientos",
        href: "/establishments"
    },
    {
        icon: MapPinned,
        label: "Circuitos",
        href: "/circuites"
    },
    {
        icon: BookUser,
        label: "Categorias",
        href: "/categories"
    }, 
    {
        icon: ShieldUser,       // icono para establecimientos
        label: "Roles",
        href: "/roles"
    },
    {
        icon: UserCog,       // icono para establecimientos
        label: "Usuarios",
        href: "/users"
    },
]

export const dataScrutinyCertificatesSidebar = [ 
    {
        icon: ReceiptText,
        label: "Alta Certificado Escrutinio",
        href: "/scrutiny-certificates"
    }
]

export const dataToolsSidebar = [    
    {
        icon: BarChart4,
        label: "Estadisticas",
        href: "/analytics"
    },
    {
        icon: Upload,
        label: "Import Padrón Electoral",
        href: "/electoral-roll-loader"
    },
];

export const dataSupportSidebar = [
    {
        icon: CircleHelpIcon,
        label: "Preguntas",
        href: "/faqs"
    },
    {
        icon: Settings,
        label: "Configuración",
        href: "/settings"
    },
    // {
    //     icon: ShieldCheck,
    //     label: "Security",
    //     href: "/security"
    // },
];