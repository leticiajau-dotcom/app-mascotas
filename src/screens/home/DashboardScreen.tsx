import React, { useMemo, useState } from "react";
import { FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CalendarClock, PawPrint, Plus } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import EventCard from "@/components/pet/EventCard";
import PetFormModal from "@/components/pet/PetFormModal";
import Colors from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { useAuth } from "@/context/AuthContext";
import { usePetContext } from "@/context/PetContext";
import { usePets } from "@/hooks/usePets";
import { useEvents } from "@/hooks/useEvents";
import { Pet } from "@/types/pet";
import { getSpeciesLabel, initials } from "@/utils/formatters";
import { calculateAge, formatDate, isToday } from "@/utils/dateUtils";
import { HomeStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<HomeStackParamList, "Dashboard">;

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

        <TouchableOpacity
          style={styles.misMascotasButton}
          onPress={() => setShowPetPicker(true)}
        >
          <PawPrint size={22} color={Colors.white} />
          <Text style={styles.misMascotasButtonText}>Mis mascotas</Text>
        </TouchableOpacity>

        {selectedPet ? (
          <View style={styles.currentPetRow}>
            <View style={styles.currentPetAvatar}>
              {selectedPet.photoUrl ? (
                <Image source={{ uri: selectedPet.photoUrl }} style={styles.currentPetAvatarImage} />
              ) : (
                <Text style={styles.currentPetAvatarText}>{initials(selectedPet.name)}</Text>
              )}
            </View>
            <Text style={styles.currentPetText}>
              {selectedPet.name} · {getSpeciesLabel(selectedPet)} ·{" "}
              {calculateAge(selectedPet.birthDate)}
            </Text>
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {pets.length > 0
                ? "No tenés mascotas activas. Reactivá alguna desde tu Perfil o agregá una nueva."
                : "Aún no tienes mascotas registradas. Tocá \"Mis mascotas\" para agregar la primera."}
            </Text>
            <Button
              label="Agregar mascota"
              onPress={() => setShowAddPet(true)}
              style={styles.emptyCardButton}
            />
          </Card>
        )}

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
        ) : null}
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
    </SafeAreaView>
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
  misMascotasButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  misMascotasButtonText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: FontSize.md,
  },
  currentPetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  currentPetAvatar: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  currentPetAvatarImage: {
    width: "100%",
    height: "100%",
  },
  currentPetAvatarText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  currentPetText: {
    color: Colors.textMuted,
    fontSize: FontSize.sm,
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
