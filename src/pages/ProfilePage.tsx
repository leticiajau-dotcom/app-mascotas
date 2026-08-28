import React, { useState } from "react";
import { LogOut } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import PetFormModal from "@/components/pet/PetFormModal";
import { useAuth } from "@/context/AuthContext";
import { usePetContext } from "@/context/PetContext";
import { supabase } from "@/lib/supabaseClient";
import { Pet } from "@/types/pet";
import { getSpeciesLabel, initials, formatWeight } from "@/lib/formatters";
import { calculateAge } from "@/lib/dateUtils";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { pets, updatePet, setPetActive } = usePetContext();
  const [displayName, setDisplayName] = useState(
    (user?.user_metadata?.display_name as string | undefined) ?? ""
  );
  const [savingName, setSavingName] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);

  async function handleSaveName() {
    setSavingName(true);
    try {
      await supabase.auth.updateUser({ data: { display_name: displayName.trim() } });
    } finally {
      setSavingName(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-4 pt-8">
      <h1 className="mb-4 text-xl font-bold text-ink">Perfil</h1>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Usuario</h2>
        <Card>
          <p className="mb-3 text-sm text-muted">{user?.email}</p>
          <Input label="Tu nombre" placeholder="¿Cómo te llamamos?" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Button onClick={handleSaveName} loading={savingName} fullWidth={false}>
            Guardar nombre
          </Button>
        </Card>
      </section>

      <section className="mb-6">
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Mascotas</h2>
        {pets.length === 0 ? (
          <Card className="text-center text-sm text-muted">Todavía no cargaste ninguna mascota.</Card>
        ) : (
          <div className="flex flex-col gap-3">
            {pets.map((pet) => (
              <Card key={pet.id} className={pet.active ? "" : "opacity-60"}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-bold text-white">
                    {pet.photoUrl ? (
                      <img src={pet.photoUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initials(pet.name)
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-ink">
                      {pet.name} {!pet.active ? <span className="text-xs font-normal text-muted">(dada de baja)</span> : null}
                    </p>
                    <p className="text-sm text-muted">
                      {getSpeciesLabel(pet)}
                      {pet.breed ? ` · ${pet.breed}` : ""} · {calculateAge(pet.birthDate)} · {formatWeight(pet.weight)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" fullWidth={false} onClick={() => setEditingPet(pet)}>
                    Editar
                  </Button>
                  {pet.active ? (
                    <Button variant="danger" fullWidth={false} onClick={() => setPetActive(pet.id, false)}>
                      Dar de baja
                    </Button>
                  ) : (
                    <Button variant="outline" fullWidth={false} onClick={() => setPetActive(pet.id, true)}>
                      Reactivar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <button
        onClick={signOut}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger py-3 text-sm font-semibold text-danger"
      >
        <LogOut size={18} />
        Cerrar sesión
      </button>

      <PetFormModal
        visible={!!editingPet}
        title="Editar mascota"
        submitLabel="Guardar cambios"
        initialValues={editingPet ?? undefined}
        onClose={() => setEditingPet(null)}
        onSubmit={async (values) => {
          if (!editingPet) return;
          await updatePet(editingPet.id, values);
        }}
      />
    </div>
  );
}
