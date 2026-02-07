import { PrivateRoute } from "@/modules/auth/components/PrivateRoute";
import { AuthLayout } from "@/modules/auth/layout/AuthLayout"
import { LoginPage } from "@/modules/auth/pages/LoginPage"
import { useAuthStore } from "@/modules/auth/services/AuthService";
import { ChatIAPage } from "@/modules/chat/pages/ChatIAPage";
import { CVPage } from "@/modules/cv/pages/CVPage";
import { DashboardHomePage } from "@/modules/dashboard/page/DashboardHomePage";
import { RegisterPage } from "@/modules/users/pages/RegisterPage";
import { UserInfoPage } from "@/modules/users/pages/UserInfoPage";
import { lazy, Suspense, useEffect, useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

const DashboardLayout = lazy(() => import('@/modules/dashboard/layout/DashBoardLayout'));

export const AppRouter = () => {

    const isAuthenticated = useAuthStore(state => state.status === "authenticated");
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
                <Route path="/auth" element={<AuthLayout />}>
                    <Route index element={<LoginPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                </Route>

                {/* Dashboard */}
                <Route path="/dashboard" element={
                    <Suspense
                        fallback={
                            <div className="flex h-screen w-full items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                            </div>
                        }
                    >
                        <PrivateRoute>
                            <DashboardLayout />
                        </PrivateRoute>
                    </Suspense>
                }>
                    <Route index element={<DashboardHomePage />} />
                    <Route path="/dashboard/cv" element={<CVPage />} />
                    <Route path="/dashboard/chat" element={<ChatIAPage />} />
                    <Route path="/dashboard/perfil" element={<UserInfoPage />} />

                </Route>

                {/* Rutas de redirección */}
                <Route path="/" element={<Navigate to="/auth/login" replace />} />
                <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}