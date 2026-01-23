import carfaithApi from "@/core/api/carfaithApi"
import { useAuthStore } from "../store/AuthStore";

export const Login = async (email: string, password: string) => {
    try {
        const response = await carfaithApi.post('/Auth/Login', {
            email: email,
            password: password
        });
        if (response.data && response.data.usuario) {
            useAuthStore.getState().login(response.data.usuario, email, password);
        }
        return response;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
}