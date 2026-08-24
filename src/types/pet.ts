export interface Pet {
  id: string;
  name: string;
  species: "Dog" | "Cat" | "Other";
  /** Nombre de la especie cuando `species` es "Other" (ej. "Conejo", "Hamster"). */
  customSpecies?: string;
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

/**
 * Un archivo asociado a una mascota: una foto de estudio (radiografía,
 * análisis) o un documento importado (PDF de resultados de laboratorio,
 * historia clínica que envía el veterinario, etc.).
 */
export interface StudyFile {
  id: string;
  petId: string;
  uri: string;
  fileName: string;
  mimeType?: string;
  kind: "image" | "document";
  label?: string;
  date: string; // ISO string
}

export type NewStudyFileInput = Omit<StudyFile, "id">;
