import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const DEMO_ADMIN = {
  email: "oscarsr96@hotmail.com",
  password: "password123",
};

export default function AutoAdminLogin() {
  const { user, profile, signIn } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si ya está logueado como admin, no hacer nada
    if (user && profile?.role === "ADMIN") return;

    signIn(DEMO_ADMIN.email, DEMO_ADMIN.password).then(({ error }) => {
      if (error) setError("No se pudo iniciar sesión automática");
    });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-red">{error}</p>
      </div>
    );
  }

  if (user && profile?.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
