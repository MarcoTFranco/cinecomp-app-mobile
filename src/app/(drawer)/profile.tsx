import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { FormError } from "@/components/FormError";
import { PageHeader, Screen } from "@/components/Screen";
import { ErrorState, LoadingState } from "@/components/StateViews";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useApiQuery } from "@/hooks/useApiQuery";
import { getErrorMessage } from "@/services/errors";
import { userService } from "@/services/userService";
import { colors, fonts, fontSizes, spacing } from "@/styles/theme";
import type { User } from "@/types/api";
import { isValidEmail } from "@/utils/format";

export default function ProfileScreen() {
  const fetchMe = useCallback(() => userService.getMe(), []);
  const { data: user, error, loading, retry, setData } = useApiQuery(fetchMe);

  if (loading) return <LoadingState message="Carregando perfil..." />;
  if (error && !user) return <ErrorState error={error} onRetry={retry} />;
  if (!user) return null;

  return (
    <Screen contentStyle={styles.content}>
      <PageHeader title="Dados do usuário" subtitle="Atualize seu nome e e-mail de acesso." />
      {/* A key recria o formulário com os valores atualizados após salvar. */}
      <ProfileForm key={user.updatedAt} user={user} onSaved={setData} />
    </Screen>
  );
}

function ProfileForm({ user, onSaved }: { user: User; onSaved: (user: User) => void }) {
  const { setUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const changed = name.trim() !== user.name || email.trim().toLowerCase() !== user.email;

  async function handleSave() {
    setFormError(null);
    const next: typeof errors = {};
    if (name.trim().length < 2) next.name = "O nome deve ter pelo menos 2 caracteres.";
    if (!isValidEmail(email)) next.email = "Digite um e-mail válido.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      // Envia apenas os campos alterados.
      const changes: { name?: string; email?: string } = {};
      if (name.trim() !== user.name) changes.name = name.trim();
      if (email.trim().toLowerCase() !== user.email) changes.email = email.trim().toLowerCase();
      const updated = await userService.updateMe(changes);
      setUser(updated);
      showToast("Perfil atualizado com sucesso!", "success");
      onSaved(updated);
    } catch (err) {
      setFormError(getErrorMessage(err));
      setSaving(false);
    }
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString("pt-BR");

  return (
    <Card style={styles.card}>
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.identityText}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.meta}>Membro desde {memberSince}</Text>
        </View>
      </View>

      <FormError message={formError} />

      <TextField label="Nome" value={name} onChangeText={setName} error={errors.name} autoComplete="name" maxLength={120} />
      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        maxLength={120}
      />

      <Button title="Salvar alterações" icon="save-outline" onPress={handleSave} loading={saving} disabled={!changed} />
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { maxWidth: 720, width: "100%", alignSelf: "center" },
  card: { gap: spacing.md, padding: spacing.lg },
  identity: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontFamily: fonts.bold, fontSize: 30, color: colors.white },
  identityText: { flex: 1, gap: 2 },
  name: { fontFamily: fonts.bold, fontSize: fontSizes.title, color: colors.title },
  meta: { fontFamily: fonts.regular, fontSize: fontSizes.paragraph, color: colors.textMuted },
});
