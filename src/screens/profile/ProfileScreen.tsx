import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut, ShieldAlert } from "lucide-react-native";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import PetHeader from "@/components/pet/Header";
import Colors from "@/constants/Colors";
import { FontSize, Spacing } from "@/constants/Theme";
import { useAuth } from "@/context/AuthContext";
import { usePetContext } from "@/context/PetContext";
import { usePets } from "@/hooks/usePets";
import { calculateAge, formatDateShort } from "@/utils/dateUtils";
import { SPECIES_LABELS, SEX_LABELS, formatWeight } from "@/utils/formatters";

/**
 * Perfil de la mascota + tarjeta de emergencia: datos que un cuidador
 * necesitaría en una urgencia (contacto del dueño, veterinario, alergias).
 */
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { selectedPet } = usePets();
  const { emergencyInfo, saveEmergencyInfo } = usePetContext();

  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [vetName, setVetName] = useState("");
  const [vetPhone, setVetPhone] = useState("");
  const [allergies, setAllergies] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!emergencyInfo) return;
    setOwnerName(emergencyInfo.ownerName);
    setOwnerPhone(emergencyInfo.ownerPhone);
    setVetName(emergencyInfo.vetName ?? "");
    setVetPhone(emergencyInfo.vetPhone ?? "");
    setAllergies(emergencyInfo.allergies ?? "");
  }, [emergencyInfo]);

  async function handleSaveEmergencyInfo() {
    if (!selectedPet) return;
    if (!ownerName.trim() || !ownerPhone.trim()) {
      Alert.alert("Datos incompletos", "El nombre y teléfono del dueño son obligatorios.");
      return;
    }

    setSaving(true);
    try {
      await saveEmergencyInfo({
        petId: selectedPet.id,
        ownerName: ownerName.trim(),
        ownerPhone: ownerPhone.trim(),
        vetName: vetName.trim() || undefined,
        vetPhone: vetPhone.trim() || undefined,
        allergies: allergies.trim() || undefined,
      });
      Alert.alert("Guardado", "La información de emergencia se actualizó correctamente.");
    } finally {
      setSaving(false);
    }
  }

  function handleSignOut() {
    Alert.alert("Cerrar sesión", "¿Seguro que deseas salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: signOut },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Perfil</Text>

        <Card style={styles.card}>
          <Text style={styles.cardLabel}>Cuenta</Text>
          <Text style={styles.accountEmail}>{user?.email ?? "Invitado"}</Text>
        </Card>

        {selectedPet ? (
          <Card style={styles.card}>
            <PetHeader pet={selectedPet} />
            <View style={styles.petDetailsGrid}>
              <DetailItem label="Especie" value={SPECIES_LABELS[selectedPet.species]} />
              <DetailItem label="Sexo" value={SEX_LABELS[selectedPet.sex]} />
              <DetailItem label="Edad" value={calculateAge(selectedPet.birthDate)} />
              <DetailItem label="Peso" value={formatWeight(selectedPet.weightKg)} />
              <DetailItem label="Nacimiento" value={formatDateShort(selectedPet.birthDate)} />
              <DetailItem label="Raza" value={selectedPet.breed ?? "-"} />
            </View>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Text style={styles.emptyText}>Agrega una mascota desde el inicio para ver su perfil.</Text>
          </Card>
        )}

        {selectedPet ? (
          <Card style={styles.card}>
            <View style={styles.emergencyHeader}>
              <ShieldAlert size={20} color={Colors.danger} />
              <Text style={styles.cardLabel}>Información de emergencia</Text>
            </View>

            <Input label="Nombre del dueño" value={ownerName} onChangeText={setOwnerName} />
            <Input
              label="Teléfono del dueño"
              value={ownerPhone}
              onChangeText={setOwnerPhone}
              keyboardType="phone-pad"
            />
            <Input label="Veterinario / Clínica" value={vetName} onChangeText={setVetName} />
            <Input
              label="Teléfono del veterinario"
              value={vetPhone}
              onChangeText={setVetPhone}
              keyboardType="phone-pad"
            />
            <Input
              label="Alergias / condiciones"
              value={allergies}
              onChangeText={setAllergies}
              multiline
              numberOfLines={3}
              style={styles.notesInput}
            />

            <Button
              label="Guardar información de emergencia"
              onPress={handleSaveEmergencyInfo}
              loading={saving}
            />
          </Card>
        ) : null}

        <Button
          label="Cerrar sesión"
          variant="outline"
          icon={<LogOut size={18} color={Colors.primary} />}
          onPress={handleSignOut}
          style={styles.signOutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  card: { marginBottom: Spacing.md },
  cardLabel: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    color: Colors.textMuted,
    textTransform: "uppercase",
  },
  accountEmail: {
    fontSize: FontSize.md,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  petDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  detailItem: { minWidth: "40%" },
  detailLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: "uppercase",
  },
  detailValue: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 2,
  },
  emergencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  notesInput: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  signOutButton: {
    marginTop: Spacing.sm,
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: "center",
  },
});
