import { useState } from "react"
import { cn } from "@/lib/utils"
import { Badge, Button } from "@/core/components"
import { NavLink, Outlet, useNavigate } from "react-router"
import { menuItems } from "../types"
import { LogOut, Menu, X } from "lucide-react"
import { useAuthStore } from "@/modules/auth/store/AuthStore"

interface DashboardLayoutProps {
    title?: string
}

export default function DashboardLayout({ title = "Dashboard" }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = useAuthStore(state => state.user);
    const userInitial = user?.nombre ? user.nombre[0].toUpperCase() : 'U';
    const logout = useAuthStore(state => state.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth', { replace: true });
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <div
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                <div className="flex items-center justify-between h-16 px-6 border-b">
                    <h1 className="text-xl font-bold text-gray-900">Sistema Inventario</h1>
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                <nav className="mt-6 px-3">
                    <ul className="space-y-1">
                        {menuItems.map((item) => (
                            <li key={item.href}>
                                <NavLink
                                    to={item.href}
                                    end={item.href === "/dashboard"}
                                    className={({ isActive }) => cn(
                                        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                        isActive
                                            ? "bg-green-50 text-green-700 border-r-2 border-green-700"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                                    )}
                                >
                                    <item.icon className="mr-3 h-5 w-5" />
                                    {item.label}
                                </NavLink>
                            </li>
                        ))}

                        {/* Separador visual */}
                        <li className="mt-6 pt-4 border-t border-gray-200">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
                                onClick={handleLogout}
                            >
                                <LogOut className="mr-3 h-5 w-5" />
                                <span>Logout</span>
                            </Button>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
                {/* Header */}
                <header className="bg-white shadow-sm border-b">
                    <div className="flex items-center justify-between h-16 px-6">
                        <div className="flex items-center">
                            <Button variant="ghost" size="icon" className="lg:hidden mr-2" onClick={() => setSidebarOpen(true)}>
                                <Menu className="h-6 w-6" />
                            </Button>
                            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                        </div>

                        <div className="flex items-center space-x-4">
                            <Badge variant="outline" className="text-green-600 border-green-600">
                                Sistema Activo
                            </Badge>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">{userInitial}</span>
                                </div>
                                <span className="text-sm font-medium text-gray-700">{user?.nombre}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}
        </div>
    )
}
