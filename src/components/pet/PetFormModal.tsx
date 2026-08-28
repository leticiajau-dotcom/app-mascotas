import React, { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { NewPetInput, PetSpecies } from "@/types/pet";

const SPECIES_OPTIONS: Array<{ value: PetSpecies; label: string }> = [
  { value: "Dog", label: "Perro" },
  { value: "Cat", label: "Gato" },
  { value: "Other", label: "Otro" },
];

interface PetFormModalProps {
  visible: boolean;
  title: string;
  submitLabel: string;
  initialValues?: Partial<NewPetInput>;
  onClose: () => void;
  onSubmit: (values: NewPetInput) => Promise<void>;
}

export default function PetFormModal({
  visible,
  title,
  submitLabel,
  initialValues,
  onClose,
  onSubmit,
}: PetFormModalProps) {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<PetSpecies>("Dog");
  const [customSpecies, setCustomSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [weight, setWeight] = useState("");
  const [chipNumber, setChipNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setName(initialValues?.name ?? "");
    setSpecies(initialValues?.species ?? "Dog");
    setCustomSpecies(initialValues?.customSpecies ?? "");
    setBreed(initialValues?.breed ?? "");
    setBirthDate(initialValues?.birthDate ?? "");
    setWeight(initialValues?.weight !== undefined ? String(initialValues.weight) : "");
    setChipNumber(initialValues?.chipNumber ?? "");
    setFormError(null);
  }, [visible, initialValues]);

  if (!visible) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Ingresá un nombre para tu mascota.");
      return;
    }
    if (species === "Other" && !customSpecies.trim()) {
      setFormError('Contanos qué especie es (ej. "Conejo").');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      await onSubmit({
        name: name.trim(),
        species,
        customSpecies: species === "Other" ? customSpecies.trim() : undefined,
        breed: breed.trim() || undefined,
        birthDate: birthDate || undefined,
        weight: weight.trim() ? Number(weight) : undefined,
        chipNumber: chipNumber.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo guardar la mascota.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-bg p-6 sm:rounded-2xl">
        <h2 className="mb-4 text-xl font-bold text-ink">{title}</h2>
        <form onSubmit={handleSubmit}>
          <Input label="Nombre" placeholder="Ej. Firulais" value={name} onChange={(e) => setName(e.target.value)} />

          <div className="mb-4">
            <span className="mb-1 block text-sm font-semibold text-ink">Especie</span>
            <div className="flex flex-wrap gap-2">
              {SPECIES_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setSpecies(option.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${
                    species === option.value
                      ? "border-primary bg-primary text-white"
                      : "border-border text-ink"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {species === "Other" ? (
            <Input
              label="¿Qué especie es?"
              placeholder="Ej. Conejo"
              value={customSpecies}
              onChange={(e) => setCustomSpecies(e.target.value)}
            />
          ) : null}

          <Input label="Raza (opcional)" placeholder="Ej. Labrador" value={breed} onChange={(e) => setBreed(e.target.value)} />
          <Input
            label="Fecha de nacimiento (opcional)"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
          <Input
            label="Peso en kg (opcional)"
            placeholder="8.5"
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <Input
            label="Número de microchip (opcional)"
            placeholder="Ej. 900000000000000"
            value={chipNumber}
            onChange={(e) => setChipNumber(e.target.value)}
          />

          {formError ? <p className="mb-4 text-sm text-danger">{formError}</p> : null}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
