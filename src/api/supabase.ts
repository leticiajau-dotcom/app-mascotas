import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { createClient } from "@supabase/supabase-js";

// Las credenciales se leen desde app.json > expo.extra (ver .env.example para
// generar tus propios valores) y se inyectan en build time. Nunca hardcodees
// claves reales en el repositorio.
const extra = Constants.expoConfig?.extra ?? {};

const rawSupabaseUrl = (extra.supabaseUrl as string) || process.env.SUPABASE_URL || "";
const supabaseAnonKey =
  (extra.supabaseAnonKey as string) || process.env.SUPABASE_ANON_KEY || "";

const isConfigured = !!rawSupabaseUrl && !rawSupabaseUrl.includes("PLACEHOLDER");

if (!isConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] Configura SUPABASE_URL y SUPABASE_ANON_KEY en app.json (expo.extra) o variables de entorno."
  );
}

// createClient() valida la URL de forma síncrona y tira una excepción con
// cualquier valor que no sea una URL http(s) real — eso rompía el arranque
// completo de la app (pantalla en blanco) cuando el proyecto todavía no
// tiene credenciales de Supabase configuradas. Con un placeholder sin
// configurar, usamos una URL dummy válida: el cliente se crea sin problema
// y solo las llamadas de red (login, etc.) fallan, en vez de toda la app.
const supabaseUrl = isConfigured ? rawSupabaseUrl : "https://placeholder.supabase.co";

export const supabase = createClient(supabaseUrl, supabaseAnonKey || "public-anon-key", {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Esquema de referencia (SQL) — ver supabase/schema.sql en la raíz del proyecto.
 * Tablas: pets, medical_events, emergency_info.
 */
