export type EventCategory = "Vacuna" | "Desparasitante" | "Medicamento" | "Turno Médico";

export const EVENT_CATEGORIES: EventCategory[] = [
  "Vacuna",
  "Desparasitante",
  "Medicamento",
  "Turno Médico",
];

export interface MedicalEvent {
  id: string;
  petId: string;
  category: EventCategory;
  title: string;
  date: string; // ISO String
  time?: string;
  completed: boolean;
  affiliateUrl?: string; // Preparado para futura monetización
}

export type NewMedicalEventInput = Omit<MedicalEvent, "id">;
