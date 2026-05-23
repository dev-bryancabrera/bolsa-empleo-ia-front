import {
    LayoutDashboard,
    UserCircle,
    FileText,
    ShieldCheck,
    Brain,
    Settings2,
    Globe,
    BarChart2,
} from "lucide-react";

export interface MenuItem {
    icon: React.ElementType;
    label: string;
    href: string;
    active?: boolean;
    roles?: string[];
    slug?: string; // used for per-user module permission filtering
}

export const MODULOS_DISPONIBLES = [
    { slug: 'chat', label: 'Mentor IA' },
    { slug: 'perfil', label: 'Mi Perfil' },
    { slug: 'cv', label: 'Mi Currículum' },
    { slug: 'portfolio', label: 'Mi Portafolio' },
    { slug: 'configuracion-ia', label: 'Config. IA' },
] as const;

export const menuItems: MenuItem[] = [
    {
        icon: LayoutDashboard,
        label: "Inicio",
        href: "/dashboard",
        active: true,
    },
    {
        icon: Brain,
        label: "Mentor IA",
        href: "chat",
        slug: "chat",
    },
    {
        icon: UserCircle,
        label: "Mi Perfil",
        href: "perfil",
        slug: "perfil",
    },
    {
        icon: FileText,
        label: "Mi Currículum",
        href: "cv",
        slug: "cv",
    },
    {
        icon: Globe,
        label: "Mi Portafolio",
        href: "portfolio",
        slug: "portfolio",
    },
    {
        icon: Settings2,
        label: "Configuración IA",
        href: "configuracion-ia",
        slug: "configuracion-ia",
    },
    {
        icon: ShieldCheck,
        label: "Usuarios Sistema",
        href: "/dashboard/usuarios",
        roles: ["admin"],
    },
    {
        icon: BarChart2,
        label: "Análisis IA de CVs",
        href: "/dashboard/analisis-cvs",
        roles: ["admin"],
    },
];
