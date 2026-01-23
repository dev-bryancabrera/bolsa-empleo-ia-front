import {
    Building2,
    FileText,
    Package,
    ShoppingCart,
    TrendingUp,
    Truck,
    ArrowUpRight,
    ArrowDownRight,
    Package2,
    DollarSign,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card"
import { Button } from "@/core/components/ui/button"
import { Badge } from "@/core/components/ui/badge"

export const DashboardHomePage = () => {
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1,234</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600 flex items-center">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                +12%
                            </span>
                            desde el mes pasado
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Proveedores Activos</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">89</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600 flex items-center">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                +3
                            </span>
                            nuevos este mes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Órdenes Pendientes</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">23</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-red-600 flex items-center">
                                <ArrowDownRight className="h-3 w-3 mr-1" />
                                -5
                            </span>
                            desde ayer
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor Inventario</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">$45,231</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600 flex items-center">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                +8.2%
                            </span>
                            vs mes anterior
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Órdenes de Compra Recientes</CardTitle>
                        <CardDescription>Últimas órdenes generadas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { id: "OC-001", proveedor: "Proveedor ABC", estado: "Pendiente", fecha: "2024-01-15" },
                                { id: "OC-002", proveedor: "Distribuidora XYZ", estado: "Aprobada", fecha: "2024-01-14" },
                                { id: "OC-003", proveedor: "Importadora 123", estado: "En Tránsito", fecha: "2024-01-13" },
                            ].map((orden) => (
                                <div key={orden.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">{orden.id}</p>
                                        <p className="text-sm text-gray-600">{orden.proveedor}</p>
                                        <p className="text-xs text-gray-500">{orden.fecha}</p>
                                    </div>
                                    <Badge
                                        variant={
                                            orden.estado === "Pendiente"
                                                ? "destructive"
                                                : orden.estado === "Aprobada"
                                                    ? "default"
                                                    : "secondary"
                                        }
                                    >
                                        {orden.estado}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Stock Bajo</CardTitle>
                        <CardDescription>Productos que requieren reposición</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { producto: "Producto A", stock: 5, minimo: 20, ubicacion: "Almacén Principal" },
                                { producto: "Producto B", stock: 12, minimo: 50, ubicacion: "Almacén Secundario" },
                                { producto: "Producto C", stock: 3, minimo: 15, ubicacion: "Almacén Principal" },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                                >
                                    <div>
                                        <p className="font-medium">{item.producto}</p>
                                        <p className="text-sm text-gray-600">{item.ubicacion}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-red-600">Stock: {item.stock}</p>
                                        <p className="text-xs text-gray-500">Mín: {item.minimo}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                    <CardDescription>Operaciones frecuentes del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button className="h-20 flex flex-col items-center justify-center space-y-2">
                            <ShoppingCart className="h-6 w-6" />
                            <span className="text-sm">Nueva Orden</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                        >
                            <Package2 className="h-6 w-6" />
                            <span className="text-sm">Registrar Ingreso</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                        >
                            <Truck className="h-6 w-6" />
                            <span className="text-sm">Registrar Egreso</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                        >
                            <TrendingUp className="h-6 w-6" />
                            <span className="text-sm">Nueva Transferencia</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}
