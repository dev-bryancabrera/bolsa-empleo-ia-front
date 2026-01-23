// import { PrivateRoute } from "@/modules/auth/components/PrivateRoute";
import { AuthLayout } from "@/modules/auth/layout/AuthLayout"
import { LoginPage } from "@/modules/auth/pages/LoginPage"
// import { useAuthStore } from "@/modules/auth/store/AuthStore";
import { DashboardHomePage } from "@/modules/dashboard/page/DashboardHomePage";
import { lazy, Suspense, useEffect, useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router"

const DashboardLayout = lazy(() => import('../modules/dashboard/layout/DashBoardLayout'));

export const AppRouter = () => {

    // const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        setCheckingAuth(false);
    }, [])

    if (checkingAuth) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        )
    }
    return (
        <BrowserRouter>
            <Routes>
                {/* Auth */}
                {/* <Route path="/auth" element={<AuthLayout />}>
                    <Route index element={<LoginPage />} />
                </Route> */}

                {/* Dashboard */}
                <Route path="/dashboard" element={

                    <Suspense
                        fallback={
                            <div className="flex h-screen w-full items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                            </div>
                        }
                    >
                        {/* <PrivateRoute isAuthenticated={isAuthenticated}> */}
                            <DashboardLayout />
                        {/* </PrivateRoute> */}
                    </Suspense>
                }>
                    {/* Pagina principal del dashboard */}
                    <Route index element={<DashboardHomePage />} />
                    {/*Rutas para los modulos del menu  */}
                    {/* <Route path="productos" element={<ProductosPage />} /> */}
                </Route>

                {/* Ruta por defecto - refirigir a la autenticacion */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="*" element={<Navigate to="/auth" />} />
            </Routes>
        </BrowserRouter>
    )
}
