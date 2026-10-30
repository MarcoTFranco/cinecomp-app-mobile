import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors, fonts, fontSizes, spacing } from "@/styles/theme";

import { Card } from "./Card";

interface StatCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// Cartões de totais da página inicial do Zeus ("Total de membros: 30").
export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Card style={styles.card} accessible accessibilityLabel={`${label}: ${value}`}>
      <View style={styles.header}>
        <Ionicons name={icon} size={18} color={colors.secondary} />
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 140, alignItems: "center", gap: spacing.xs, paddingVertical: spacing.md },
  header: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: { fontFamily: fonts.bold, fontSize: fontSizes.paragraph, color: colors.title },
  value: { fontFamily: fonts.bold, fontSize: fontSizes.display, color: colors.title },
});
