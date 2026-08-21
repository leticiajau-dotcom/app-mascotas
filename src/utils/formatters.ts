import { PetSpecies, PetSex } from "@/types/pet";

export const SPECIES_LABELS: Record<PetSpecies, string> = {
  dog: "Perro",
  cat: "Gato",
  bird: "Ave",
  rabbit: "Conejo",
  other: "Otro",
};

export const SEX_LABELS: Record<PetSex, string> = {
  male: "Macho",
  female: "Hembra",
  unknown: "Desconocido",
};

export function formatWeight(weightKg: number | undefined): string {
  if (weightKg === undefined || weightKg === null || Number.isNaN(weightKg)) {
    return "Sin registrar";
  }
  return `${weightKg.toFixed(1)} kg`;
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
