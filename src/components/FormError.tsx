import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, fontSizes, radii, spacing } from "@/styles/theme";

// Mensagem de erro em destaque no topo de formulários.
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.box} accessibilityRole="alert" accessibilityLiveRegion="assertive">
      <Ionicons name="alert-circle" size={20} color={colors.danger} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.dangerLight,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  text: { flex: 1, fontFamily: fonts.semiBold, fontSize: fontSizes.paragraph, color: colors.danger },
});
