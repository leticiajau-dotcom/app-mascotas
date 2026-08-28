import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] Faltan VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. " +
      "Copiá .env.example a .env y completá tus credenciales (ver README)."
  );
}

// Fallback a una URL válida (pero inexistente) para que createClient() no
// tire una excepción sincrónica cuando todavía no se configuró el .env —
// así la app carga y muestra el aviso de arriba en vez de una pantalla en blanco.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);
