import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Colors from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { useEvents } from "@/hooks/useEvents";
import { EVENT_TYPE_LABELS, MedicalEventType } from "@/types/event";
import { HomeStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<HomeStackParamList, "AddEventModal">;

const EVENT_TYPES = Object.keys(EVENT_TYPE_LABELS) as MedicalEventType[];

const REMINDER_OFFSETS = [
  { label: "El mismo día", days: 0 },
  { label: "1 día antes", days: 1 },
  { label: "3 días antes", days: 3 },
  { label: "1 semana antes", days: 7 },
];

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day), 9, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

export default function AddEventModal({ route, navigation }: Props) {
  const petId = route.params?.petId;
  const eventId = route.params?.eventId;

  const { events, addEvent, updateEvent, deleteEvent } = useEvents(petId);
  const existingEvent = useMemo(
    () => events.find((event) => event.id === eventId),
    [events, eventId]
  );

  const [type, setType] = useState<MedicalEventType>("vaccine");
  const [title, setTitle] = useState("");
  const [dateInput, setDateInput] = useState(toDateInputValue(new Date().toISOString()));
  const [notes, setNotes] = useState("");
  const [reminderDays, setReminderDays] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existingEvent) return;
    setType(existingEvent.type);
    setTitle(existingEvent.title);
    setDateInput(toDateInputValue(existingEvent.date));
    setNotes(existingEvent.notes ?? "");

    if (existingEvent.reminderEnabled && existingEvent.reminderDate) {
      const diffMs = new Date(existingEvent.date).getTime() - new Date(existingEvent.reminderDate).getTime();
      setReminderDays(Math.round(diffMs / (24 * 60 * 60 * 1000)));
    }
  }, [existingEvent]);

  async function handleSave() {
    if (!petId) return;

    const eventDate = parseDateInput(dateInput);
    if (!title.trim() || !eventDate) {
      Alert.alert("Datos incompletos", "Ingresa un título y una fecha válida (AAAA-MM-DD).");
      return;
    }

    const reminderEnabled = reminderDays !== null;
    const reminderDate = reminderEnabled
      ? new Date(eventDate.getTime() - (reminderDays as number) * 24 * 60 * 60 * 1000).toISOString()
      : undefined;

    setSaving(true);
    try {
      if (existingEvent) {
        await updateEvent(existingEvent.id, {
          petId,
          type,
          title: title.trim(),
          date: eventDate.toISOString(),
          notes: notes.trim() || undefined,
          reminderEnabled,
          reminderDate,
          completed: existingEvent.completed,
        });
      } else {
        await addEvent({
          petId,
          type,
          title: title.trim(),
          date: eventDate.toISOString(),
          notes: notes.trim() || undefined,
          reminderEnabled,
          reminderDate,
          completed: false,
        });
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!existingEvent) return;
    Alert.alert("Eliminar evento", "¿Seguro que deseas eliminarlo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteEvent(existingEvent.id);
          navigation.goBack();
        },
      },
    ]);
  }

  if (!petId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.emptyText}>No se seleccionó ninguna mascota.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{existingEvent ? "Editar evento" : "Nuevo evento"}</Text>

        <Text style={styles.fieldLabel}>Tipo de evento</Text>
        <View style={styles.chipsRow}>
          {EVENT_TYPES.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.chip, type === option && styles.chipSelected]}
              onPress={() => setType(option)}
            >
              <Text style={[styles.chipText, type === option && styles.chipTextSelected]}>
                {EVENT_TYPE_LABELS[option]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Título"
          placeholder="Ej. Vacuna antirrábica"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          label="Fecha (AAAA-MM-DD)"
          placeholder="2026-09-15"
          value={dateInput}
          onChangeText={setDateInput}
          keyboardType="numbers-and-punctuation"
        />

        <Input
          label="Notas (opcional)"
          placeholder="Detalles adicionales, dosis, veterinario, etc."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          style={styles.notesInput}
        />

        <Text style={styles.fieldLabel}>Recordatorio</Text>
        <View style={styles.chipsRow}>
          <TouchableOpacity
            style={[styles.chip, reminderDays === null && styles.chipSelected]}
            onPress={() => setReminderDays(null)}
          >
            <Text style={[styles.chipText, reminderDays === null && styles.chipTextSelected]}>
              Sin recordatorio
            </Text>
          </TouchableOpacity>
          {REMINDER_OFFSETS.map((option) => (
            <TouchableOpacity
              key={option.days}
              style={[styles.chip, reminderDays === option.days && styles.chipSelected]}
              onPress={() => setReminderDays(option.days)}
            >
              <Text
                style={[styles.chipText, reminderDays === option.days && styles.chipTextSelected]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          label={existingEvent ? "Guardar cambios" : "Crear evento"}
          onPress={handleSave}
          loading={saving}
          style={styles.saveButton}
        />

        {existingEvent ? (
          <Button label="Eliminar evento" variant="danger" onPress={handleDelete} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.lg,
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
  notesInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  saveButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
    marginTop: Spacing.xl,
    color: Colors.textMuted,
  },
});
