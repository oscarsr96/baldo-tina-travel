import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError("Email o contraseña incorrectos");
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8">
        <h2 className="text-2xl font-bold text-accent mb-1">Iniciar sesión</h2>
        <p className="text-muted text-sm mb-6">Accede a tu cuenta de Baldo & Tina Travel</p>

        {error && (
          <div className="bg-red/10 border border-red/30 text-red text-sm rounded-lg px-4 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-accent transition-colors"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-accent transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="text-accent hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
