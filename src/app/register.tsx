import { Link, router } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, type TextInput, View } from "react-native";

import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/Button";
import { FormError } from "@/components/FormError";
import { TextField } from "@/components/TextField";
import { useToast } from "@/contexts/ToastContext";
import { authService } from "@/services/authService";
import { getErrorMessage } from "@/services/errors";
import { colors, fonts, fontSizes, spacing } from "@/styles/theme";
import { isValidEmail } from "@/utils/format";

type Field = "name" | "email" | "password" | "confirm";

export default function RegisterScreen() {
  const { showToast } = useToast();
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (field: Field) => (value: string) => setForm((f) => ({ ...f, [field]: value }));

  // Mesmas regras do back-end, validadas antes de enviar.
  function validate() {
    const next: Partial<Record<Field, string>> = {};
    if (form.name.trim().length < 2) next.name = "O nome deve ter pelo menos 2 caracteres.";
    if (!isValidEmail(form.email)) next.email = "Digite um e-mail válido.";
    if (form.password.length < 8) next.password = "A senha deve ter 8 caracteres ou mais.";
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
      next.password = "Use letras e números na senha.";
    if (form.confirm !== form.password) next.confirm = "As senhas não conferem.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    setFormError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.register(form.name, form.email, form.password);
      setForm((f) => ({ ...f, password: "", confirm: "" }));
      showToast("Conta criada com sucesso! Faça login para continuar.", "success");
      router.replace("/login");
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <View style={styles.heading}>
        <Text style={styles.kicker}>Crie sua conta.</Text>
        <Text style={styles.title} accessibilityRole="header">
          Junte-se ao Zeus!
        </Text>
      </View>

      <FormError message={formError} />

      <View style={styles.fields}>
        <TextField
          label="Nome"
          placeholder="Digite seu nome"
          value={form.name}
          onChangeText={update("name")}
          error={errors.name}
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          maxLength={120}
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <TextField
          ref={emailRef}
          label="E-mail"
          placeholder="Digite seu e-mail"
          value={form.email}
          onChangeText={update("email")}
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
          placeholder="Mínimo de 8 caracteres"
          value={form.password}
          onChangeText={update("password")}
          error={errors.password}
          secure
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          maxLength={128}
          onSubmitEditing={() => confirmRef.current?.focus()}
        />
        <TextField
          ref={confirmRef}
          label="Confirmar senha"
          placeholder="Repita a senha"
          value={form.confirm}
          onChangeText={update("confirm")}
          error={errors.confirm}
          secure
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          maxLength={128}
          onSubmitEditing={handleSubmit}
        />
      </View>

      <Button title="Cadastrar" size="lg" onPress={handleSubmit} loading={loading} />

      <Text style={styles.footer}>
        Já tem conta?{" "}
        <Link href="/login" replace style={styles.link}>
          Entrar
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
