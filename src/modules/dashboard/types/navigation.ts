import {
    Building2,
    Home,
    MapPin,
    Package,
    ShoppingCart,
    TrendingUp,
    Truck,
    Package2,
    Group,
    LineChart,
    Boxes
} from "lucide-react"

export interface MenuItem {
    icon: React.ElementType;
    label: string;
    href: string;
    active?: boolean;
}
export const menuItems: MenuItem[] = [
    // { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
    { icon: Building2, label: "Proveedores", href: "/dashboard/proveedores" },
    { icon: Package, label: "Productos", href: "/dashboard/productos" },
    { icon: Group, label: "Asociar Productos Proveedor", href: "/dashboard/producto-proveedor" },
    { icon: ShoppingCart, label: "Órdenes de Compra", href: "/dashboard/ordenes-compra" },
    { icon: Package2, label: "Órdenes de Ingreso", href: "/dashboard/ordenes-ingreso" },
    { icon: Truck, label: "Órdenes de Egreso", href: "/dashboard/ordenes-egreso" },
    // { icon: Box, label: "Inventario", href: "/dashboard/inventario" },
    // { icon: TrendingUp, label: "Transferencias", href: "/dashboard/transferencias" },
    { icon: LineChart, label: "Precios Historicos", href: "/dashboard/precios-historicos" },
    { icon: Boxes, label: "Stock Productos", href: "/dashboard/stock-productos" },
    { icon: MapPin, label: "Ubicaciones", href: "/dashboard/ubicaciones" },
    // { icon: BarChart3, label: "Reportes", href: "/dashboard/reportes" },
    // { icon: Users, label: "Usuarios", href: "/dashboard/usuarios" },
    // { icon: Settings, label: "Configuración", href: "/dashboard/configuracion" },
]