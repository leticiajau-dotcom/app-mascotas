import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { storage } from "@/api/storage";
import { cancelPetReminder, schedulePetReminder } from "@/services/notificationService";
import { EmergencyInfo, NewPetInput, NewStudyFileInput, Pet, StudyFile } from "@/types/pet";
import { MedicalEvent, NewMedicalEventInput } from "@/types/event";
import { combineDateAndTime } from "@/utils/dateUtils";
import { generateId } from "@/utils/formatters";
import { useAuth } from "./AuthContext";

interface PetContextValue {
  pets: Pet[];
  activePets: Pet[];
  selectedPet: Pet | null;
  selectedPetId: string | null;
  events: MedicalEvent[];
  studies: StudyFile[];
  emergencyInfo: EmergencyInfo | null;
  displayName: string | null;
  loading: boolean;
  saveDisplayName: (name: string) => Promise<void>;
  selectPet: (petId: string) => void;
  addPet: (input: NewPetInput) => Promise<Pet>;
  updatePet: (petId: string, updates: Partial<NewPetInput>) => Promise<void>;
  setPetActive: (petId: string, active: boolean) => Promise<void>;
  deletePet: (petId: string) => Promise<void>;
  eventsForPet: (petId: string) => MedicalEvent[];
  addEvent: (input: NewMedicalEventInput, reminderOffsetDays?: number) => Promise<MedicalEvent>;
  updateEvent: (
    eventId: string,
    updates: Partial<NewMedicalEventInput>,
    reminderOffsetDays?: number
  ) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  toggleEventComplete: (eventId: string) => Promise<void>;
  studiesForPet: (petId: string) => StudyFile[];
  addStudyFile: (input: NewStudyFileInput) => Promise<StudyFile>;
  deleteStudyFile: (studyId: string) => Promise<void>;
  saveEmergencyInfo: (info: EmergencyInfo) => Promise<void>;
}

const PetContext = createContext<PetContextValue | undefined>(undefined);

