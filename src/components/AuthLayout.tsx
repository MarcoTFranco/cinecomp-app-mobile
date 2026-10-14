import { Image } from "expo-image";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useResponsive } from "@/hooks/useResponsive";
import { colors, spacing } from "@/styles/theme";

// Layout das telas de autenticação do Zeus: arte com o logo e painel lateral
// claro com o formulário. No celular o painel sobe como uma folha inferior.
export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isTablet, isLandscape } = useResponsive();
  const insets = useSafeAreaInsets();
  const sideBySide = isTablet && isLandscape;

  return (
    <View style={[styles.root, sideBySide && styles.row]}>
      <View style={sideBySide ? styles.artSide : styles.artTop}>
        <Image
          source={require("@/assets/images/zeus/login-bg.jpg")}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition={sideBySide ? "left" : "top left"}
          accessible={false}
        />
        <Image
          source={require("@/assets/images/zeus/logo.png")}
          style={sideBySide ? styles.logoLarge : [styles.logoSmall, { marginTop: insets.top }]}
          contentFit="contain"
          accessibilityLabel="Zeus"
        />
      </View>

      <KeyboardAvoidingView
        style={sideBySide ? styles.panelSide : styles.panelBottom}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.panelContent,
            isTablet && styles.panelContentTablet,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  row: { flexDirection: "row" },
  artTop: { height: "30%", minHeight: 180, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  artSide: { flex: 1, justifyContent: "flex-end", padding: spacing.xxl, overflow: "hidden" },
  logoSmall: { width: 220, height: 120 },
  logoLarge: { width: "70%", height: 220 },
  panelBottom: {
    flex: 1,
    marginTop: -36,
    backgroundColor: colors.background,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    overflow: "hidden",
  },
  panelSide: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: 68,
    borderBottomLeftRadius: 68,
    overflow: "hidden",
  },
  panelContent: { flexGrow: 1, justifyContent: "center", padding: spacing.lg, gap: spacing.lg },
  panelContentTablet: { paddingHorizontal: spacing.xxl, maxWidth: 640, width: "100%", alignSelf: "center" },
});
