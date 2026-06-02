import { PrivateRoute } from "@/modules/auth/components/PrivateRoute"
import { AuthLayout } from "@/modules/auth/layout/AuthLayout"
import { LoginPage } from "@/modules/auth/pages/LoginPage"
import { AuthCallbackPage } from "@/modules/auth/pages/AuthCallbackPage"
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
import { AdminUsersPage } from "@/modules/dashboard/components/AdminUsersPage";
import { AdminCVAnalysisPage } from "@/modules/dashboard/components/AdminCVAnalysisPage";
import { lazy, Suspense, useEffect, useState } from "react"
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom"

const DashboardLayout = lazy(() => import('@/modules/dashboard/layout/DashBoardLayout'));

const AuthWatcher = () => {
    const logout = useAuthStore(state => state.logout);
    const navigate = useNavigate();

    useEffect(() => {
        const handleTokenExpirado = () => {
            logout();
            navigate('/auth/login', { replace: true });
        };
        window.addEventListener('auth:token-expirado', handleTokenExpirado);
        return () => window.removeEventListener('auth:token-expirado', handleTokenExpirado);
    }, [logout, navigate]);

    return null;
};

const LoadingSpinner = () => (
    <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
    </div>
);

export const AppRouter = () => {
    const status = useAuthStore(state => state.status);
    const checkAuth = useAuthStore(state => state.checkAuth);
    const [checkingAuth, setCheckingAuth] = useState(true);

    useEffect(() => {
        checkAuth().finally(() => setCheckingAuth(false));
    }, [])

    if (checkingAuth) return <LoadingSpinner />;

    return (
        <BrowserRouter>
            <AuthWatcher />
            <Routes>
                {/* Callback de Supabase OAuth — fuera del AuthLayout para no mostrar el frame */}
                <Route path="/auth/callback" element={<AuthCallbackPage />} />

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
                    <Route path="usuarios" element={<AdminUsersPage />} />
                    <Route path="analisis-cvs" element={<AdminCVAnalysisPage />} />
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