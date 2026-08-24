import React, { useEffect, useState } from "react";
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Camera } from "lucide-react-native";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Colors from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { pickImageFromLibrary } from "@/services/mediaService";
import { NewPetInput, PetSpecies } from "@/types/pet";
import { SPECIES_LABELS } from "@/utils/formatters";
import { parseDateInput, toDateInputValue } from "@/utils/dateUtils";

const SPECIES_OPTIONS: PetSpecies[] = ["Dog", "Cat", "Other"];

/**
 * Formulario de alta/edición de mascota, compartido entre "Nueva mascota"
 * (Dashboard) y "Editar mascota" (Perfil) para no duplicar los campos.
 */
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
  const [birthDateInput, setBirthDateInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [chipNumber, setChipNumber] = useState("");
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Cada vez que se abre (para crear o para editar una mascota puntual),
  // recarga el formulario con sus valores iniciales.
  useEffect(() => {
    if (!visible) return;
    setName(initialValues?.name ?? "");
    setSpecies(initialValues?.species ?? "Dog");
    setCustomSpecies(initialValues?.customSpecies ?? "");
    setBreed(initialValues?.breed ?? "");
    setBirthDateInput(initialValues?.birthDate ? toDateInputValue(initialValues.birthDate) : "");
    setWeightInput(initialValues?.weight !== undefined ? String(initialValues.weight) : "");
    setChipNumber(initialValues?.chipNumber ?? "");
    setPhotoUri(initialValues?.photoUrl);
    setError(null);
  }, [visible, initialValues]);

  async function handlePickPhoto() {
    const result = await pickImageFromLibrary();
    if (result.status === "denied") {
      setError("Necesitamos acceso a tus fotos para elegir la imagen de tu mascota.");
      return;
    }
    if (result.status === "canceled") return;
    setPhotoUri(result.file.uri);
  }

  async function handleSubmit() {
    if (!name.trim()) return;

    if (species === "Other" && !customSpecies.trim()) {
      setError("Contanos qué especie es (ej. Conejo, Hamster, Ave).");
      return;
    }

    let birthDate: string | undefined;
    if (birthDateInput.trim()) {
      const parsed = parseDateInput(birthDateInput);
      if (!parsed) {
        setError("La fecha de nacimiento debe tener el formato AAAA-MM-DD.");
        return;
      }
      birthDate = parsed.toISOString();
    }

    let weight: number | undefined;
    if (weightInput.trim()) {
      const parsedWeight = Number(weightInput.replace(",", "."));
      if (Number.isNaN(parsedWeight) || parsedWeight <= 0) {
        setError("El peso debe ser un número válido en kg.");
        return;
      }
      weight = parsedWeight;
    }

    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        species,
        customSpecies: species === "Other" ? customSpecies.trim() : undefined,
        breed: breed.trim() || undefined,
        birthDate,
        weight,
        chipNumber: chipNumber.trim() || undefined,
        photoUrl: photoUri,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>{title}</Text>

          <TouchableOpacity style={styles.photoPicker} onPress={handlePickPhoto}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Camera size={22} color={Colors.primary} />
              </View>
            )}
            <Text style={styles.photoPickerText}>
              {photoUri ? "Cambiar foto" : "Agregar foto (opcional)"}
            </Text>
          </TouchableOpacity>

          <Input label="Nombre" placeholder="Ej. Firulais" value={name} onChangeText={setName} />
          <Input
            label="Raza (opcional)"
            placeholder="Ej. Labrador"
            value={breed}
            onChangeText={setBreed}
          />

          <Text style={styles.fieldLabel}>Especie</Text>
          <View style={styles.chipsRow}>
            {SPECIES_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.chip, species === option && styles.chipSelected]}
                onPress={() => setSpecies(option)}
              >
                <Text style={[styles.chipText, species === option && styles.chipTextSelected]}>
                  {SPECIES_LABELS[option]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {species === "Other" ? (
            <Input
              label="¿Cuál especie?"
              placeholder="Ej. Conejo, Hamster, Ave"
              value={customSpecies}
              onChangeText={setCustomSpecies}
            />
          ) : null}

          <Input
            label="Fecha de nacimiento (opcional, AAAA-MM-DD)"
            placeholder="2022-05-10"
            value={birthDateInput}
            onChangeText={setBirthDateInput}
            keyboardType="numbers-and-punctuation"
          />

          <Input
            label="Peso en kg (opcional)"
            placeholder="8.5"
            value={weightInput}
            onChangeText={setWeightInput}
            keyboardType="decimal-pad"
          />

          <Input
            label="Número de microchip (opcional)"
            placeholder="Ej. 900000000000000"
            value={chipNumber}
            onChangeText={setChipNumber}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            label={submitLabel}
            onPress={handleSubmit}
            loading={saving}
            style={styles.modalButton}
          />
          <Button label="Cancelar" variant="outline" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  modalButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  errorText: {
    color: Colors.danger,
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
  photoPicker: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  photoPreview: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
  },
  photoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  photoPickerText: {
    marginTop: Spacing.xs,
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: "600",
  },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.text,
    fontSize: FontSize.sm,
  },
  chipTextSelected: {
    color: Colors.white,
    fontWeight: "600",
  },
});
