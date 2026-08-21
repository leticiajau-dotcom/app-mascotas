import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import Colors from "@/constants/Colors";
import { Radius, Shadow, Spacing } from "@/constants/Theme";

interface CardProps extends ViewProps {
  padded?: boolean;
}

export default function Card({ style, padded = true, children, ...rest }: CardProps) {
  return (
    <View style={[styles.card, padded && styles.padded, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    ...Shadow.card,
  },
  padded: {
    padding: Spacing.md,
  },
});
