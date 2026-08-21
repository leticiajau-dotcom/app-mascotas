import React, { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut, Phone, ShieldAlert } from "lucide-react-native";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import Input from "@/components/common/Input";
import PetHeader from "@/components/pet/Header";
import Colors from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { useAuth } from "@/context/AuthContext";
import { usePetContext } from "@/context/PetContext";
import { usePets } from "@/hooks/usePets";
import { calculateAge, formatDateShort } from "@/utils/dateUtils";
import { SPECIES_LABELS, formatWeight } from "@/utils/formatters";

/**
 * Perfil de la mascota + tarjeta de emergencia: datos que un cuidador
 * necesitaría en una urgencia (contacto del dueño, veterinario, alergias)
 * y accesos directos de llamada rápida.
 */
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { selectedPet } = usePets();
  const { emergencyInfo, saveEmergencyInfo } = usePetContext();

  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [vetName, setVetName] = useState("");
  const [vetPhone, setVetPhone] = useState("");
  const [emergencyClinicName, setEmergencyClinicName] = useState("");
  const [emergencyClinicPhone, setEmergencyClinicPhone] = useState("");
  const [allergies, setAllergies] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!emergencyInfo) return;
    setOwnerName(emergencyInfo.ownerName);
    setOwnerPhone(emergencyInfo.ownerPhone);
    setVetName(emergencyInfo.vetName ?? "");
    setVetPhone(emergencyInfo.vetPhone ?? "");
    setEmergencyClinicName(emergencyInfo.emergencyClinicName ?? "");
    setEmergencyClinicPhone(emergencyInfo.emergencyClinicPhone ?? "");
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
        emergencyClinicName: emergencyClinicName.trim() || undefined,
        emergencyClinicPhone: emergencyClinicPhone.trim() || undefined,
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

  function callNumber(phone: string) {
    Linking.openURL(`tel:${phone}`);
  }

  const hasQuickCall = !!(emergencyInfo?.emergencyClinicPhone || emergencyInfo?.vetPhone);

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
              <DetailItem label="Edad" value={calculateAge(selectedPet.birthDate)} />
              <DetailItem label="Peso" value={formatWeight(selectedPet.weight)} />
              <DetailItem label="Nacimiento" value={formatDateShort(selectedPet.birthDate)} />
              <DetailItem label="Raza" value={selectedPet.breed ?? "-"} />
              <DetailItem label="Microchip" value={selectedPet.chipNumber ?? "-"} />
            </View>
          </Card>
        ) : (
          <Card style={styles.card}>
            <Text style={styles.emptyText}>Agrega una mascota desde el inicio para ver su perfil.</Text>
          </Card>
        )}

        {selectedPet && hasQuickCall ? (
          <Card style={styles.card}>
            <Text style={styles.cardLabel}>Llamada rápida</Text>
            <View style={styles.quickCallRow}>
              {emergencyInfo?.emergencyClinicPhone ? (
                <TouchableOpacity
                  style={[styles.quickCallButton, styles.quickCallButtonDanger]}
                  onPress={() => callNumber(emergencyInfo.emergencyClinicPhone as string)}
                >
                  <Phone size={16} color={Colors.white} />
                  <Text style={styles.quickCallButtonText}>
                    {emergencyInfo.emergencyClinicName || "Clínica 24h"}
                  </Text>
                </TouchableOpacity>
              ) : null}
              {emergencyInfo?.vetPhone ? (
                <TouchableOpacity
                  style={styles.quickCallButton}
                  onPress={() => callNumber(emergencyInfo.vetPhone as string)}
                >
                  <Phone size={16} color={Colors.white} />
                  <Text style={styles.quickCallButtonText}>
                    {emergencyInfo.vetName || "Veterinario"}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </Card>
        ) : null}

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
            <Input
              label="Veterinario de cabecera"
              value={vetName}
              onChangeText={setVetName}
            />
            <Input
              label="Teléfono del veterinario"
              value={vetPhone}
              onChangeText={setVetPhone}
              keyboardType="phone-pad"
            />
            <Input
              label="Clínica de urgencia 24h"
              value={emergencyClinicName}
              onChangeText={setEmergencyClinicName}
            />
            <Input
              label="Teléfono de la clínica 24h"
              value={emergencyClinicPhone}
              onChangeText={setEmergencyClinicPhone}
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
  quickCallRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  quickCallButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  quickCallButtonDanger: {
    backgroundColor: Colors.danger,
  },
  quickCallButtonText: {
    color: Colors.white,
    fontWeight: "700",
    fontSize: FontSize.sm,
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
