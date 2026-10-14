import { Drawer } from "expo-router/drawer";
import { useState } from "react";

import { DrawerContent } from "@/components/DrawerContent";
import { FeedbackModal } from "@/components/FeedbackModal";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useResponsive } from "@/hooks/useResponsive";
import { colors, fonts } from "@/styles/theme";

export default function DrawerLayout() {
  const { signOut } = useAuth();
  const { showToast } = useToast();
  const { isLargeTablet, isLandscape } = useResponsive();
  const [confirmLogout, setConfirmLogout] = useState(false);

  // Em tablets grandes na horizontal a sidebar fica fixa, como no desktop do Zeus.
  const permanent = isLargeTablet && isLandscape;

  async function handleLogout() {
    setConfirmLogout(false);
    await signOut();
    showToast("Você saiu da sua conta.", "info");
  }

  return (
    <>
      <Drawer
        drawerContent={(props) => <DrawerContent {...props} onLogoutPress={() => setConfirmLogout(true)} />}
        screenOptions={{
          drawerType: permanent ? "permanent" : "front",
          drawerStyle: { width: 270, backgroundColor: colors.surface },
          headerStyle: { backgroundColor: colors.surface },
          headerShadowVisible: false,
          headerTintColor: colors.primary,
          headerTitleStyle: { fontFamily: fonts.bold, fontSize: 22, color: colors.title },
          headerTitleAlign: "left",
          sceneStyle: { backgroundColor: colors.background },
        }}
      >
        <Drawer.Screen name="index" options={{ title: "Página Inicial" }} />
        <Drawer.Screen name="movies" options={{ title: "Filmes" }} />
        <Drawer.Screen name="favorites" options={{ title: "Favoritos" }} />
        <Drawer.Screen name="profile" options={{ title: "Meu perfil" }} />
      </Drawer>

      <FeedbackModal
        visible={confirmLogout}
        tone="warning"
        title="Deseja sair?"
        message="Sua sessão será encerrada neste dispositivo."
        confirmLabel="Sair"
        onConfirm={handleLogout}
        cancelLabel="Cancelar"
        onCancel={() => setConfirmLogout(false)}
      />
    </>
  );
}
