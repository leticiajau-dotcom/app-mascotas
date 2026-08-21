export interface Pet {
  id: string;
  name: string;
  species: "Dog" | "Cat" | "Other";
  breed?: string;
  birthDate?: string;
  weight?: number;
  chipNumber?: string;
  photoUrl?: string;
}

export type PetSpecies = Pet["species"];

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

export type NewPetInput = Omit<Pet, "id">;
