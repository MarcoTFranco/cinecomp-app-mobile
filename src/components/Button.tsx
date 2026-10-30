import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, type ViewStyle } from "react-native";

import { colors, fonts, radii, shadows, spacing } from "@/styles/theme";

type Variant = "primary" | "secondary" | "outline" | "danger" | "ghost";
type Size = "md" | "lg";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

const VARIANTS: Record<Variant, { background: string; text: string; border?: string }> = {
  primary: { background: colors.primary, text: colors.white },
  secondary: { background: colors.secondary, text: colors.white },
  outline: { background: colors.white, text: colors.secondary, border: colors.secondary },
  danger: { background: colors.danger, text: colors.white },
  ghost: { background: "transparent", text: colors.secondary },
};

// "Botao azul para branco" do Zeus: azul-marinho com texto branco em negrito.
export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  disabled = false,
  style,
  accessibilityHint,
}: ButtonProps) {
  const palette = VARIANTS[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        size === "lg" ? styles.lg : styles.md,
        {
          backgroundColor: palette.background,
          borderColor: palette.border ?? palette.background,
        },
        variant === "primary" && size === "lg" && shadows.button,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={size === "lg" ? 22 : 18} color={palette.text} />}
          <Text
            style={[styles.text, size === "lg" ? styles.textLg : styles.textMd, { color: palette.text }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 2,
    paddingHorizontal: spacing.md,
  },
  md: { minHeight: 44 },
  lg: { minHeight: 56 },
  text: { fontFamily: fonts.bold, letterSpacing: -0.3 },
  textMd: { fontSize: 16 },
  textLg: { fontSize: 20 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.55 },
});
