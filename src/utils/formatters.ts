import { Pet, PetSpecies } from "@/types/pet";

export const SPECIES_LABELS: Record<PetSpecies, string> = {
  Dog: "Perro",
  Cat: "Gato",
  Other: "Otro",
};

/**
 * Especie a mostrar para una mascota: si es "Other" y cargó un nombre
 * propio (ej. "Conejo"), se muestra ese en vez del genérico "Otro" en
 * todos los lugares de la app donde aparecería "Perro"/"Gato".
 */
export function getSpeciesLabel(pet: Pick<Pet, "species" | "customSpecies">): string {
  if (pet.species === "Other" && pet.customSpecies?.trim()) {
    return pet.customSpecies.trim();
  }
  return SPECIES_LABELS[pet.species];
}

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
