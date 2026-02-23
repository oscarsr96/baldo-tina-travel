import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import LandingPage from "./LandingPage";

export default function RootIndex() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user && profile) {
    return <Navigate to={profile.role === "ADMIN" ? "/admin" : "/dashboard"} replace />;
  }

  return <LandingPage />;
}
