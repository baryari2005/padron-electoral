import {
    BarChart4,
    PanelsTopLeft,
    CircleHelpIcon,
    Users,
    Upload,
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
    BrushCleaning,
    Vote,
    User,
    FileSpreadsheet
} from 'lucide-react'

export const dataGeneralSidebar = [
    {
        icon: PanelsTopLeft,
        label: "Dashboard",
        href: "/"
    },
];

export const getAdminSidebar = (electionType?: string, electionState?: string) => {
    const items = [
        {
            icon: Compass,
            label: electionType == "INTERNA" ? "Listas Políticas" : "Agrupaciones Políticas",
            href: "/political-groups",
            visible: electionState === "ACTIVE"
        },
        {
            icon: User,
            label: "Actores Políticos",
            href: "/operational_person",
            visible: electionType === "INTERNA" && electionState === "ACTIVE", // 👈 SOLO internas
        },
        {
            icon: FileSpreadsheet,
            label: "Planillas",
            href: "/spreadsheet",
            visible: electionType === "INTERNA" && electionState === "ACTIVE", // 👈 SOLO internas
        },
        {
            icon: BookUser,
            label: "Cargos Políticos",
            href: "/categories",
            visible: electionState === "ACTIVE",
        },
        {
            icon: MapPinned,
            label: "Circuitos",
            href: "/circuites",
            visible: electionState === "ACTIVE",
        },
        {
            icon: School,
            label: "Establecimientos",
            href: "/establishments",
            visible: electionState === "ACTIVE",
        },
        {
            icon: Users,
            label: "Padrón Electoral",
            href: "/electoral-rolls",
            visible: electionState === "ACTIVE",
        },
        {
            icon: Vote,
            label: "Elecciones",
            href: "/elections",
            visible: true,
        },
    ];

    return items.filter((item) => item.visible !== false);
};

export const getScrutinyCertificatesSidebar = (electionType?: string, electionState?: string) => {
    const items = [
        {
            icon: ReceiptText,
            label: "Alta Certificado Escrutinio",
            href: "/scrutiny-certificates",
            visible: electionState === "ACTIVE",
        },
        {
            icon: ReceiptText,
            label: "Listado de Certificados",
            href: "/scrutiny-certificates/summary",
            visible: electionState === "ACTIVE",
        },
    ];
    return items.filter((item) => item.visible !== false);
}


export const getToolsSidebar = (electionType?: string, electionState?: string) => {
    const items = [
        {
            icon: Upload,
            label: "Import Padrón Electoral",
            href: "/electoral-roll-loader",
            visible: electionState === "ACTIVE",
        },
        {
            icon: CircleFadingArrowUp,
            label: "Correr Estadísticas",
            href: "/stats",
            visible: electionState === "ACTIVE",
        },
        {
            icon: Import,
            label: "Generar excel con no votantes",
            href: "/electoral-rolls/export-not-voted",
            visible: electionState === "ACTIVE",
        },
        {
            icon: BookmarkCheck,
            label: "Modificar estado de votación",
            href: electionType === "INTERNA" ? "/internal-voting" : "/electoral-rolls/quick-marking",
            visible: electionState === "ACTIVE",
        },
        {
            icon: BookmarkCheck,
            label: "Modificar estado de votación grafica",
            href: "/internal-voting-graphic",
            visible: electionState === "ACTIVE" && electionType === "INTERNA",
        },
        {
            icon: BrushCleaning,
            label: "Reiniciar certificados de escrutinio.",
            href: "/scrutiny-certificates/clean",
            visible: electionState === "ACTIVE",
        },
    ];
    return items.filter((item) => item.visible !== false);
}

export const getdataAnalyticsSidebar = (electionType?: string, electionState?: string) => {
    const items = [
        {
            icon: BarChart4,
            label: "Votos por Mesa",
            href: "/reports/mesa-summary",
            visible: true
        },
        {
            icon: BarChart3,
            label: "Votos por Establecimiento",
            href: "/reports/establishment-summary",
            visible: true
        },
        {
            icon: BarChart2,
            label: "Votos por Circuito",
            href: "/reports/circuite-summary",
            visible: true
        },
        {
            icon: BarChart,
            label: "Votos Total",
            href: "/reports/total-summary",
            visible: true
        }
    ]
    return items.filter((item) => item.visible !== false);
}

export const dataSupportSidebar = [
    {
        icon: CircleHelpIcon,
        label: "Preguntas",
        href: "/faqs"
    },
];

export const getDataConfigSidebar = (electionType?: string, electionState?: string) => {
    const items = [
        {
            icon: UserCog,
            label: "Usuarios",
            href: "/users",
            visible: true
        },
        {
            icon: ShieldUser,
            label: "Roles",
            href: "/roles",
            visible: true
        },
        {
            icon: ShieldPlus,
            label: "Permisos Por Rol",
            href: "/permissions",
            visible: true
        },
        {
            icon: ShieldPlus,
            label: "Permisos",
            href: "/permissions/keys",
            visible: true
        },
        {
            icon: Users2,
            label: "Generar usuarios Autoridad de mesa",
            href: "/users/bulk-authorities",
            visible: true
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
    return items.filter((item) => item.visible !== false);
}