export function PetProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? "guest";

  const [pets, setPets] = useState<Pet[]>([]);
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [studies, setStudies] = useState<StudyFile[]>([]);
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carga inicial / recarga cuando cambia el usuario autenticado.
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function load() {
      const [loadedPets, loadedEvents, loadedStudies, loadedEmergencyInfo, loadedDisplayName] =
        await Promise.all([
          storage.readJSON<Pet[]>(storage.keys.pets(userId), []),
          storage.readJSON<MedicalEvent[]>(storage.keys.events(userId), []),
          storage.readJSON<StudyFile[]>(storage.keys.studies(userId), []),
          storage.readJSON<EmergencyInfo | null>(storage.keys.emergencyInfo(userId), null),
          storage.readJSON<string | null>(storage.keys.displayName(userId), null),
        ]);

      if (!isMounted) return;
      // Compatibilidad hacia atrás: mascotas guardadas antes de sumar el
      // campo `active` se tratan como activas.
      const normalizedPets = loadedPets.map((pet) => ({ ...pet, active: pet.active ?? true }));
      setPets(normalizedPets);
      setEvents(loadedEvents);
      setStudies(loadedStudies);
      setEmergencyInfo(loadedEmergencyInfo);
      setDisplayName(loadedDisplayName);
      setSelectedPetId(
        (current) =>
          current ??
          normalizedPets.find((pet) => pet.active)?.id ??
          normalizedPets[0]?.id ??
          null
      );
      setLoading(false);
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const persistPets = useCallback(
    async (next: Pet[]) => {
      setPets(next);
      await storage.writeJSON(storage.keys.pets(userId), next);
    },
    [userId]
  );

  const persistEvents = useCallback(
    async (next: MedicalEvent[]) => {
      setEvents(next);
      await storage.writeJSON(storage.keys.events(userId), next);
    },
    [userId]
  );

  const persistStudies = useCallback(
    async (next: StudyFile[]) => {
      setStudies(next);
      await storage.writeJSON(storage.keys.studies(userId), next);
    },
    [userId]
  );

  const selectPet = useCallback((petId: string) => {
    setSelectedPetId(petId);
  }, []);

  const addPet = useCallback(
    async (input: NewPetInput) => {
      const pet: Pet = {
        ...input,
        id: generateId(),
        active: true,
      };
      await persistPets([...pets, pet]);
      setSelectedPetId((current) => current ?? pet.id);
      return pet;
    },
    [pets, persistPets]
  );

  const updatePet = useCallback(
    async (petId: string, updates: Partial<NewPetInput>) => {
      const next = pets.map((pet) => (pet.id === petId ? { ...pet, ...updates } : pet));
      await persistPets(next);
    },
    [pets, persistPets]
  );

  const setPetActive = useCallback(
    async (petId: string, active: boolean) => {
      const next = pets.map((pet) => (pet.id === petId ? { ...pet, active } : pet));
      await persistPets(next);

      if (!active) {
        // Al dar de baja, se cancelan los recordatorios pendientes de esa
        // mascota (el historial de eventos y estudios se conserva).
        const eventsToCancel = events.filter((event) => event.petId === petId && !event.completed);
        await Promise.all(eventsToCancel.map((event) => cancelPetReminder(event.id)));

        setSelectedPetId((current) => {
          if (current !== petId) return current;
          return next.find((pet) => pet.active)?.id ?? null;
        });
      }
    },
    [pets, events, persistPets]
  );

  const deletePet = useCallback(
    async (petId: string) => {
      const eventsToCancel = events.filter((event) => event.petId === petId);
      await Promise.all(eventsToCancel.map((event) => cancelPetReminder(event.id)));

      await persistPets(pets.filter((pet) => pet.id !== petId));
      await persistEvents(events.filter((event) => event.petId !== petId));
      await persistStudies(studies.filter((study) => study.petId !== petId));

      setSelectedPetId((current) => (current === petId ? null : current));
    },
    [pets, events, studies, persistPets, persistEvents, persistStudies]
  );

  const eventsForPet = useCallback(
    (petId: string) => events.filter((event) => event.petId === petId),
    [events]
  );

  // El recordatorio de un evento se programa (o cancela) usando su propio
  // `id` como identificador de la notificación local — así no hace falta
  // guardar un notificationId aparte. Solo se recuerdan los eventos aún no
  // completados. `reminderOffsetDays` es la antelación elegida en el
  // formulario (ej. "3 días antes"); es efímera y no se persiste en el
  // MedicalEvent, solo se usa para calcular el disparo de la notificación.
  async function syncEventReminder(event: MedicalEvent, reminderOffsetDays = 0): Promise<void> {
    await cancelPetReminder(event.id);
    if (event.completed) return;

    const triggerDate = combineDateAndTime(event.date, event.time);
    triggerDate.setDate(triggerDate.getDate() - reminderOffsetDays);

    await schedulePetReminder(
      `Recordatorio: ${event.title}`,
      `Es hora de "${event.title}" (${event.category}) para tu mascota.`,
      triggerDate,
      { eventId: event.id, petId: event.petId },
      event.id
    );
  }

  const addEvent = useCallback(
    async (input: NewMedicalEventInput, reminderOffsetDays = 0) => {
      const event: MedicalEvent = { ...input, id: generateId() };
      await syncEventReminder(event, reminderOffsetDays);
      await persistEvents([...events, event]);
      return event;
    },
    [events, persistEvents]
  );

  const updateEvent = useCallback(
    async (eventId: string, updates: Partial<NewMedicalEventInput>, reminderOffsetDays = 0) => {
      const existing = events.find((event) => event.id === eventId);
      if (!existing) return;

      const updated: MedicalEvent = { ...existing, ...updates };
      await syncEventReminder(updated, reminderOffsetDays);

      const next = events.map((event) => (event.id === eventId ? updated : event));
      await persistEvents(next);
    },
    [events, persistEvents]
  );

  const deleteEvent = useCallback(
    async (eventId: string) => {
      await cancelPetReminder(eventId);
      await persistEvents(events.filter((event) => event.id !== eventId));
    },
    [events, persistEvents]
  );

  const toggleEventComplete = useCallback(
    async (eventId: string) => {
      const existing = events.find((event) => event.id === eventId);
      if (!existing) return;

      const updated: MedicalEvent = { ...existing, completed: !existing.completed };
      await syncEventReminder(updated);

      const next = events.map((event) => (event.id === eventId ? updated : event));
      await persistEvents(next);
    },
    [events, persistEvents]
  );

  const studiesForPet = useCallback(
    (petId: string) => studies.filter((study) => study.petId === petId),
    [studies]
  );

  const addStudyFile = useCallback(
    async (input: NewStudyFileInput) => {
      const study: StudyFile = { ...input, id: generateId() };
      await persistStudies([...studies, study]);
      return study;
    },
    [studies, persistStudies]
  );

  const deleteStudyFile = useCallback(
    async (studyId: string) => {
      await persistStudies(studies.filter((study) => study.id !== studyId));
    },
    [studies, persistStudies]
  );

  const saveEmergencyInfo = useCallback(
    async (info: EmergencyInfo) => {
      setEmergencyInfo(info);
      await storage.writeJSON(storage.keys.emergencyInfo(userId), info);
    },
    [userId]
  );

  const saveDisplayName = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      setDisplayName(trimmed || null);
      await storage.writeJSON(storage.keys.displayName(userId), trimmed || null);
    },
    [userId]
  );

  const selectedPet = useMemo(
    () => pets.find((pet) => pet.id === selectedPetId) ?? null,
    [pets, selectedPetId]
  );

  const activePets = useMemo(() => pets.filter((pet) => pet.active), [pets]);

  const value = useMemo<PetContextValue>(
    () => ({
      pets,
      activePets,
      selectedPet,
      selectedPetId,
      events,
      studies,
      emergencyInfo,
      displayName,
      loading,
      saveDisplayName,
      selectPet,
      addPet,
      updatePet,
      setPetActive,
      deletePet,
      eventsForPet,
      addEvent,
      updateEvent,
      deleteEvent,
      toggleEventComplete,
      studiesForPet,
      addStudyFile,
      deleteStudyFile,
      saveEmergencyInfo,
    }),
    [
      pets,
      activePets,
      selectedPet,
      selectedPetId,
      events,
      studies,
      emergencyInfo,
      displayName,
      loading,
      saveDisplayName,
      selectPet,
      addPet,
      updatePet,
      setPetActive,
      deletePet,
      eventsForPet,
      addEvent,
      updateEvent,
      deleteEvent,
      toggleEventComplete,
      studiesForPet,
      addStudyFile,
      deleteStudyFile,
      saveEmergencyInfo,
    ]
  );

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}

export function usePetContext(): PetContextValue {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error("usePetContext debe usarse dentro de un <PetProvider>");
  }
  return context;
}
