import { PrivateRoute } from "@/modules/auth/components/PrivateRoute"
import { AuthLayout } from "@/modules/auth/layout/AuthLayout"
import { LoginPage } from "@/modules/auth/pages/LoginPage"
import { GoogleCallbackPage } from "@/modules/auth/pages/GoogleCallbackPage"
import { ForgotPasswordPage } from "@/modules/auth/pages/ForgotPasswordPage"
import { ResetPasswordPage } from "@/modules/auth/pages/ResetPasswordPage"
import { useAuthStore } from "@/modules/auth/services/AuthService";
import { ChatIAPage } from "@/modules/chat/pages/ChatIAPage";
import { CVPage } from "@/modules/cv/pages/CVPage";
import { DashboardHomePage } from "@/modules/dashboard/page/DashboardHomePage";
import { RegisterPage } from "@/modules/users/pages/RegisterPage";
import { UserInfoPage } from "@/modules/users/pages/UserInfoPage";
import { ConfiguracionIAPage } from "@/modules/settings/pages/ConfiguracionIAPage";
import { PortfolioEditorPage } from "@/modules/portfolio/pages/PortfolioEditorPage";
import { PortfolioPublicPage } from "@/modules/portfolio/pages/PortfolioPublicPage";
import { lazy, Suspense, useEffect, useState } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

const DashboardLayout = lazy(() => import('@/modules/dashboard/layout/DashBoardLayout'));

const LoadingSpinner = () => (
    <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
    </div>
);

export const AppRouter = () => {
    const isAuthenticated = useAuthStore(state => state.status === "authenticated");
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        setCheckingAuth(false);
    }, [])

    if (checkingAuth) return <LoadingSpinner />;

    return (
        <BrowserRouter>
            <Routes>
                {/* Callback de Google OAuth — fuera del AuthLayout para no mostrar el frame */}
                <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

                {/* Auth */}
                <Route path="/auth" element={<AuthLayout />}>
                    <Route index element={<LoginPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="reset-password" element={<ResetPasswordPage />} />
                </Route>

                {/* Dashboard */}
                <Route path="/dashboard" element={
                    <Suspense fallback={<LoadingSpinner />}>
                        <PrivateRoute>
                            <DashboardLayout />
                        </PrivateRoute>
                    </Suspense>
                }>
                    <Route index element={<DashboardHomePage />} />
                    <Route path="cv" element={<CVPage />} />
                    <Route path="chat" element={<ChatIAPage />} />
                    <Route path="perfil" element={<UserInfoPage />} />
                    <Route path="configuracion-ia" element={<ConfiguracionIAPage />} />
                    <Route path="portfolio" element={<PortfolioEditorPage />} />
                </Route>

                {/* Portafolio público — sin auth */}
                <Route path="/p/:slug" element={<PortfolioPublicPage />} />

                {/* Redirecciones */}
                <Route path="/" element={<Navigate to="/auth/login" replace />} />
                <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
        </BrowserRouter>
    )
}