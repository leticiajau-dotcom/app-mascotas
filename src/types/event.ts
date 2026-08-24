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
  /**
   * Cada cuántos días se repite este evento (ej. desparasitación, pipeta
   * antipulgas). Al marcarlo como hecho, se crea automáticamente la
   * próxima ocurrencia con esta misma cadencia. `undefined`/0 = no repite.
   */
  repeatIntervalDays?: number;
}

export type NewMedicalEventInput = Omit<MedicalEvent, "id">;
