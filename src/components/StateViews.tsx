import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import type { AppError } from "@/services/errors";
import { colors, fonts, fontSizes, spacing } from "@/styles/theme";

import { Button } from "./Button";

export function LoadingState({ message = "Carregando..." }: { message?: string }) {
  return (
    <View style={styles.container} accessibilityRole="progressbar" accessibilityLabel={message}>
      <ActivityIndicator size="large" color={colors.secondary} />
      <Text style={styles.subtitle}>{message}</Text>
    </View>
  );
}

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, message, icon = "film-outline", actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={36} color={colors.secondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {!!message && <Text style={styles.subtitle}>{message}</Text>}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} variant="secondary" style={styles.action} />
      )}
    </View>
  );
}

const ERROR_ICONS: Partial<Record<AppError["kind"], keyof typeof Ionicons.glyphMap>> = {
  network: "cloud-offline-outline",
  timeout: "time-outline",
  server: "server-outline",
  auth: "lock-closed-outline",
  notFound: "search-outline",
};

export function ErrorState({ error, onRetry }: { error: AppError; onRetry?: () => void }) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={[styles.iconCircle, styles.iconCircleError]}>
        <Ionicons name={ERROR_ICONS[error.kind] ?? "alert-circle-outline"} size={36} color={colors.danger} />
      </View>
      <Text style={styles.title}>Algo deu errado</Text>
      <Text style={styles.subtitle}>{error.message}</Text>
      {onRetry && (
        <Button title="Tentar novamente" icon="refresh" onPress={onRetry} variant="secondary" style={styles.action} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
    minHeight: 280,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.secondaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  iconCircleError: { backgroundColor: colors.dangerLight },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.title,
    color: colors.title,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.paragraph,
    color: colors.textMuted,
    textAlign: "center",
    maxWidth: 420,
  },
  action: { marginTop: spacing.md, minWidth: 200 },
});
