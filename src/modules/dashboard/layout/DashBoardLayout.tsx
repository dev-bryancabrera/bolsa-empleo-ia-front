import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Badge, Button } from "@/core/components"
import { NavLink, Outlet, useNavigate, useLocation } from "react-router"
import { menuItems } from "../types"
import {
    LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen,
    Sparkles, Sun, User, X
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/core/components/ui/dropdown-menu"
import { useAuthStore } from "@/modules/auth/services/AuthService";
import { UserService } from "@/modules/users/services/UserService"
import type { UsuarioData } from "@/modules/users/types/UserTypes"
import { toast } from "react-toastify"

interface DashboardLayoutProps {
    title?: string
}

export default function DashboardLayout({ title = "Dashboard" }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);          // mobile overlay
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
        localStorage.getItem('sidebar-collapsed') === 'true'
    );
    const [darkMode, setDarkMode] = useState(() =>
        localStorage.getItem('theme') === 'dark'
    );

    const location = useLocation();
    const user = useAuthStore(state => state.user);
    const userInitial = user?.nombre ? user.nombre[0].toUpperCase() : 'U';
    const [usuario, setUsuario] = useState<UsuarioData | null>(null);
    const logout = useAuthStore(state => state.logout);
    const navigate = useNavigate();
    const authUser = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(true);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const isFullWidthRoute = ['/dashboard/chat', '/dashboard/portfolio'].includes(location.pathname);

    // ── Dark mode effect ───────────────────────────────────────────
    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    // ── Persist sidebar collapse ───────────────────────────────────
    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', String(sidebarCollapsed));
    }, [sidebarCollapsed]);

    const handleLogout = () => {
        logout();
        navigate('/auth', { replace: true });
    };

    useEffect(() => {
        obtenerPerfil();
    }, []);

    const obtenerPerfil = async () => {
        try {
            setLoading(true);
            const data = await UserService.obtenerPerfil(authUser.id);
            let fotoPerfilBase64 = null;
            if (data.foto_perfil?.data) {
                fotoPerfilBase64 = bufferToBase64(data.foto_perfil.data);
                data.foto_perfil = fotoPerfilBase64;
            }
            setUsuario(data);
            if (fotoPerfilBase64) {
                setImagePreview(fotoPerfilBase64);
            } else if (data.google_foto_url) {
                setImagePreview(data.google_foto_url);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al cargar el perfil');
        } finally {
            setLoading(false);
        }
    };

    const bufferToBase64 = (buffer: number[]) => {
        try {
            const bytes = new Uint8Array(buffer);
            const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
            return `data:image/png;base64,${btoa(binString)}`;
        } catch {
            return null;
        }
    };

    const filteredMenuItems = menuItems.filter((item) => {
        if (!item.roles) return true;
        return item.roles.includes(authUser?.rol);
    });

    return (
        <div className="flex h-screen bg-background">

            {/* ── Sidebar ──────────────────────────────────────────────── */}
            <aside className={cn(
                // Base
                "fixed inset-y-0 left-0 z-50 bg-sidebar flex flex-col shadow-2xl shadow-black/20",
                "transform transition-all duration-300 ease-in-out",
                // Mobile: slide in/out
                sidebarOpen ? "translate-x-0" : "-translate-x-full",
                // Desktop: always visible, static in flow
                "lg:translate-x-0 lg:static lg:inset-0",
                // Width: mobile always full, desktop depends on collapsed
                "w-72",
                sidebarCollapsed ? "lg:w-16" : "lg:w-72",
            )}>

                {/* Logo */}
                <div className={cn(
                    "flex items-center h-20 border-b border-sidebar-border shrink-0 transition-all duration-300",
                    sidebarCollapsed ? "lg:justify-center lg:px-3 px-6" : "px-6 justify-between"
                )}>
                    <div className={cn("flex items-center min-w-0", !sidebarCollapsed && "gap-3")}>
                        <div className="w-10 h-10 gradient-brand rounded-xl flex items-center justify-center shadow-lg shadow-black/20 flex-shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div className={cn("transition-all duration-200 overflow-hidden", sidebarCollapsed ? "lg:w-0 lg:opacity-0" : "opacity-100")}>
                            <h1 className="text-base font-bold text-sidebar-foreground tracking-tight whitespace-nowrap">LearnAI</h1>
                            <p className="text-[11px] text-sidebar-foreground/40 font-medium whitespace-nowrap">Tu mentor inteligente</p>
                        </div>
                    </div>
                    {/* Mobile close */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Nav */}
                <nav className={cn("flex-1 overflow-y-auto py-5 transition-all duration-300", sidebarCollapsed ? "lg:px-2" : "px-3")}>
                    {!sidebarCollapsed && (
                        <p className="px-3 text-[10px] font-semibold text-sidebar-foreground/30 uppercase tracking-widest mb-3">
                            Principal
                        </p>
                    )}
                    <div className="space-y-0.5">
                        {filteredMenuItems.map((item) => (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                end={item.href === "/dashboard"}
                                title={sidebarCollapsed ? item.label : undefined}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) => cn(
                                    "flex items-center py-2.5 text-sm font-medium rounded-lg transition-all duration-150",
                                    sidebarCollapsed ? "lg:justify-center lg:px-0 px-3 gap-3" : "gap-3 px-3",
                                    isActive
                                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-black/20"
                                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                                )}
                            >
                                <item.icon className="h-4 w-4 flex-shrink-0" />
                                <span className={cn("transition-all duration-200 overflow-hidden whitespace-nowrap", sidebarCollapsed ? "lg:w-0 lg:opacity-0 lg:hidden" : "opacity-100")}>
                                    {item.label}
                                </span>
                            </NavLink>
                        ))}
                    </div>
                </nav>

                {/* User + Logout */}
                <div className={cn("shrink-0 border-t border-sidebar-border py-4 transition-all duration-300", sidebarCollapsed ? "lg:px-2 px-3" : "px-3")}>
                    <div className={cn("flex items-center mb-3", sidebarCollapsed ? "lg:justify-center px-0" : "gap-3 px-3")}>
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2 ring-sidebar-border">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Foto de perfil" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full gradient-brand flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </div>
                        <div className={cn("flex-1 min-w-0 transition-all duration-200 overflow-hidden", sidebarCollapsed ? "lg:w-0 lg:opacity-0 lg:hidden" : "opacity-100")}>
                            <p className="text-xs font-semibold text-sidebar-foreground truncate">
                                {usuario?.persona?.nombre ?? user?.google_nombre ?? "Usuario"}
                            </p>
                            <p className="text-[10px] text-sidebar-foreground/40 truncate">
                                {usuario?.persona?.email ?? ""}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        title={sidebarCollapsed ? "Cerrar sesión" : undefined}
                        className={cn(
                            "w-full flex items-center py-2 text-xs font-medium text-sidebar-foreground/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-150",
                            sidebarCollapsed ? "lg:justify-center lg:px-0 px-3 gap-3" : "gap-3 px-3",
                        )}
                    >
                        <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className={cn("whitespace-nowrap transition-all duration-200 overflow-hidden", sidebarCollapsed ? "lg:w-0 lg:opacity-0 lg:hidden" : "opacity-100")}>
                            Cerrar sesión
                        </span>
                    </button>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">

                <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
                    <div className="flex items-center justify-between h-16 px-4 gap-3">

                        {/* Left */}
                        <div className="flex items-center gap-2">
                            {/* Mobile hamburger */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>

                            {/* Desktop sidebar collapse toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="hidden lg:flex text-muted-foreground hover:text-foreground"
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                title={sidebarCollapsed ? "Expandir sidebar" : "Contraer sidebar"}
                            >
                                {sidebarCollapsed
                                    ? <PanelLeftOpen className="h-5 w-5" />
                                    : <PanelLeftClose className="h-5 w-5" />
                                }
                            </Button>

                            <div>
                                <h2 className="text-lg font-bold text-gradient leading-tight">{title}</h2>
                                <div className="hidden sm:flex items-center gap-1.5 mt-0.5">
                                    <Sparkles className="w-3 h-3 text-accent" />
                                    <p className="text-[11px] font-medium text-muted-foreground">
                                        Potenciado por Inteligencia Artificial
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right */}
                        <div className="flex items-center gap-2">
                            {/* IA Activa pill */}
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
                                </span>
                                IA Activa
                            </div>

                            {/* Dark mode toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDarkMode(!darkMode)}
                                title={darkMode ? "Modo claro" : "Modo oscuro"}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                {darkMode
                                    ? <Sun className="h-4 w-4" />
                                    : <Moon className="h-4 w-4" />
                                }
                            </Button>

                            {/* Avatar mobile */}
                            <div className="flex lg:hidden">
                                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary/20">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Perfil" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full gradient-brand flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">{userInitial}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Avatar desktop */}
                            <div className="hidden lg:flex items-center gap-3 pl-3 border-l border-border">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-foreground leading-none">
                                        {usuario?.persona?.nombre}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        {authUser?.rol}
                                    </p>
                                </div>
                                <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary/20 shadow-sm">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Foto de perfil" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full gradient-brand flex items-center justify-center">
                                            <span className="text-white text-sm font-bold">{userInitial}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className={cn("flex-1", isFullWidthRoute ? "overflow-hidden" : "overflow-y-auto")}>
                    {isFullWidthRoute ? (
                        <Outlet />
                    ) : (
                        <div className="p-6">
                            <Outlet />
                        </div>
                    )}
                </main>
            </div>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}
