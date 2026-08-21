import React, { useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Plus } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import PetHeader from "@/components/pet/Header";
import EventCard from "@/components/pet/EventCard";
import Colors from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { usePets } from "@/hooks/usePets";
import { useEvents } from "@/hooks/useEvents";
import { PetSpecies } from "@/types/pet";
import { SPECIES_LABELS } from "@/utils/formatters";
import { HomeStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<HomeStackParamList, "Dashboard">;

const SPECIES_OPTIONS: PetSpecies[] = ["Dog", "Cat", "Other"];

export default function DashboardScreen({ navigation }: Props) {
  const { pets, selectedPet, selectPet, addPet } = usePets();
  const { upcoming, toggleEventComplete } = useEvents(selectedPet?.id);
  const [showAddPet, setShowAddPet] = useState(false);
  const [showPetPicker, setShowPetPicker] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.greeting}>Hola 👋</Text>

        <Card>
          <PetHeader
            pet={selectedPet}
            onPress={pets.length > 0 ? () => setShowPetPicker(true) : () => setShowAddPet(true)}
          />
        </Card>

        {selectedPet ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Próximos eventos</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate("AddEventModal", { petId: selectedPet.id })}
              >
                <Plus size={16} color={Colors.white} />
                <Text style={styles.addButtonText}>Nuevo</Text>
              </TouchableOpacity>
            </View>

            {upcoming.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  No hay eventos pendientes. ¡Agrega una vacuna, control o recordatorio!
                </Text>
              </Card>
            ) : (
              upcoming.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onPress={() =>
                    navigation.navigate("AddEventModal", {
                      petId: selectedPet.id,
                      eventId: event.id,
                    })
                  }
                  onToggleComplete={() => toggleEventComplete(event.id)}
                />
              ))
            )}
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Aún no tienes mascotas registradas. Toca la tarjeta de arriba para agregar la
              primera.
            </Text>
            <Button
              label="Agregar mascota"
              onPress={() => setShowAddPet(true)}
              style={styles.emptyCardButton}
            />
          </Card>
        )}
      </ScrollView>

      <AddPetModal visible={showAddPet} onClose={() => setShowAddPet(false)} onSubmit={addPet} />

      <PetPickerModal
        visible={showPetPicker}
        pets={pets}
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
  const [breed, setBreed] = useState("");

  async function handleSubmit() {
    if (!name.trim()) return;
    await onSubmit({
      name: name.trim(),
      species,
      breed: breed.trim() || undefined,
    });
    setName("");
    setBreed("");
    setSpecies("Dog");
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Nueva mascota</Text>
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

          <Button label="Guardar" onPress={handleSubmit} style={styles.modalButton} />
          <Button label="Cancelar" variant="outline" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function PetPickerModal({
  visible,
  pets,
  onSelect,
  onAddNew,
  onClose,
}: {
  visible: boolean;
  pets: ReturnType<typeof usePets>["pets"];
  onSelect: (id: string) => void;
  onAddNew: () => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Tus mascotas</Text>
          <FlatList
            data={pets}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.petRow} onPress={() => onSelect(item.id)}>
                <Text style={styles.petRowText}>{item.name}</Text>
                <Text style={styles.petRowSubtext}>{SPECIES_LABELS[item.species]}</Text>
              </TouchableOpacity>
            )}
          />
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  addButtonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: FontSize.sm,
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
    justifyContent: "space-between",
  },
  petRowText: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
  },
  petRowSubtext: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
});
