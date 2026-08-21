import React, { useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FileDown } from "lucide-react-native";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import PetHeader from "@/components/pet/Header";
import EventCard from "@/components/pet/EventCard";
import Colors from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { usePets } from "@/hooks/usePets";
import { useEvents } from "@/hooks/useEvents";
import { exportMedicalHistoryToPdf } from "@/services/pdfService";
import { EVENT_CATEGORIES, EventCategory } from "@/types/event";
import { sortByDateDesc } from "@/utils/dateUtils";

const FILTERS: Array<{ label: string; value: EventCategory | "all" }> = [
  { label: "Todos", value: "all" },
  ...EVENT_CATEGORIES.map((category) => ({ label: category, value: category })),
];

export default function MedicalHistoryScreen() {
  const { selectedPet } = usePets();
  const { events, toggleEventComplete } = useEvents(selectedPet?.id);
  const [filter, setFilter] = useState<EventCategory | "all">("all");
  const [exporting, setExporting] = useState(false);

  const filteredEvents = useMemo(() => {
    const base = filter === "all" ? events : events.filter((event) => event.category === filter);
    return sortByDateDesc(base);
  }, [events, filter]);

  async function handleExport() {
    if (!selectedPet) return;
    setExporting(true);
    try {
      await exportMedicalHistoryToPdf(selectedPet, sortByDateDesc(events));
    } catch (error) {
      Alert.alert("Error", "No se pudo generar el PDF. Intenta nuevamente.");
    } finally {
      setExporting(false);
    }
  }

  if (!selectedPet) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.container}>
          <Text style={styles.emptyText}>
            Selecciona o agrega una mascota desde el inicio para ver su historial médico.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card>
          <PetHeader pet={selectedPet} />
        </Card>

        <View style={styles.exportRow}>
          <Text style={styles.sectionTitle}>Historial médico</Text>
          <Button
            label="Exportar PDF"
            icon={<FileDown size={16} color={Colors.white} />}
            onPress={handleExport}
            loading={exporting}
            fullWidth={false}
            style={styles.exportButton}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.chip, filter === option.value && styles.chipSelected]}
              onPress={() => setFilter(option.value)}
            >
              <Text style={[styles.chipText, filter === option.value && styles.chipTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredEvents.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>No hay eventos registrados en esta categoría.</Text>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onToggleComplete={() => toggleEventComplete(event.id)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  exportRow: {
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
  exportButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  filterScroll: {
    marginBottom: Spacing.sm,
  },
  filterRow: {
    gap: Spacing.xs,
    paddingRight: Spacing.md,
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
  emptyCard: {
    marginTop: Spacing.sm,
    alignItems: "center",
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: "center",
    fontSize: FontSize.sm,
  },
});
