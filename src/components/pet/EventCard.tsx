import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  Bug,
  CheckCircle2,
  Circle,
  LucideIcon,
  Pill,
  Repeat,
  ShoppingBag,
  Stethoscope,
  Syringe,
} from "lucide-react-native";
import Card from "@/components/common/Card";
import Colors from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { EventCategory, MedicalEvent } from "@/types/event";
import { formatDate, isOverdue } from "@/utils/dateUtils";
import { formatRepeatInterval } from "@/utils/formatters";

const ICONS: Record<EventCategory, LucideIcon> = {
  Vacuna: Syringe,
  Desparasitante: Bug,
  Medicamento: Pill,
  "Turno Médico": Stethoscope,
};

interface EventCardProps {
  event: MedicalEvent;
  onPress?: () => void;
  onToggleComplete?: () => void;
}

export default function EventCard({ event, onPress, onToggleComplete }: EventCardProps) {
  const Icon = ICONS[event.category];
  const overdue = !event.completed && isOverdue(event.date);
  const repeatLabel = formatRepeatInterval(event.repeatIntervalDays);

  function handleOpenAffiliateLink() {
    if (event.affiliateUrl) Linking.openURL(event.affiliateUrl);
  }

  return (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
      <Card style={styles.card}>
        <View style={[styles.iconWrapper, overdue && styles.iconWrapperOverdue]}>
          <Icon size={20} color={overdue ? Colors.danger : Colors.primary} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={styles.meta}>
            {event.category} · {formatDate(event.date)}
            {event.time ? ` · ${event.time}` : ""}
          </Text>
          {overdue ? <Text style={styles.overdueLabel}>Vencido</Text> : null}
          {repeatLabel ? (
            <View style={styles.repeatRow}>
              <Repeat size={11} color={Colors.textMuted} />
              <Text style={styles.repeatLabel}>{repeatLabel}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          {event.affiliateUrl ? (
            <TouchableOpacity onPress={handleOpenAffiliateLink} hitSlop={8}>
              <ShoppingBag size={18} color={Colors.secondary} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={onToggleComplete} hitSlop={8}>
            {event.completed ? (
              <CheckCircle2 size={22} color={Colors.success} />
            ) : (
              <Circle size={22} color={Colors.border} />
            )}
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperOverdue: {
    backgroundColor: Colors.dangerLight,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: "600",
    color: Colors.text,
  },
  meta: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  overdueLabel: {
    fontSize: FontSize.xs,
    color: Colors.danger,
    fontWeight: "700",
    marginTop: 2,
  },
  repeatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  repeatLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  actions: {
    alignItems: "center",
    gap: Spacing.sm,
  },
});
