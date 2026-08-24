export interface Pet {
  id: string;
  name: string;
  species: "Dog" | "Cat" | "Other";
  breed?: string;
  birthDate?: string;
  weight?: number;
  chipNumber?: string;
  photoUrl?: string;
  /** false = mascota dada de baja (falleció / ya no está con el dueño).
   * Se conserva junto con todo su historial en vez de borrarla. */
  active: boolean;
}

export type PetSpecies = Pet["species"];

export interface EmergencyInfo {
  petId: string;
  ownerName: string;
  ownerPhone: string;
  vetName?: string; // Veterinario de cabecera
  vetPhone?: string;
  vetAddress?: string;
  emergencyClinicName?: string; // Clínica de urgencia 24h
  emergencyClinicPhone?: string;
  allergies?: string;
  conditions?: string;
  bloodType?: string;
}

export type NewPetInput = Omit<Pet, "id" | "active">;

/** Foto de un estudio/análisis (radiografía, laboratorio, etc.) de una mascota. */
export interface StudyPhoto {
  id: string;
  petId: string;
  uri: string;
  label?: string;
  date: string; // ISO string
}

export type NewStudyPhotoInput = Omit<StudyPhoto, "id">;
