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
import { pickImageFromLibrary } from "@/services/mediaService";
import { Pet } from "@/types/pet";
import { calculateAge, formatDateShort } from "@/utils/dateUtils";
import { getSpeciesLabel, formatWeight } from "@/utils/formatters";

/**
 * Perfil: datos de la cuenta, ficha de cada mascota (con alta/baja) y la
 * tarjeta de emergencia de la mascota seleccionada, con accesos directos
 * de llamada rápida.
 */
export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { selectedPet, selectedPetId } = usePets();
  const {
    pets,
    emergencyInfo,
    saveEmergencyInfo,
    selectPet,
    setPetActive,
    updatePet,
    displayName,
    saveDisplayName,
  } = usePetContext();

  const [nameInput, setNameInput] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [vetName, setVetName] = useState("");
  const [vetPhone, setVetPhone] = useState("");
  const [emergencyClinicName, setEmergencyClinicName] = useState("");
  const [emergencyClinicPhone, setEmergencyClinicPhone] = useState("");
  const [allergies, setAllergies] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNameInput(displayName ?? "");
  }, [displayName]);

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

  async function handleSaveName() {
    setSavingName(true);
    try {
      await saveDisplayName(nameInput);
    } finally {
      setSavingName(false);
    }
  }

  // Mascotas activas primero, luego las dadas de baja.
  const sortedPets = [...pets].sort((a, b) => Number(b.active) - Number(a.active));

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

  async function handleChangePhoto(pet: Pet) {
    const result = await pickImageFromLibrary();
    if (result.status === "denied") {
      Alert.alert(
        "Permiso requerido",
        "Necesitamos acceso a tus fotos para elegir la imagen de tu mascota."
      );
      return;
    }
    if (result.status === "canceled") return;
    await updatePet(pet.id, { photoUrl: result.file.uri });
  }

  function handleDeactivate(pet: Pet) {
    Alert.alert(
      "Dar de baja",
      `¿Seguro que deseas dar de baja a ${pet.name}? Se conserva todo su historial médico, pero dejará de aparecer como mascota activa.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Dar de baja", style: "destructive", onPress: () => setPetActive(pet.id, false) },
      ]
    );
  }

  function callNumber(phone: string) {
    Linking.openURL(`tel:${phone}`);
  }

  const hasQuickCall = !!(emergencyInfo?.emergencyClinicPhone || emergencyInfo?.vetPhone);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Perfil</Text>

        <Text style={styles.sectionTitle}>Usuario</Text>
        <Card style={styles.card}>
          <Text style={styles.cardLabel}>Cuenta</Text>
          <Text style={styles.accountEmail}>{user?.email ?? "Invitado"}</Text>

          <Input
            label="Nombre (opcional)"
            placeholder="Ej. María"
            value={nameInput}
            onChangeText={setNameInput}
          />
          <Button
            label="Guardar nombre"
            variant="outline"
            onPress={handleSaveName}
            loading={savingName}
            style={styles.saveNameButton}
          />

          <Button
            label="Cerrar sesión"
            variant="outline"
            icon={<LogOut size={18} color={Colors.primary} />}
            onPress={handleSignOut}
            style={styles.signOutButton}
          />
        </Card>

        <Text style={styles.sectionTitle}>Mascotas</Text>
        {sortedPets.length === 0 ? (
          <Card style={styles.card}>
            <Text style={styles.emptyText}>
              Agrega una mascota desde el inicio para ver su ficha acá.
            </Text>
          </Card>
        ) : (
          sortedPets.map((pet) => (
            <Card key={pet.id} style={styles.card}>
              <View style={styles.petCardHeader}>
                <View style={styles.petHeaderFlex}>
                  <PetHeader pet={pet} />
                </View>
                {pet.id === selectedPetId ? (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Actual</Text>
                  </View>
                ) : null}
              </View>

              {!pet.active ? (
                <View style={styles.inactiveBadge}>
                  <Text style={styles.inactiveBadgeText}>Dada de baja</Text>
                </View>
              ) : null}

              <View style={styles.petDetailsGrid}>
                <DetailItem label="Especie" value={getSpeciesLabel(pet)} />
                <DetailItem label="Edad" value={calculateAge(pet.birthDate)} />
                <DetailItem label="Peso" value={formatWeight(pet.weight)} />
                <DetailItem label="Nacimiento" value={formatDateShort(pet.birthDate)} />
                <DetailItem label="Raza" value={pet.breed ?? "-"} />
                <DetailItem label="Microchip" value={pet.chipNumber ?? "-"} />
              </View>

              <View style={styles.petActionsRow}>
                <Button
                  label="Cambiar foto"
                  variant="outline"
                  fullWidth={false}
                  onPress={() => handleChangePhoto(pet)}
                  style={styles.petActionButton}
                />
                {pet.active && pet.id !== selectedPetId ? (
                  <Button
                    label="Seleccionar"
                    variant="outline"
                    fullWidth={false}
                    onPress={() => selectPet(pet.id)}
                    style={styles.petActionButton}
                  />
                ) : null}
                {pet.active ? (
                  <Button
                    label="Dar de baja"
                    variant="danger"
                    fullWidth={false}
                    onPress={() => handleDeactivate(pet)}
                    style={styles.petActionButton}
                  />
                ) : (
                  <Button
                    label="Reactivar"
                    variant="outline"
                    fullWidth={false}
                    onPress={() => setPetActive(pet.id, true)}
                    style={styles.petActionButton}
                  />
                )}
              </View>
            </Card>
          ))
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
              <View>
                <Text style={styles.cardLabel}>Información de emergencia</Text>
                <Text style={styles.emergencySubtitle}>Mascota: {selectedPet.name}</Text>
              </View>
            </View>

            <Input label="Nombre del dueño" value={ownerName} onChangeText={setOwnerName} />
            <Input
              label="Teléfono del dueño"
              value={ownerPhone}
              onChangeText={setOwnerPhone}
              keyboardType="phone-pad"
            />
            <Input label="Veterinario de cabecera" value={vetName} onChangeText={setVetName} />
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
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
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
    marginBottom: Spacing.md,
  },
  petCardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  petHeaderFlex: {
    flex: 1,
  },
  currentBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  currentBadgeText: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  inactiveBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.dangerLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
  },
  inactiveBadgeText: {
    color: Colors.danger,
    fontSize: FontSize.xs,
    fontWeight: "700",
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
  petActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  petActionButton: {
    paddingHorizontal: Spacing.md,
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
  emergencySubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  notesInput: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  saveNameButton: {
    marginBottom: Spacing.md,
  },
  signOutButton: {
    marginTop: Spacing.md,
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: "center",
  },
});
