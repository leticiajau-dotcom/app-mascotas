import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  Bell,
  BellOff,
  Bug,
  CheckCircle2,
  Circle,
  LucideIcon,
  Pill,
  Scale,
  Scissors,
  Stethoscope,
  Syringe,
} from "lucide-react-native";
import Card from "@/components/common/Card";
import Colors from "@/constants/Colors";
import { FontSize, Radius, Spacing } from "@/constants/Theme";
import { EVENT_TYPE_LABELS, MedicalEvent, MedicalEventType } from "@/types/event";
import { formatDate, isOverdue } from "@/utils/dateUtils";

const ICONS: Record<MedicalEventType, LucideIcon> = {
  vaccine: Syringe,
  deworming: Bug,
  vet_visit: Stethoscope,
  medication: Pill,
  grooming: Scissors,
  weight: Scale,
  other: Circle,
};

interface EventCardProps {
  event: MedicalEvent;
  onPress?: () => void;
  onToggleComplete?: () => void;
}

export default function EventCard({ event, onPress, onToggleComplete }: EventCardProps) {
  const Icon = ICONS[event.type];
  const overdue = !event.completed && isOverdue(event.date);

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
            {EVENT_TYPE_LABELS[event.type]} · {formatDate(event.date)}
          </Text>
          {overdue ? <Text style={styles.overdueLabel}>Vencido</Text> : null}
        </View>

        <View style={styles.actions}>
          {event.reminderEnabled ? (
            <Bell size={16} color={Colors.secondary} />
          ) : (
            <BellOff size={16} color={Colors.textMuted} />
          )}
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
    backgroundColor: "#FFF1EC",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapperOverdue: {
    backgroundColor: "#FDE8E8",
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
  actions: {
    alignItems: "center",
    gap: Spacing.sm,
  },
});
