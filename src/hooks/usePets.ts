import { usePetContext } from "@/context/PetContext";

/**
 * Acceso conveniente al listado de mascotas y sus operaciones CRUD.
 * Es un wrapper delgado sobre PetContext para mantener los componentes
 * desacoplados del provider concreto.
 */
export function usePets() {
  const { pets, selectedPet, selectedPetId, selectPet, addPet, updatePet, deletePet, loading } =
    usePetContext();

  return { pets, selectedPet, selectedPetId, selectPet, addPet, updatePet, deletePet, loading };
}
