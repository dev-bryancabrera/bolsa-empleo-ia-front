// PrivateRoute.tsx
import React from "react";
import { Navigate } from "react-router";
import { useAuthStore } from "../services/AuthService";

interface Props {
    children: React.ReactNode
}

export const PrivateRoute = ({ children }: Props) => {
    const status = useAuthStore(state => state.status);
    const isAuthenticated = status === 'authenticated';

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />
    }

    return <>{children}</>;
}