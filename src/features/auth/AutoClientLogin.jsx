import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const DEMO_CLIENT = {
  email: "oscarsrueda96@gmail.com",
  password: "password123",
};

export default function AutoClientLogin() {
  const { user, profile, signIn, signOut } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && profile?.role === "CLIENT") return;

    const doLogin = async () => {
      // Si está logueado como otro rol, cerrar sesión primero
      if (user) await signOut();

      const { error } = await signIn(DEMO_CLIENT.email, DEMO_CLIENT.password);
      if (error) setError("No se pudo iniciar sesión automática");
    };

    doLogin();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-red">{error}</p>
      </div>
    );
  }

  if (user && profile?.role === "CLIENT") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
