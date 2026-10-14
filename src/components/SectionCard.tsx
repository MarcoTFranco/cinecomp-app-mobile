import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { colors, fonts, fontSizes, spacing } from "@/styles/theme";

import { Card } from "./Card";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  onSeeAll?: () => void;
  onAdd?: () => void;
  addLabel?: string;
  style?: ViewStyle;
}

// Blocos da página inicial do Zeus: título, conteúdo, "Ver todos" e botão de adicionar.
export function SectionCard({ title, children, onSeeAll, onAdd, addLabel, style }: SectionCardProps) {
  return (
    <Card style={[styles.card, style]}>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <View style={styles.body}>{children}</View>
      {(onSeeAll || onAdd) && (
        <View style={styles.footer}>
          {onSeeAll ? (
            <Pressable accessibilityRole="link" onPress={onSeeAll} hitSlop={8}>
              <Text style={styles.link}>Ver todos</Text>
            </Pressable>
          ) : (
            <View />
          )}
          {onAdd && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={addLabel}
              onPress={onAdd}
              hitSlop={8}
              style={styles.add}
            >
              <Ionicons name="add-circle" size={26} color={colors.secondary} />
              <Text style={styles.addText}>{addLabel}</Text>
            </Pressable>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md, padding: spacing.lg },
  title: { fontFamily: fonts.bold, fontSize: fontSizes.title, color: colors.title },
  body: { gap: spacing.sm },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  link: { fontFamily: fonts.semiBold, fontSize: fontSizes.subtitle, color: colors.secondary },
  add: { flexDirection: "row", alignItems: "center", gap: 6 },
  addText: { fontFamily: fonts.bold, fontSize: fontSizes.label, color: colors.text },
});
