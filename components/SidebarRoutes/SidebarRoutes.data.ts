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
    MapPinned,
    School,
    ShieldPlus,
    BarChart3,
    BarChart2,
    BarChart,
    BookmarkCheck,
    CircleFadingArrowUp,
    Users2,
    Import,
    BrushCleaning
} from 'lucide-react'

export const dataGeneralSidebar = [
    {
        icon: PanelsTopLeft,
        label: "Dashboard",
        href: "/"
    },
];

export const dataAdminSidebar = [
    {
        icon: Compass,
        label: "Agrupaciones Políticas",
        href: "/political-groups"
    },
    {
        icon: BookUser,
        label: "Cargos Políticos",
        href: "/categories"
    },
    {
        icon: MapPinned,
        label: "Circuitos",
        href: "/circuites"
    },
    {
        icon: School,       // icono para establecimientos
        label: "Establecimientos",
        href: "/establishments"
    },
    {
        icon: Users,          // icono para padron electoral
        label: "Padrón Electoral",
        href: "/electoral-rolls"
    },
]

export const dataScrutinyCertificatesSidebar = [
    {
        icon: ReceiptText,
        label: "Alta Certificado Escrutinio",
        href: "/scrutiny-certificates"
    },
    {
        icon: ReceiptText,
        label: "Listado de Certificados",
        href: "/scrutiny-certificates/summary"
    },
]

export const dataToolsSidebar = [
    // {
    //     icon: BarChart4,
    //     label: "Estadisticas",
    //     href: "/analytics"
    // },
    {
        icon: Upload,
        label: "Import Padrón Electoral",
        href: "/electoral-roll-loader"
    },
    {
        icon: CircleFadingArrowUp,
        label: "Correr Estadísticas",
        href: "/stats"
    },
    {
        icon: Import,
        label: "Generar excel con no votantes",
        href: "/electoral-rolls/export-not-voted"
    },
    {
        icon: BookmarkCheck,
        label: "Modificar estado de votación",
        href: "/electoral-rolls/quick-marking"
    },
    {
        icon: BrushCleaning,
        label: "Reiniciar certificados de escrutinio.",
        href: "/scrutiny-certificates/clean"
    },
];

export const dataAnalyticsSidebar = [
    {
        icon: BarChart4,
        label: "Votos por Mesa",
        href: "/reports/mesa-summary"
    },
    {
        icon: BarChart3,
        label: "Votos por Establecimiento",
        href: "/reports/establishment-summary"
    },
    {
        icon: BarChart2,
        label: "Votos por Circuito",
        href: "/reports/circuite-summary"
    },
    {
        icon: BarChart,
        label: "Votos Total",
        href: "/reports/total-summary"
    }
]

export const dataSupportSidebar = [
    {
        icon: CircleHelpIcon,
        label: "Preguntas",
        href: "/faqs"
    },
];

export const dataConfigSidebar = [
    {
        icon: UserCog,
        label: "Usuarios",
        href: "/users"
    },
    {
        icon: ShieldUser,
        label: "Roles",
        href: "/roles"
    },
    {
        icon: ShieldPlus,
        label: "Permisos Por Rol",
        href: "/permissions"
    },
    {
        icon: ShieldPlus,
        label: "Permisos",
        href: "/permissions/keys"
    },
    {
        icon: Users2,
        label: "Generar usuarios Autoridad de mesa",
        href: "/users/bulk-authorities"
    },
    // {
    //     icon: Settings,
    //     label: "Configuración",
    //     href: "/settings"
    // },
    // {
    //     icon: ShieldCheck,
    //     label: "Security",
    //     href: "/security"
    // },
];