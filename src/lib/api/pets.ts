import { supabase } from "@/lib/supabaseClient";
import { NewPetInput, Pet } from "@/types/pet";

/**
 * Capa de acceso a datos: acá vive toda la lógica de "cómo se guarda una
 * mascota" (mapeo entre las columnas snake_case de Postgres y los tipos
 * camelCase de la app). El resto de la app (contexto, pantallas) nunca
 * habla con Supabase directamente — así, si el día de mañana esta misma
 * lógica se reutiliza en una app nativa, solo hace falta reemplazar este
 * archivo, no las pantallas.
 */

interface PetRow {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  custom_species: string | null;
  breed: string | null;
  birth_date: string | null;
  weight: number | null;
  photo_url: string | null;
  chip_number: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

function rowToPet(row: PetRow): Pet {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    species: row.species as Pet["species"],
    customSpecies: row.custom_species ?? undefined,
    breed: row.breed ?? undefined,
    birthDate: row.birth_date ?? undefined,
    weight: row.weight ?? undefined,
    photoUrl: row.photo_url ?? undefined,
    chipNumber: row.chip_number ?? undefined,
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function petInputToRow(input: Partial<NewPetInput>) {
  const row: Record<string, unknown> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.species !== undefined) row.species = input.species;
  if (input.customSpecies !== undefined) row.custom_species = input.customSpecies || null;
  if (input.breed !== undefined) row.breed = input.breed || null;
  if (input.birthDate !== undefined) row.birth_date = input.birthDate || null;
  if (input.weight !== undefined) row.weight = input.weight ?? null;
  if (input.photoUrl !== undefined) row.photo_url = input.photoUrl || null;
  if (input.chipNumber !== undefined) row.chip_number = input.chipNumber || null;
  return row;
}

export async function fetchPets(): Promise<Pet[]> {
  // RLS ya limita esto a las mascotas del usuario autenticado (ver
  // supabase/schema.sql), no hace falta filtrar por owner_id acá.
  const { data, error } = await supabase
    .from("pets")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as PetRow[]).map(rowToPet);
}

export async function createPet(ownerId: string, input: NewPetInput): Promise<Pet> {
  const { data, error } = await supabase
    .from("pets")
    .insert({ ...petInputToRow(input), owner_id: ownerId })
    .select("*")
    .single();

  if (error) throw error;
  return rowToPet(data as PetRow);
}

export async function updatePet(petId: string, updates: Partial<NewPetInput>): Promise<Pet> {
  const { data, error } = await supabase
    .from("pets")
    .update(petInputToRow(updates))
    .eq("id", petId)
    .select("*")
    .single();

  if (error) throw error;
  return rowToPet(data as PetRow);
}

export async function setPetActive(petId: string, active: boolean): Promise<Pet> {
  const { data, error } = await supabase
    .from("pets")
    .update({ active })
    .eq("id", petId)
    .select("*")
    .single();

  if (error) throw error;
  return rowToPet(data as PetRow);
}
