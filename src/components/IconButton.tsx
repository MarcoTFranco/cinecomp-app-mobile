import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";

import { colors, radii } from "@/styles/theme";

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  variant?: "filled" | "plain";
  color?: string;
  loading?: boolean;
  size?: number;
}

// Botões quadrados azuis dos cards do Zeus (e-mail, telefone, menu).
export function IconButton({
  icon,
  label,
  onPress,
  variant = "filled",
  color,
  loading = false,
  size = 20,
}: IconButtonProps) {
  const filled = variant === "filled";
  const iconColor = color ?? (filled ? colors.white : colors.secondary);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={loading}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        filled && styles.filled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={iconColor} /> : <Ionicons name={icon} size={size} color={iconColor} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minWidth: 44,
    minHeight: 40,
    paddingHorizontal: 10,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  filled: { backgroundColor: colors.secondary },
  pressed: { opacity: 0.75 },
});
