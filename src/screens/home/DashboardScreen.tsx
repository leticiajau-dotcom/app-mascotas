import React, { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalendarClock, Camera, PawPrint, Plus } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import PetHeader from "@/components/pet/Header";
import EventCard from "@/components/pet/EventCard";
import Colors from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { useAuth } from "@/context/AuthContext";
import { usePetContext } from "@/context/PetContext";
import { usePets } from "@/hooks/usePets";
import { useEvents } from "@/hooks/useEvents";
import { pickImageFromLibrary } from "@/services/mediaService";
import { Pet, PetSpecies } from "@/types/pet";
import { SPECIES_LABELS, getSpeciesLabel, initials } from "@/utils/formatters";
import { calculateAge, formatDate, isToday, parseDateInput } from "@/utils/dateUtils";
import { HomeStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<HomeStackParamList, "Dashboard">;

const SPECIES_OPTIONS: PetSpecies[] = ["Dog", "Cat", "Other"];

export default function DashboardScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { displayName } = usePetContext();
  const { pets, activePets, selectedPet, selectedPetId, selectPet, addPet } = usePets();
  const { upcoming, toggleEventComplete } = useEvents(selectedPet?.id);
  const [showAddPet, setShowAddPet] = useState(false);
  const [showPetPicker, setShowPetPicker] = useState(false);

  const nextEvent = upcoming[0] ?? null;
  const todayEvents = useMemo(() => upcoming.filter((event) => isToday(event.date)), [upcoming]);
  const greetingName = displayName || user?.email || "";

  function openEvent(eventId?: string) {
    if (!selectedPet) return;
    navigation.navigate("AddEventModal", { petId: selectedPet.id, eventId });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.greeting}>
          Hola{greetingName ? `, ${greetingName}` : ""} 👋
        </Text>

        <Card>
          <PetHeader
            pet={selectedPet}
            onPress={activePets.length === 0 ? () => setShowAddPet(true) : undefined}
          />
        </Card>

        <TouchableOpacity style={styles.misMascotasButton} onPress={() => setShowPetPicker(true)}>
          <PawPrint size={16} color={Colors.primary} />
          <Text style={styles.misMascotasButtonText}>Mis mascotas</Text>
        </TouchableOpacity>

        {selectedPet ? (
          <>
            {/* Hero card: próximo vencimiento */}
            {nextEvent ? (
              <View style={styles.heroCard}>
                <TouchableOpacity
                  style={styles.heroTapArea}
                  activeOpacity={0.8}
                  onPress={() => openEvent(nextEvent.id)}
                >
                  <View style={styles.heroIconWrapper}>
                    <CalendarClock size={22} color={Colors.white} />
                  </View>
                  <View style={styles.heroContent}>
                    <Text style={styles.heroLabel}>PRÓXIMO VENCIMIENTO</Text>
                    <Text style={styles.heroTitle} numberOfLines={1}>
                      {nextEvent.title}
                    </Text>
                    <Text style={styles.heroMeta}>
                      {nextEvent.category} · {formatDate(nextEvent.date)}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.heroButton}
                  onPress={() => toggleEventComplete(nextEvent.id)}
                >
                  <Text style={styles.heroButtonText}>Marcar hecho</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  No hay eventos pendientes. ¡Agrega una vacuna, control o recordatorio!
                </Text>
              </Card>
            )}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Agenda de hoy</Text>
            </View>

            {todayEvents.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No tienes tareas programadas para hoy.</Text>
              </Card>
            ) : (
              todayEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onPress={() => openEvent(event.id)}
                  onToggleComplete={() => toggleEventComplete(event.id)}
                />
              ))
            )}
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {pets.length > 0
                ? "No tenés mascotas activas. Reactivá alguna desde tu Perfil o agregá una nueva."
                : "Aún no tienes mascotas registradas. Toca la tarjeta de arriba para agregar la primera."}
            </Text>
            <Button
              label="Agregar mascota"
              onPress={() => setShowAddPet(true)}
              style={styles.emptyCardButton}
            />
          </Card>
        )}
      </ScrollView>

      {selectedPet ? (
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => openEvent(undefined)}
        >
          <Plus size={26} color={Colors.white} />
        </TouchableOpacity>
      ) : null}

      <AddPetModal visible={showAddPet} onClose={() => setShowAddPet(false)} onSubmit={addPet} />

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
    </SafeAreaView>
  );
}

function AddPetModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: ReturnType<typeof usePets>["addPet"];
}) {
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<PetSpecies>("Dog");
  const [customSpecies, setCustomSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [birthDateInput, setBirthDateInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setName("");
    setBreed("");
    setSpecies("Dog");
    setCustomSpecies("");
    setBirthDateInput("");
    setWeightInput("");
    setPhotoUri(undefined);
    setError(null);
  }

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
    await onSubmit({
      name: name.trim(),
      species,
      customSpecies: species === "Other" ? customSpecies.trim() : undefined,
      breed: breed.trim() || undefined,
      birthDate,
      weight,
      photoUrl: photoUri,
    });
    resetForm();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Nueva mascota</Text>

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

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button label="Guardar" onPress={handleSubmit} style={styles.modalButton} />
          <Button
            label="Cancelar"
            variant="outline"
            onPress={() => {
              resetForm();
              onClose();
            }}
          />
        </View>
      </View>
    </Modal>
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
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Mis mascotas</Text>
          {pets.length === 0 ? (
            <Text style={styles.emptyText}>Todavía no tenés mascotas activas.</Text>
          ) : (
            <FlatList
              data={pets}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.petRow} onPress={() => onSelect(item.id)}>
                  <View style={styles.petRowAvatar}>
                    {item.photoUrl ? (
                      <Image source={{ uri: item.photoUrl }} style={styles.petRowAvatarImage} />
                    ) : (
                      <Text style={styles.petRowAvatarText}>{initials(item.name)}</Text>
                    )}
                  </View>
                  <View style={styles.petRowInfo}>
                    <Text style={styles.petRowText}>{item.name}</Text>
                    <Text style={styles.petRowSubtext}>
                      {getSpeciesLabel(item)}
                      {item.breed ? ` · ${item.breed}` : ""} · {calculateAge(item.birthDate)}
                    </Text>
                  </View>
                  {item.id === selectedPetId ? (
                    <View style={styles.petRowCurrentBadge}>
                      <Text style={styles.petRowCurrentBadgeText}>Actual</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              )}
            />
          )}
          <Button label="Agregar otra mascota" variant="outline" onPress={onAddNew} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  greeting: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  heroTapArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  heroIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: FontSize.xs,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: "700",
    marginTop: 2,
  },
  heroMeta: {
    color: "rgba(255,255,255,0.85)",
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  heroButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  heroButtonText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: FontSize.xs,
  },
  misMascotasButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: Spacing.xs,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
  misMascotasButtonText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: FontSize.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  emptyCard: {
    marginTop: Spacing.sm,
    alignItems: "center",
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: "center",
    fontSize: FontSize.sm,
  },
  emptyCardButton: {
    marginTop: Spacing.md,
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
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
  petRow: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  petRowAvatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  petRowAvatarImage: {
    width: "100%",
    height: "100%",
  },
  petRowAvatarText: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
  petRowInfo: {
    flex: 1,
  },
  petRowText: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
  },
  petRowSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  petRowCurrentBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  petRowCurrentBadgeText: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
});
