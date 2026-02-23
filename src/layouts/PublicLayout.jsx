import { Link, Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1100px] mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <h1 className="text-xl font-bold text-accent">Baldo & Tina Travel</h1>
            <p className="text-xs text-muted">Tu aventura europea comienza aquí</p>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/auto-cliente"
              className="text-sm text-muted hover:text-accent transition-colors"
            >
              Cliente
            </Link>
            <Link
              to="/auto-admin"
              className="text-sm text-muted hover:text-accent transition-colors"
            >
              Admin
            </Link>
            <Link
              to="/login"
              className="text-sm text-muted hover:text-accent transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/registro"
              className="text-sm bg-accent hover:bg-accent/90 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      <Outlet />

      <footer className="border-t border-border mt-12 py-6 text-center text-xs text-muted">
        Baldo & Tina Travel · Tu aventura europea personalizada · contacto@baldotina.com
      </footer>
    </div>
  );
}
