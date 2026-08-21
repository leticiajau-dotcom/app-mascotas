import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Colors from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { useEvents } from "@/hooks/useEvents";
import { EVENT_CATEGORIES, EventCategory } from "@/types/event";
import { HomeStackParamList } from "@/types/navigation";

type Props = NativeStackScreenProps<HomeStackParamList, "AddEventModal">;

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

function parseDateInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime()) ? null : date;
}

function isValidTime(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value.trim());
}

const REMINDER_OFFSETS = [
  { label: "Mismo día", days: 0 },
  { label: "3 días antes", days: 3 },
];

export default function AddEventModal({ route, navigation }: Props) {
  const petId = route.params?.petId;
  const eventId = route.params?.eventId;

  const { events, addEvent, updateEvent, deleteEvent } = useEvents(petId);
  const existingEvent = useMemo(
    () => events.find((event) => event.id === eventId),
    [events, eventId]
  );

  const [category, setCategory] = useState<EventCategory>("Vacuna");
  const [title, setTitle] = useState("");
  const [dateInput, setDateInput] = useState(toDateInputValue(new Date().toISOString()));
  const [time, setTime] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [reminderOffsetDays, setReminderOffsetDays] = useState(REMINDER_OFFSETS[0].days);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existingEvent) return;
    setCategory(existingEvent.category);
    setTitle(existingEvent.title);
    setDateInput(toDateInputValue(existingEvent.date));
    setTime(existingEvent.time ?? "");
    setAffiliateUrl(existingEvent.affiliateUrl ?? "");
  }, [existingEvent]);

  async function handleSave() {
    if (!petId) return;

    const eventDate = parseDateInput(dateInput);
    if (!title.trim() || !eventDate) {
      Alert.alert("Datos incompletos", "Ingresa un título y una fecha válida (AAAA-MM-DD).");
      return;
    }

    if (time.trim() && !isValidTime(time)) {
      Alert.alert("Hora inválida", "Ingresa la hora en formato HH:MM (24 horas).");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        petId,
        category,
        title: title.trim(),
        date: eventDate.toISOString(),
        time: time.trim() || undefined,
        completed: existingEvent?.completed ?? false,
        affiliateUrl: affiliateUrl.trim() || undefined,
      };

      if (existingEvent) {
        await updateEvent(existingEvent.id, payload, reminderOffsetDays);
      } else {
        await addEvent(payload, reminderOffsetDays);
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

        <Text style={styles.fieldLabel}>Categoría</Text>
        <View style={styles.chipsRow}>
          {EVENT_CATEGORIES.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.chip, category === option && styles.chipSelected]}
              onPress={() => setCategory(option)}
            >
              <Text style={[styles.chipText, category === option && styles.chipTextSelected]}>
                {option}
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
          label="Hora (opcional, HH:MM)"
          placeholder="14:30"
          value={time}
          onChangeText={setTime}
          keyboardType="numbers-and-punctuation"
        />

        <Input
          label="Link de compra (opcional)"
          placeholder="https://tutienda.com/producto"
          value={affiliateUrl}
          onChangeText={setAffiliateUrl}
          autoCapitalize="none"
          keyboardType="url"
        />

        <Text style={styles.fieldLabel}>Avisarme</Text>
        <View style={styles.chipsRow}>
          {REMINDER_OFFSETS.map((option) => (
            <TouchableOpacity
              key={option.days}
              style={[styles.chip, reminderOffsetDays === option.days && styles.chipSelected]}
              onPress={() => setReminderOffsetDays(option.days)}
            >
              <Text
                style={[
                  styles.chipText,
                  reminderOffsetDays === option.days && styles.chipTextSelected,
                ]}
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
