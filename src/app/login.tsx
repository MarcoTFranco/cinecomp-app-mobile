import { Link } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, type TextInput, View } from "react-native";

import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { FormError } from "@/components/FormError";
import { TextField } from "@/components/TextField";
import { useAuth } from "@/contexts/AuthContext";
import { getErrorMessage } from "@/services/errors";
import { colors, fonts, fontSizes, spacing } from "@/styles/theme";
import { isValidEmail } from "@/utils/format";

const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 30;

export default function LoginScreen() {
  const { signIn } = useAuth();
  const passwordRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedFor, setLockedFor] = useState(0);

  // Bloqueio temporário após várias tentativas erradas (proteção contra força bruta).
  useEffect(() => {
    if (lockedFor <= 0) return;
    const timer = setTimeout(() => setLockedFor((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [lockedFor]);

  function validate() {
    const next: typeof errors = {};
    if (!email.trim()) next.email = "Informe seu e-mail.";
    else if (!isValidEmail(email)) next.email = "Digite um e-mail válido.";
    if (!password) next.password = "Informe sua senha.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    setFormError(null);
    if (lockedFor > 0 || !validate()) return;

    setLoading(true);
    try {
      await signIn(email, password, remember);
    } catch (error) {
      const attempts = failedAttempts + 1;
      setFailedAttempts(attempts);
      setPassword("");
      if (attempts >= MAX_ATTEMPTS) {
        setFailedAttempts(0);
        setLockedFor(LOCK_SECONDS);
        setFormError(`Muitas tentativas sem sucesso. Aguarde ${LOCK_SECONDS} segundos para tentar novamente.`);
      } else {
        setFormError(getErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <View style={styles.heading}>
        <Text style={styles.kicker}>Faça seu login.</Text>
        <Text style={styles.title} accessibilityRole="header">
          Bem-vindo ao Zeus!
        </Text>
      </View>

      <FormError message={formError} />

      <View style={styles.fields}>
        <TextField
          label="E-mail"
          placeholder="Digite seu e-mail"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          maxLength={120}
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <TextField
          ref={passwordRef}
          label="Senha"
          placeholder="Digite sua senha"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secure
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          maxLength={128}
          onSubmitEditing={handleSubmit}
        />
        <Checkbox label="Manter conectado" checked={remember} onChange={setRemember} />
      </View>

      <Button
        title={lockedFor > 0 ? `Aguarde ${lockedFor}s` : "Entrar"}
        size="lg"
        onPress={handleSubmit}
        loading={loading}
        disabled={lockedFor > 0}
      />

      <Text style={styles.footer}>
        Ainda não tem conta?{" "}
        <Link href="/register" style={styles.link}>
          Cadastre-se
        </Link>
      </Text>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  heading: { gap: spacing.xs },
  kicker: { fontFamily: fonts.bold, fontSize: fontSizes.subtitle, color: colors.text },
  title: { fontFamily: fonts.bold, fontSize: 34, lineHeight: 42, color: colors.primary, letterSpacing: -1 },
  fields: { gap: spacing.md },
  footer: { fontFamily: fonts.regular, fontSize: fontSizes.paragraph, color: colors.textMuted, textAlign: "center" },
  link: { fontFamily: fonts.bold, color: colors.secondary },
});
