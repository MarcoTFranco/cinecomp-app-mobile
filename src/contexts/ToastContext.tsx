import { Ionicons } from "@expo/vector-icons";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, fonts, fontSizes, radii, shadows, spacing } from "@/styles/theme";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION = 3500;

const TOAST_STYLES: Record<ToastType, { background: string; icon: keyof typeof Ionicons.glyphMap }> = {
  success: { background: colors.success, icon: "checkmark-circle" },
  error: { background: colors.danger, icon: "alert-circle" },
  info: { background: colors.secondary, icon: "information-circle" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const insets = useSafeAreaInsets();

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    setToast({ id: Date.now(), message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
        setToast((current) => (current?.id === toast.id ? null : current))
      );
    }, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast, opacity]);

  const style = toast ? TOAST_STYLES[toast.type] : null;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && style && (
        <Animated.View
          pointerEvents="box-none"
          style={[styles.wrapper, { top: insets.top + spacing.md, opacity }]}
        >
          <Pressable
            accessibilityRole="alert"
            onPress={() => setToast(null)}
            style={[styles.toast, { backgroundColor: style.background }]}
          >
            <Ionicons name={style.icon} size={22} color={colors.white} />
            <Text style={styles.text}>{toast.message}</Text>
          </Pressable>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return context;
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    alignItems: "center",
    zIndex: 1000,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    maxWidth: 560,
    width: "100%",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    ...shadows.button,
  },
  text: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.paragraph,
  },
});
