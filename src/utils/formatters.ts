import { PetSpecies } from "@/types/pet";

export const SPECIES_LABELS: Record<PetSpecies, string> = {
  Dog: "Perro",
  Cat: "Gato",
  Other: "Otro",
};

export function formatWeight(weight: number | undefined): string {
  if (weight === undefined || weight === null || Number.isNaN(weight)) {
    return "Sin registrar";
  }
  return `${weight.toFixed(1)} kg`;
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
