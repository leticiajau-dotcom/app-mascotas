import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ChevronDown, PawPrint } from "lucide-react-native";
import Colors from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { Pet } from "@/types/pet";
import { calculateAge } from "@/utils/dateUtils";
import { SPECIES_LABELS, initials } from "@/utils/formatters";

interface PetHeaderProps {
  pet: Pet | null;
  onPress?: () => void;
}

export default function PetHeader({ pet, onPress }: PetHeaderProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.avatar}>
        {pet?.photoUrl ? (
          <Image source={{ uri: pet.photoUrl }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>
            {pet ? initials(pet.name) : <PawPrint size={20} color={Colors.white} />}
          </Text>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{pet ? pet.name : "Agrega una mascota"}</Text>
        <Text style={styles.subtitle}>
          {pet
            ? `${SPECIES_LABELS[pet.species]} · ${calculateAge(pet.birthDate)}`
            : "Toca para comenzar"}
        </Text>
      </View>

      {onPress ? <ChevronDown size={20} color={Colors.textMuted} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: "700",
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: "700",
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
