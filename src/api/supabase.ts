import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { createClient } from "@supabase/supabase-js";

// Las credenciales se leen desde app.json > expo.extra (ver .env.example para
// generar tus propios valores) y se inyectan en build time. Nunca hardcodees
// claves reales en el repositorio.
const extra = Constants.expoConfig?.extra ?? {};

const supabaseUrl = (extra.supabaseUrl as string) || process.env.SUPABASE_URL || "";
const supabaseAnonKey =
  (extra.supabaseAnonKey as string) || process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || supabaseUrl.includes("PLACEHOLDER")) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] Configura SUPABASE_URL y SUPABASE_ANON_KEY en app.json (expo.extra) o variables de entorno."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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
