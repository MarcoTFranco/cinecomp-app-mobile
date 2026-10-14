import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, fonts, fontSizes, radii, shadows, spacing } from "@/styles/theme";

import { Button } from "./Button";

type Tone = "danger" | "success" | "warning";

interface FeedbackModalProps {
  visible: boolean;
  tone: Tone;
  title: string;
  message?: string;
  confirmLabel: string;
  onConfirm: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
  loading?: boolean;
}

const TONES: Record<Tone, { icon: keyof typeof Ionicons.glyphMap; color: string; background: string }> = {
  danger: { icon: "trash", color: colors.danger, background: colors.dangerLight },
  success: { icon: "checkmark-circle", color: colors.success, background: colors.successLight },
  warning: { icon: "alert-circle", color: colors.warning, background: "#FFF4E5" },
};

// Modais "Excluir", "Cancelar" e "Adicionado com sucesso" do Zeus.
export function FeedbackModal({
  visible,
  tone,
  title,
  message,
  confirmLabel,
  onConfirm,
  cancelLabel,
  onCancel,
  loading = false,
}: FeedbackModalProps) {
  const palette = TONES[tone];
  const dismiss = onCancel ?? onConfirm;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={loading ? undefined : dismiss}>
      <Pressable style={styles.overlay} onPress={loading ? undefined : dismiss} accessibilityLabel="Fechar">
        <Pressable style={styles.box} accessibilityViewIsModal onPress={() => undefined}>
          <View style={[styles.iconCircle, { backgroundColor: palette.background }]}>
            <Ionicons name={palette.icon} size={40} color={palette.color} />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {!!message && <Text style={styles.message}>{message}</Text>}
          <View style={styles.actions}>
            <Button
              title={confirmLabel}
              onPress={onConfirm}
              variant={tone === "danger" ? "danger" : "primary"}
              loading={loading}
            />
            {cancelLabel && onCancel && (
              <Button title={cancelLabel} onPress={onCancel} variant="outline" disabled={loading} />
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  box: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.sm,
    ...shadows.card,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.title,
    color: colors.title,
    textAlign: "center",
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.paragraph,
    color: colors.textMuted,
    textAlign: "center",
  },
  actions: { alignSelf: "stretch", gap: spacing.sm, marginTop: spacing.md },
});
