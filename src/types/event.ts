export type MedicalEventType =
  | "vaccine"
  | "deworming"
  | "vet_visit"
  | "medication"
  | "grooming"
  | "weight"
  | "other";

export interface MedicalEvent {
  id: string;
  petId: string;
  type: MedicalEventType;
  title: string;
  date: string; // ISO date string of when it happened / is due
  notes?: string;
  reminderEnabled: boolean;
  reminderDate?: string; // ISO date string, when the local notification fires
  notificationId?: string | null; // expo-notifications identifier, for cancellation
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NewMedicalEventInput = Omit<
  MedicalEvent,
  "id" | "notificationId" | "createdAt" | "updatedAt"
>;

export const EVENT_TYPE_LABELS: Record<MedicalEventType, string> = {
  vaccine: "Vacuna",
  deworming: "Desparasitación",
  vet_visit: "Consulta veterinaria",
  medication: "Medicación",
  grooming: "Peluquería / Baño",
  weight: "Control de peso",
  other: "Otro",
};
