import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import ClientLayout from "./layouts/ClientLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import LandingPage from "./features/landing/LandingPage";
import ClientDashboard from "./features/client/ClientDashboard";
import NewRequestPage from "./features/client/NewRequestPage";
import ClientRequestDetail from "./features/client/ClientRequestDetail";
import ProfilePage from "./features/client/ProfilePage";
import AdminDashboard from "./features/admin/AdminDashboard";
import AdminRequestDetail from "./features/admin/AdminRequestDetail";
import RootIndex from "./features/landing/RootIndex";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <RootIndex /> },
      { path: "login", element: <LoginPage /> },
      { path: "registro", element: <RegisterPage /> },
    ],
  },
  {
    path: "/",
    element: (
      <ProtectedRoute role="CLIENT">
        <ClientLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <ClientDashboard /> },
      { path: "nueva-solicitud", element: <NewRequestPage /> },
      { path: "solicitud/:id", element: <ClientRequestDetail /> },
      { path: "perfil", element: <ProfilePage /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute role="ADMIN">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "solicitudes", element: <AdminDashboard /> },
      { path: "solicitud/:id", element: <AdminRequestDetail /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
