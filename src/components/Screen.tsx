import { RefreshControl, ScrollView, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts, fontSizes, spacing } from "@/styles/theme";

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  contentStyle?: ViewStyle;
}

// Fundo cinza do Zeus com margens que crescem no tablet.
export function Screen({ children, scroll = true, refreshing = false, onRefresh, contentStyle }: ScreenProps) {
  const { isTablet } = useResponsive();
  const padding = isTablet ? spacing.xl : spacing.md;

  if (!scroll) {
    return <View style={[styles.root, { padding }, contentStyle]}>{children}</View>;
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { padding }, contentStyle]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.secondary} colors={[colors.secondary]} />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {actions && <View style={styles.actions}>{actions}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, gap: spacing.lg },
  header: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  headerText: { flexShrink: 1, gap: 2 },
  title: { fontFamily: fonts.bold, fontSize: fontSizes.subheading, color: colors.title },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSizes.paragraph, color: colors.textMuted },
  actions: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
});
