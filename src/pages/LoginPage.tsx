import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { PawPrint } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { session, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (session) return <Navigate to="/" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signIn") {
        const { error: signInError } = await signIn(email, password);
        if (signInError) setError(signInError);
      } else {
        const { error: signUpError } = await signUp(email, password);
        if (signUpError) setError(signUpError);
        else setInfo("¡Cuenta creada! Si tu proyecto pide confirmar el email, revisá tu bandeja de entrada.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
          <PawPrint size={32} color="white" />
        </div>
        <h1 className="text-2xl font-bold text-ink">PetCare</h1>
        <p className="text-sm text-muted">Historial médico y cuidado de tu mascota</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Contraseña"
          type="password"
          autoComplete={mode === "signIn" ? "current-password" : "new-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
        {info ? <p className="mb-4 text-sm text-success">{info}</p> : null}

        <Button type="submit" loading={loading}>
          {mode === "signIn" ? "Iniciar sesión" : "Crear cuenta"}
        </Button>

        <button
          type="button"
          className="mt-4 w-full text-center text-sm text-primary"
          onClick={() => {
            setMode((m) => (m === "signIn" ? "signUp" : "signIn"));
            setError(null);
            setInfo(null);
          }}
        >
          {mode === "signIn" ? "¿No tenés cuenta? Registrate" : "¿Ya tenés cuenta? Iniciá sesión"}
        </button>
      </form>
    </div>
  );
}
