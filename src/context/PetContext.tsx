import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createPet, fetchPets, setPetActive as apiSetPetActive, updatePet as apiUpdatePet } from "@/lib/api/pets";
import { NewPetInput, Pet } from "@/types/pet";
import { useAuth } from "./AuthContext";

interface PetContextValue {
  pets: Pet[];
  activePets: Pet[];
  selectedPet: Pet | null;
  selectedPetId: string | null;
  loading: boolean;
  error: string | null;
  selectPet: (petId: string) => void;
  addPet: (input: NewPetInput) => Promise<Pet>;
  updatePet: (petId: string, updates: Partial<NewPetInput>) => Promise<void>;
  setPetActive: (petId: string, active: boolean) => Promise<void>;
  refresh: () => Promise<void>;
}

const PetContext = createContext<PetContextValue | undefined>(undefined);

export function PetProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setPets([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const loaded = await fetchPets();
      setPets(loaded);
      setSelectedPetId((current) => current ?? loaded.find((p) => p.active)?.id ?? loaded[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las mascotas.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const selectPet = useCallback((petId: string) => setSelectedPetId(petId), []);

  const addPet = useCallback(
    async (input: NewPetInput) => {
      if (!user) throw new Error("No hay sesión activa.");
      const pet = await createPet(user.id, input);
      setPets((prev) => [...prev, pet]);
      setSelectedPetId((current) => current ?? pet.id);
      return pet;
    },
    [user]
  );

  const updatePet = useCallback(async (petId: string, updates: Partial<NewPetInput>) => {
    const updated = await apiUpdatePet(petId, updates);
    setPets((prev) => prev.map((pet) => (pet.id === petId ? updated : pet)));
  }, []);

  const setPetActive = useCallback(
    async (petId: string, active: boolean) => {
      const updated = await apiSetPetActive(petId, active);
      setPets((prev) => prev.map((pet) => (pet.id === petId ? updated : pet)));
      if (!active) {
        setSelectedPetId((current) => {
          if (current !== petId) return current;
          return pets.find((p) => p.id !== petId && p.active)?.id ?? null;
        });
      }
    },
    [pets]
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
      loading,
      error,
      selectPet,
      addPet,
      updatePet,
      setPetActive,
      refresh: load,
    }),
    [pets, activePets, selectedPet, selectedPetId, loading, error, selectPet, addPet, updatePet, setPetActive, load]
  );

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>;
}

export function usePetContext(): PetContextValue {
  const context = useContext(PetContext);
  if (!context) throw new Error("usePetContext debe usarse dentro de un <PetProvider>");
  return context;
}
