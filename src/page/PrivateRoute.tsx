import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { JSX } from "react";

export function PrivateRoute({ children }: { children: JSX.Element }) {
    const { session, loadingSession } = useAuth();

    // Enquanto verifica sessão, pode mostrar um loader
    if (loadingSession) {
        return <div>
            <div className="flex items-center justify-center h-screen">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-primary animate-spin h-40 w-40"></div>
            </div>
        </div>;
    }

    // Se não estiver autenticado, redireciona para login
    if (!session) {
        return <Navigate to="/login" replace />;
    }

    // Se estiver autenticado, renderiza o componente protegido
    return children;
}