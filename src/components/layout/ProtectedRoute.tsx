import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PetProvider } from "@/context/PetContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-light border-t-primary" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  return <PetProvider>{children}</PetProvider>;
}
