import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Plus, Trash2, X } from "lucide-react-native";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import PetHeader from "@/components/pet/Header";
import EventCard from "@/components/pet/EventCard";
import Colors from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { usePets } from "@/hooks/usePets";
import { useEvents } from "@/hooks/useEvents";
import { usePetContext } from "@/context/PetContext";
import { exportMedicalHistoryPDF } from "@/services/pdfService";
import { StudyPhoto } from "@/types/pet";
import { sortByDateDesc } from "@/utils/dateUtils";

type SectionKey = "vaccines" | "visits" | "gallery";

const SECTIONS: Array<{ key: SectionKey; label: string }> = [
  { key: "vaccines", label: "Vacunas" },
  { key: "visits", label: "Visitas Médicas" },
  { key: "gallery", label: "Galería de Estudios" },
];

export default function MedicalHistoryScreen() {
  const { selectedPet } = usePets();
  const { events, toggleEventComplete } = useEvents(selectedPet?.id);
  const { studiesForPet, addStudyPhoto, deleteStudyPhoto } = usePetContext();
  const [section, setSection] = useState<SectionKey>("vaccines");
  const [exporting, setExporting] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const vaccineEvents = useMemo(
    () => sortByDateDesc(events.filter((event) => event.category === "Vacuna")),
    [events]
  );
  const visitEvents = useMemo(
    () => sortByDateDesc(events.filter((event) => event.category !== "Vacuna")),
    [events]
  );
  const studies = selectedPet ? studiesForPet(selectedPet.id) : [];

  async function handleExport() {
    if (!selectedPet) return;
    setExporting(true);
    try {
      await exportMedicalHistoryPDF(selectedPet, sortByDateDesc(events));
    } catch (error) {
      Alert.alert("Error", "No se pudo generar el PDF. Intenta nuevamente.");
    } finally {
      setExporting(false);
    }
  }

  async function handleAddStudyPhoto() {
    if (!selectedPet) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permiso requerido",
        "Necesitamos acceso a tus fotos para agregar un estudio a la galería."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]) return;

    await addStudyPhoto({
      petId: selectedPet.id,
      uri: result.assets[0].uri,
      date: new Date().toISOString(),
    });
  }

  function handleDeleteStudyPhoto(study: StudyPhoto) {
    Alert.alert("Eliminar estudio", "¿Seguro que deseas eliminar esta foto?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => deleteStudyPhoto(study.id) },
    ]);
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
            label="📄 Exportar Ficha PDF"
            onPress={handleExport}
            loading={exporting}
            fullWidth={false}
            style={styles.exportButton}
          />
        </View>

        <View style={styles.tabsRow}>
          {SECTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[styles.tab, section === option.key && styles.tabSelected]}
              onPress={() => setSection(option.key)}
            >
              <Text style={[styles.tabText, section === option.key && styles.tabTextSelected]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {section === "vaccines" ? (
          vaccineEvents.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No hay vacunas registradas.</Text>
            </Card>
          ) : (
            vaccineEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onToggleComplete={() => toggleEventComplete(event.id)}
              />
            ))
          )
        ) : null}

        {section === "visits" ? (
          visitEvents.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>No hay visitas médicas registradas.</Text>
            </Card>
          ) : (
            visitEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onToggleComplete={() => toggleEventComplete(event.id)}
              />
            ))
          )
        ) : null}

        {section === "gallery" ? (
          <>
            <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddStudyPhoto}>
              <Plus size={18} color={Colors.primary} />
              <Text style={styles.addPhotoButtonText}>Agregar estudio</Text>
            </TouchableOpacity>

            {studies.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  Aún no agregaste radiografías, análisis u otros estudios de tu mascota.
                </Text>
              </Card>
            ) : (
              <View style={styles.galleryGrid}>
                {studies.map((study) => (
                  <View key={study.id} style={styles.galleryItem}>
                    <TouchableOpacity onPress={() => setPreviewUri(study.uri)}>
                      <Image source={{ uri: study.uri }} style={styles.galleryImage} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.galleryDeleteButton}
                      onPress={() => handleDeleteStudyPhoto(study)}
                      hitSlop={8}
                    >
                      <Trash2 size={14} color={Colors.white} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>

      <Modal visible={!!previewUri} transparent animationType="fade">
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={styles.previewCloseButton}
            onPress={() => setPreviewUri(null)}
            hitSlop={8}
          >
            <X size={22} color={Colors.white} />
          </TouchableOpacity>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  exportRow: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  exportButton: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  tabsRow: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: 4,
    marginBottom: Spacing.md,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    alignItems: "center",
  },
  tabSelected: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    color: Colors.textMuted,
    textAlign: "center",
  },
  tabTextSelected: {
    color: Colors.white,
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
  addPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: "dashed",
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  addPhotoButtonText: {
    color: Colors.primary,
    fontWeight: "600",
    fontSize: FontSize.sm,
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  galleryItem: {
    width: "31%",
    aspectRatio: 1,
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  galleryDeleteButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderRadius: Radius.full,
    padding: 4,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewCloseButton: {
    position: "absolute",
    top: 56,
    right: Spacing.lg,
    zIndex: 1,
  },
  previewImage: {
    width: "100%",
    height: "80%",
  },
});
