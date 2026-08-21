export type PetSpecies = "dog" | "cat" | "bird" | "rabbit" | "other";

export type PetSex = "male" | "female" | "unknown";

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: PetSpecies;
  breed?: string;
  sex: PetSex;
  birthDate?: string; // ISO date string
  weightKg?: number;
  photoUri?: string;
  microchipId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyInfo {
  petId: string;
  ownerName: string;
  ownerPhone: string;
  vetName?: string;
  vetPhone?: string;
  vetAddress?: string;
  allergies?: string;
  conditions?: string;
  bloodType?: string;
}

export type NewPetInput = Omit<Pet, "id" | "ownerId" | "createdAt" | "updatedAt">;
