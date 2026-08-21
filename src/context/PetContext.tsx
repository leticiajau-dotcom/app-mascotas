import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { storage } from "@/api/storage";
import { cancelEventReminder, scheduleEventReminder } from "@/services/notificationService";
import { EmergencyInfo, NewPetInput, Pet } from "@/types/pet";
import { MedicalEvent, NewMedicalEventInput } from "@/types/event";
import { generateId } from "@/utils/formatters";
import { useAuth } from "./AuthContext";

interface PetContextValue {
  pets: Pet[];
  selectedPet: Pet | null;
  selectedPetId: string | null;
  events: MedicalEvent[];
  emergencyInfo: EmergencyInfo | null;
  loading: boolean;
  selectPet: (petId: string) => void;
  addPet: (input: NewPetInput) => Promise<Pet>;
  updatePet: (petId: string, updates: Partial<NewPetInput>) => Promise<void>;
  deletePet: (petId: string) => Promise<void>;
  eventsForPet: (petId: string) => MedicalEvent[];
  addEvent: (input: NewMedicalEventInput) => Promise<MedicalEvent>;
  updateEvent: (eventId: string, updates: Partial<NewMedicalEventInput>) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  toggleEventComplete: (eventId: string) => Promise<void>;
  saveEmergencyInfo: (info: EmergencyInfo) => Promise<void>;
}

const PetContext = createContext<PetContextValue | undefined>(undefined);

export function PetProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? "guest";

  const [pets, setPets] = useState<Pet[]>([]);
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [emergencyInfo, setEmergencyInfo] = useState<EmergencyInfo | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carga inicial / recarga cuando cambia el usuario autenticado.
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function load() {
      const [loadedPets, loadedEvents, loadedEmergencyInfo] = await Promise.all([
        storage.readJSON<Pet[]>(storage.keys.pets(userId), []),
        storage.readJSON<MedicalEvent[]>(storage.keys.events(userId), []),
        storage.readJSON<EmergencyInfo | null>(storage.keys.emergencyInfo(userId), null),
      ]);

      if (!isMounted) return;
      setPets(loadedPets);
      setEvents(loadedEvents);
      setEmergencyInfo(loadedEmergencyInfo);
      setSelectedPetId((current) => current ?? loadedPets[0]?.id ?? null);
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

  const selectPet = useCallback((petId: string) => {
    setSelectedPetId(petId);
  }, []);

  const addPet = useCallback(
    async (input: NewPetInput) => {
      const now = new Date().toISOString();
      const pet: Pet = {
        ...input,
        id: generateId(),
        ownerId: userId,
        createdAt: now,
        updatedAt: now,
      };
      await persistPets([...pets, pet]);
      setSelectedPetId((current) => current ?? pet.id);
      return pet;
    },
    [pets, persistPets, userId]
  );

  const updatePet = useCallback(
    async (petId: string, updates: Partial<NewPetInput>) => {
      const next = pets.map((pet) =>
        pet.id === petId ? { ...pet, ...updates, updatedAt: new Date().toISOString() } : pet
      );
      await persistPets(next);
    },
    [pets, persistPets]
  );

  const deletePet = useCallback(
    async (petId: string) => {
      const eventsToCancel = events.filter((event) => event.petId === petId);
      await Promise.all(eventsToCancel.map((event) => cancelEventReminder(event.notificationId)));

      await persistPets(pets.filter((pet) => pet.id !== petId));
      await persistEvents(events.filter((event) => event.petId !== petId));

      setSelectedPetId((current) => (current === petId ? null : current));
    },
    [pets, events, persistPets, persistEvents]
  );

  const eventsForPet = useCallback(
    (petId: string) => events.filter((event) => event.petId === petId),
    [events]
  );

  const addEvent = useCallback(
    async (input: NewMedicalEventInput) => {
      let notificationId: string | null = null;

      if (input.reminderEnabled && input.reminderDate) {
        notificationId = await scheduleEventReminder({
          title: `Recordatorio: ${input.title}`,
          body: `Es hora de registrar "${input.title}" para tu mascota.`,
          date: new Date(input.reminderDate),
        });
      }

      const now = new Date().toISOString();
      const event: MedicalEvent = {
        ...input,
        id: generateId(),
        notificationId,
        createdAt: now,
        updatedAt: now,
      };

      await persistEvents([...events, event]);
      return event;
    },
    [events, persistEvents]
  );

  const updateEvent = useCallback(
    async (eventId: string, updates: Partial<NewMedicalEventInput>) => {
      const existing = events.find((event) => event.id === eventId);
      if (!existing) return;

      let notificationId = existing.notificationId;
      const reminderChanged =
        updates.reminderEnabled !== undefined || updates.reminderDate !== undefined;

      if (reminderChanged) {
        await cancelEventReminder(existing.notificationId);
        notificationId = null;

        const willRemind = updates.reminderEnabled ?? existing.reminderEnabled;
        const reminderDate = updates.reminderDate ?? existing.reminderDate;

        if (willRemind && reminderDate) {
          notificationId = await scheduleEventReminder({
            title: `Recordatorio: ${updates.title ?? existing.title}`,
            body: `Es hora de registrar "${updates.title ?? existing.title}" para tu mascota.`,
            date: new Date(reminderDate),
          });
        }
      }

      const next = events.map((event) =>
        event.id === eventId
          ? { ...event, ...updates, notificationId, updatedAt: new Date().toISOString() }
          : event
      );
      await persistEvents(next);
    },
    [events, persistEvents]
  );

  const deleteEvent = useCallback(
    async (eventId: string) => {
      const existing = events.find((event) => event.id === eventId);
      if (existing) await cancelEventReminder(existing.notificationId);
      await persistEvents(events.filter((event) => event.id !== eventId));
    },
    [events, persistEvents]
  );

  const toggleEventComplete = useCallback(
    async (eventId: string) => {
      const next = events.map((event) =>
        event.id === eventId
          ? { ...event, completed: !event.completed, updatedAt: new Date().toISOString() }
          : event
      );
      await persistEvents(next);
    },
    [events, persistEvents]
  );

  const saveEmergencyInfo = useCallback(
    async (info: EmergencyInfo) => {
      setEmergencyInfo(info);
      await storage.writeJSON(storage.keys.emergencyInfo(userId), info);
    },
    [userId]
  );

  const selectedPet = useMemo(
    () => pets.find((pet) => pet.id === selectedPetId) ?? null,
    [pets, selectedPetId]
  );

  const value = useMemo<PetContextValue>(
    () => ({
      pets,
      selectedPet,
      selectedPetId,
      events,
      emergencyInfo,
      loading,
      selectPet,
      addPet,
      updatePet,
      deletePet,
      eventsForPet,
      addEvent,
      updateEvent,
      deleteEvent,
      toggleEventComplete,
      saveEmergencyInfo,
    }),
    [
      pets,
      selectedPet,
      selectedPetId,
      events,
      emergencyInfo,
      loading,
      selectPet,
      addPet,
      updatePet,
      deletePet,
      eventsForPet,
      addEvent,
      updateEvent,
      deleteEvent,
      toggleEventComplete,
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
