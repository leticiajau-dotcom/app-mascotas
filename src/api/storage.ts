import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Capa de persistencia local (AsyncStorage).
 *
 * El MVP funciona "offline-first": mascotas, eventos médicos e información
 * de emergencia se guardan localmente en el dispositivo, agrupados por
 * usuario autenticado. `api/supabase.ts` maneja la autenticación y queda
 * listo para sincronizar estos mismos datos contra Postgres en una
 * iteración futura (ver supabase/schema.sql).
 */

const KEYS = {
  pets: (userId: string) => `@petcare/${userId}/pets`,
  events: (userId: string) => `@petcare/${userId}/events`,
  emergencyInfo: (userId: string) => `@petcare/${userId}/emergencyInfo`,
  studies: (userId: string) => `@petcare/${userId}/studies`,
} as const;

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[storage] Error leyendo ${key}`, error);
    return fallback;
  }
}

async function writeJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] Error escribiendo ${key}`, error);
    throw error;
  }
}

export const storage = {
  keys: KEYS,
  readJSON,
  writeJSON,
  async clearUserData(userId: string): Promise<void> {
    await AsyncStorage.multiRemove([
      KEYS.pets(userId),
      KEYS.events(userId),
      KEYS.emergencyInfo(userId),
      KEYS.studies(userId),
    ]);
  },
};
