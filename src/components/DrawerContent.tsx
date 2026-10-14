import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView, type DrawerContentComponentProps } from "expo-router/drawer";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { colors, fonts, fontSizes, radii, spacing } from "@/styles/theme";

const ITEMS: { route: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { route: "index", label: "Página Inicial", icon: "home" },
  { route: "movies", label: "Filmes", icon: "film" },
  { route: "favorites", label: "Favoritos", icon: "heart" },
  { route: "profile", label: "Meu perfil", icon: "person" },
];

interface SidebarProps extends DrawerContentComponentProps {
  onLogoutPress: () => void;
}

// Barra lateral do Zeus: logo, itens com marcador azul no ativo e rodapé CompJR.
export function DrawerContent({ state, navigation, onLogoutPress }: SidebarProps) {
  const { user } = useAuth();
  const activeRoute = state.routes[state.index]?.name;

  return (
    <View style={styles.container}>
      <DrawerContentScrollView contentContainerStyle={styles.scroll}>
        <Image
          source={require("@/assets/images/zeus/logo-horizontal.png")}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel="Zeus"
        />

        <View style={styles.items}>
          {ITEMS.map((item) => {
            const active = activeRoute === item.route;
            return (
              <Pressable
                key={item.route}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={item.label}
                onPress={() => navigation.navigate(item.route)}
                style={({ pressed }) => [styles.item, active && styles.itemActive, pressed && styles.itemPressed]}
              >
                {active && <View style={styles.indicator} />}
                <Ionicons name={active ? item.icon : (`${item.icon}-outline` as keyof typeof Ionicons.glyphMap)} size={22} color={colors.primary} />
                <Text style={[styles.itemText, active && styles.itemTextActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </DrawerContentScrollView>

      <View style={styles.footer}>
        {user && (
          <View style={styles.user}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>
                {user.name}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user.email}
              </Text>
            </View>
          </View>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
          onPress={onLogoutPress}
          style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          <Text style={[styles.itemText, { color: colors.danger }]}>Sair</Text>
        </Pressable>
        <View style={styles.brand}>
          <Image
            source={require("@/assets/images/zeus/compjr-logo.png")}
            style={styles.brandLogo}
            contentFit="contain"
            accessibilityLabel="Comp Júnior"
          />
          <Text style={styles.brandName}>CompJR</Text>
          <Text style={styles.brandCaption}>CineComp</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { paddingTop: spacing.md },
  logo: { width: 150, height: 72, alignSelf: "center", marginBottom: spacing.lg },
  items: { gap: spacing.xs },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.sm,
  },
  itemActive: { backgroundColor: colors.secondaryLight },
  itemPressed: { opacity: 0.7 },
  indicator: {
    position: "absolute",
    left: -spacing.md,
    top: 4,
    bottom: 4,
    width: 8,
    borderTopRightRadius: radii.sm,
    borderBottomRightRadius: radii.sm,
    backgroundColor: colors.secondary,
  },
  itemText: { fontFamily: fonts.semiBold, fontSize: fontSizes.subtitle, color: colors.primary },
  itemTextActive: { fontFamily: fonts.bold },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  user: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.sm },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: fonts.bold, fontSize: fontSizes.subtitle, color: colors.white },
  userInfo: { flex: 1 },
  userName: { fontFamily: fonts.bold, fontSize: fontSizes.paragraph, color: colors.primary },
  userEmail: { fontFamily: fonts.regular, fontSize: fontSizes.label, color: colors.textMuted },
  brand: { alignItems: "center", marginTop: spacing.sm },
  brandLogo: { width: 44, height: 44 },
  brandName: { fontFamily: fonts.bold, fontSize: fontSizes.subtitle, color: "#14ADD6" },
  brandCaption: { fontFamily: fonts.regular, fontSize: fontSizes.paragraph, color: "#272525" },
});
