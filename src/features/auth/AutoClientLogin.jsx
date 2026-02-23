import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

const DEMO_CLIENT = {
  email: "oscarsrueda96@gmail.com",
  password: "password123",
};

export default function AutoClientLogin() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const doLogin = async () => {
      await supabase.auth.signOut();
      const { error } = await supabase.auth.signInWithPassword(DEMO_CLIENT);
      if (error) {
        setError("No se pudo iniciar sesión automática");
        return;
      }
      window.location.href = "/dashboard";
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

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
