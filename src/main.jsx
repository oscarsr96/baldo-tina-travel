import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthContext";
import { Toaster } from "sonner";
import { router } from "./router";
import "./index.css";

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  </StrictMode>
);
