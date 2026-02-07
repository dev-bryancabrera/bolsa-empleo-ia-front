import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Badge, Button } from "@/core/components"
import { NavLink, Outlet, useNavigate, useLocation } from "react-router"
import { menuItems } from "../types"
import { LogOut, Menu, User, X } from "lucide-react"
import { useAuthStore } from "@/modules/auth/services/AuthService";
import { UserService } from "@/modules/users/services/UserService"
import type { UsuarioData } from "@/modules/users/types/UserTypes"
import { toast } from "react-toastify"

interface DashboardLayoutProps {
    title?: string
}

export default function DashboardLayout({ title = "Dashboard" }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const user = useAuthStore(state => state.user);
    const userInitial = user?.nombre ? user.nombre[0].toUpperCase() : 'U';
    const [usuario, setUsuario] = useState<UsuarioData | null>(null);
    const logout = useAuthStore(state => state.logout);
    const navigate = useNavigate();
    const authUser = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(true);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // 🔥 Detectar si es una ruta que debe ocupar todo el ancho
    const isFullWidthRoute = location.pathname === '/dashboard/chat';

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

            // Convertir buffer a base64 si existe
            let fotoPerfilBase64 = null;
            if (data.foto_perfil?.data) {
                fotoPerfilBase64 = bufferToBase64(data.foto_perfil.data);
                data.foto_perfil = fotoPerfilBase64;
            }

            setUsuario(data);

            // Establecer la imagen de preview
            if (fotoPerfilBase64) {
                setImagePreview(fotoPerfilBase64);
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
            const base64 = btoa(binString);
            return `data:image/png;base64,${base64}`;
        } catch (error) {
            console.error('Error convirtiendo buffer a base64:', error);
            return null;
        }
    };

    const filteredMenuItems = menuItems.filter((item) => {
        if (!item.roles) return true;
        return item.roles.includes(authUser?.rol);
    });

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >

                <div className="flex items-center justify-between h-20 px-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">LearnAI</h1>
                            <p className="text-xs text-muted-foreground">Tu mentor inteligente</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/*  <div className="px-4 py-5 border-b bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-lg">
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Foto de perfil"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-400">
                                        <User className="w-16 h-16 text-white" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user?.nombre}</p>
                            <p className="text-xs text-muted-foreground">Estudiante activo</p>
                        </div>
                    </div>
                </div> */}

                <nav className="mt-6 px-4 flex-1 overflow-y-auto">
                    <div className="space-y-1">
                        <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                            Principal
                        </p>
                        {filteredMenuItems.map((item) => (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                end={item.href === "/dashboard"}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                                )}
                            >
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>

                    <div className="mt-8 mx-3 p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-primary/20">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900">Tu progreso</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Nivel actual</span>
                                <span className="font-semibold text-primary">Intermedio</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: '65%' }}></div>
                            </div>
                            <p className="text-xs text-muted-foreground">65% completado</p>
                        </div>
                    </div>

                    <div className="mt-8 px-3 pb-6">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start gap-3 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-200"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Cerrar sesión</span>
                        </Button>
                    </div>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
                {/* Header - Solo mostrar si NO es ruta de ancho completo */}
                {!isFullWidthRoute && (
                    <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-30">
                        <div className="flex items-center justify-between h-16 px-6">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden"
                                    onClick={() => setSidebarOpen(true)}
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                                    <p className="text-xs text-muted-foreground hidden sm:block">
                                        Potenciado por Inteligencia Artificial
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Badge
                                    variant="outline"
                                    className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary border-primary/30"
                                >
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                    </span>
                                    <span className="text-xs font-medium">IA Activa</span>
                                </Badge>

                                <Button variant="ghost" size="icon" className="relative">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                                </Button>

                                <div className="flex lg:hidden items-center">
                                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-md">
                                        <span className="text-white text-sm font-semibold">{userInitial}</span>
                                    </div>
                                </div>

                                <div className="hidden lg:flex items-center gap-3 pl-3 border-l">
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{usuario?.persona?.nombre}</p>
                                    </div>
                                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-md">
                                        {imagePreview ? (
                                            <img
                                                src={imagePreview}
                                                alt="Foto de perfil"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-400">
                                                <User className="w-16 h-16 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>
                )}

                {/* Main Content Area */}
                <main className={cn(
                    "flex-1",
                    isFullWidthRoute ? "overflow-hidden" : "overflow-y-auto"
                )}>
                    {isFullWidthRoute ? (
                        // 🔥 Para rutas de ancho completo: sin padding, sin max-width
                        <Outlet />
                    ) : (
                        // Para rutas normales: con padding y max-width
                        <div className="p-6 max-w-7xl mx-auto">
                            <Outlet />
                        </div>
                    )}
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}