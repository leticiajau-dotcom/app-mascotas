import { useMemo } from "react";
import { usePetContext } from "@/context/PetContext";
import { sortByDateAsc, sortByDateDesc } from "@/utils/dateUtils";

/**
 * Devuelve los eventos médicos de una mascota específica junto con sus
 * operaciones CRUD, ya ordenados para las vistas más comunes.
 */
export function useEvents(petId: string | null | undefined) {
  const { events, addEvent, updateEvent, deleteEvent, toggleEventComplete } = usePetContext();

  const petEvents = useMemo(
    () => (petId ? events.filter((event) => event.petId === petId) : []),
    [events, petId]
  );

  const upcoming = useMemo(
    () => sortByDateAsc(petEvents.filter((event) => !event.completed)),
    [petEvents]
  );

  const history = useMemo(
    () => sortByDateDesc(petEvents.filter((event) => event.completed)),
    [petEvents]
  );

  return {
    events: petEvents,
    upcoming,
    history,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventComplete,
  };
}
