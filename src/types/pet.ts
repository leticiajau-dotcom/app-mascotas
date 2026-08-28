export type PetSpecies = "Dog" | "Cat" | "Other";

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: PetSpecies;
  /** Nombre propio cuando `species` es "Other" (ej. "Conejo"). */
  customSpecies?: string;
  breed?: string;
  /** Fecha de nacimiento en formato AAAA-MM-DD. */
  birthDate?: string;
  /** Peso en kg. */
  weight?: number;
  photoUrl?: string;
  chipNumber?: string;
  /** false = mascota "dada de baja": conserva su historial pero sale de los selectores. */
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NewPetInput = Omit<
  Pet,
  "id" | "ownerId" | "active" | "createdAt" | "updatedAt"
>;
