import { Pressable, StyleSheet, Text } from "react-native";

import { colors, fonts, fontSizes, radii, spacing } from "@/styles/theme";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

// Filtros do Zeus (GP, Marketing...): azul quando ativo, contorno quando inativo.
export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Filtrar por ${label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.selected, pressed && styles.pressed]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.secondary,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  selected: { backgroundColor: colors.secondary },
  pressed: { opacity: 0.8 },
  text: { fontFamily: fonts.bold, fontSize: fontSizes.paragraph, color: colors.secondary },
  textSelected: { color: colors.white },
});
