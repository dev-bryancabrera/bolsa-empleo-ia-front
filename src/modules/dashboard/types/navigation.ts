import {
    LayoutDashboard,
    UserCircle,
    FileText,
    ShieldCheck,
    MessageSquare,
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
        icon: MessageSquare,
        label: "Chat IA",
        href: "/dashboard/chat"
    },
    {
        icon: UserCircle,
        label: "Mi Perfil",
        href: "/dashboard/perfil"
    },
    {
        icon: FileText,
        label: "Mi Currículum",
        href: "/dashboard/cv"
    },
    /* {
        icon: Wrench,
        label: "Habilidades",
        href: "/dashboard/habilidades"
    }, */
    // Estas rutas suelen ser para el rol 'admin'
    /* {
        icon: UserCog,
        label: "Gestión Personas",
        href: "/dashboard/personas"
    }, */
    {
        icon: ShieldCheck,
        label: "Usuarios Sistema",
        href: "/dashboard/usuarios",
        roles: ["admin"],
    },
];