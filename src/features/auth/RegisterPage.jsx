import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setLoading(true);
    const { error: err } = await signUp(email, password, fullName, phone);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8">
        <h2 className="text-2xl font-bold text-accent mb-1">Crear cuenta</h2>
        <p className="text-muted text-sm mb-6">Planifica tu viaje perfecto por Europa</p>

        {error && (
          <div className="bg-red/10 border border-red/30 text-red text-sm rounded-lg px-4 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Nombre completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-accent transition-colors"
              placeholder="María González"
            />
          </div>
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
            <label className="block text-sm font-medium text-muted mb-1">Teléfono (opcional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-accent transition-colors"
              placeholder="+54 11 1234-5678"
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
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-accent hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
