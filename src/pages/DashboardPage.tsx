import React, { useState } from "react";
import { PawPrint } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PetFormModal from "@/components/pet/PetFormModal";
import { useAuth } from "@/context/AuthContext";
import { usePetContext } from "@/context/PetContext";
import { Pet } from "@/types/pet";
import { getSpeciesLabel, initials } from "@/lib/formatters";
import { calculateAge } from "@/lib/dateUtils";

export default function DashboardPage() {
  const { user } = useAuth();
  const { pets, activePets, selectedPet, selectedPetId, selectPet, addPet, loading, error } = usePetContext();
  const [showAddPet, setShowAddPet] = useState(false);
  const [showPetPicker, setShowPetPicker] = useState(false);

  const greetingName = (user?.user_metadata?.display_name as string | undefined) || user?.email || "";

  return (
    <div className="mx-auto max-w-md p-4 pt-8">
      <h1 className="mb-6 text-xl font-bold text-ink">Hola{greetingName ? `, ${greetingName}` : ""} 👋</h1>

      <button
        onClick={() => setShowPetPicker(true)}
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bold text-white"
      >
        <PawPrint size={22} />
        Mis mascotas
      </button>

      {loading ? (
        <p className="text-center text-sm text-muted">Cargando…</p>
      ) : error ? (
        <Card className="text-center">
          <p className="text-sm text-danger">{error}</p>
        </Card>
      ) : selectedPet ? (
        <div className="mb-4 flex items-center gap-2 px-1">
          <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary-light text-xs font-bold text-primary">
            {selectedPet.photoUrl ? (
              <img src={selectedPet.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(selectedPet.name)
            )}
          </div>
          <p className="text-sm text-muted">
            {selectedPet.name} · {getSpeciesLabel(selectedPet)} · {calculateAge(selectedPet.birthDate)}
          </p>
        </div>
      ) : (
        <Card className="items-center text-center">
          <p className="text-sm text-muted">
            {pets.length > 0
              ? "No tenés mascotas activas. Reactivá alguna desde tu Perfil o agregá una nueva."
              : 'Aún no tenés mascotas registradas. Tocá "Mis mascotas" para agregar la primera.'}
          </p>
          <Button onClick={() => setShowAddPet(true)} className="mt-4" fullWidth={false}>
            Agregar mascota
          </Button>
        </Card>
      )}

      {selectedPet ? (
        <Card className="mt-4 text-center text-sm text-muted">
          El resto del inicio (agenda de vencimientos, próximos eventos) se está reconstruyendo sobre la
          nueva base — llega en la próxima etapa.
        </Card>
      ) : null}

      <PetFormModal
        visible={showAddPet}
        title="Nueva mascota"
        submitLabel="Guardar"
        onClose={() => setShowAddPet(false)}
        onSubmit={async (values) => {
          await addPet(values);
        }}
      />

      <PetPickerModal
        visible={showPetPicker}
        pets={activePets}
        selectedPetId={selectedPetId}
        onSelect={(id) => {
          selectPet(id);
          setShowPetPicker(false);
        }}
        onAddNew={() => {
          setShowPetPicker(false);
          setShowAddPet(true);
        }}
        onClose={() => setShowPetPicker(false)}
      />
    </div>
  );
}

function PetPickerModal({
  visible,
  pets,
  selectedPetId,
  onSelect,
  onAddNew,
  onClose,
}: {
  visible: boolean;
  pets: Pet[];
  selectedPetId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
  onClose: () => void;
}) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-6 sm:rounded-2xl">
        <h2 className="mb-4 text-lg font-bold text-ink">Mis mascotas</h2>
        {pets.length === 0 ? (
          <p className="text-sm text-muted">Todavía no tenés mascotas activas.</p>
        ) : (
          <div className="mb-2">
            {pets.map((pet) => (
              <button
                key={pet.id}
                onClick={() => onSelect(pet.id)}
                className="flex w-full items-center gap-3 border-b border-border py-3 text-left last:border-0"
              >
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-white">
                  {pet.photoUrl ? (
                    <img src={pet.photoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(pet.name)
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-ink">{pet.name}</p>
                  <p className="text-sm text-muted">
                    {getSpeciesLabel(pet)}
                    {pet.breed ? ` · ${pet.breed}` : ""} · {calculateAge(pet.birthDate)}
                  </p>
                </div>
                {pet.id === selectedPetId ? (
                  <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-bold text-primary">
                    Actual
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 flex flex-col gap-2">
          <Button variant="outline" onClick={onAddNew}>
            Agregar otra mascota
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
