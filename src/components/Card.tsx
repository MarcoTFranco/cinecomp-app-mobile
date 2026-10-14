import { StyleSheet, View, type ViewProps } from "react-native";

import { useResponsive } from "@/hooks/useResponsive";
import { colors, radii, shadows, spacing } from "@/styles/theme";

// Cartão branco arredondado com sombra, base de todos os blocos do Zeus.
export function Card({ style, ...props }: ViewProps) {
  const { isTablet } = useResponsive();
  return (
    <View
      style={[styles.card, { borderRadius: isTablet ? radii.xl : radii.lg }, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    ...shadows.card,
  },
});
