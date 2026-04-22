import {
    LayoutDashboard,
    UserCircle,
    FileText,
    ShieldCheck,
    Brain,
    Settings2,
} from "lucide-react";

export interface MenuItem {
    icon: React.ElementType;
    label: string;
    href: string;
    active?: boolean;
    roles?: string[];
}

export const menuItems: MenuItem[] = [
    {
        icon: LayoutDashboard,
        label: "Inicio",
        href: "/dashboard",
        active: true
    },
    {
        icon: Brain,
        label: "Mentor IA",
        href: "chat"
    },
    {
        icon: UserCircle,
        label: "Mi Perfil",
        href: "perfil"
    },
    {
        icon: FileText,
        label: "Mi Currículum",
        href: "cv"
    },
    {
        icon: Settings2,
        label: "Configuración IA",
        href: "configuracion-ia"
    },
    {
        icon: ShieldCheck,
        label: "Usuarios Sistema",
        href: "/dashboard/usuarios",
        roles: ["admin"],
    },
];
