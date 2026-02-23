import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const DEMO_CLIENT = {
  email: "oscarsrueda96@gmail.com",
  password: "password123",
};

export default function AutoClientLogin() {
  const { user, profile, signIn } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && profile?.role === "CLIENT") return;

    signIn(DEMO_CLIENT.email, DEMO_CLIENT.password).then(({ error }) => {
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

  if (user && profile?.role === "CLIENT") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
