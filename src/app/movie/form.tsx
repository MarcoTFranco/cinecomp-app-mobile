import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { FeedbackModal } from "@/components/FeedbackModal";
import { FormError } from "@/components/FormError";
import { Poster } from "@/components/Poster";
import { PageHeader, Screen } from "@/components/Screen";
import { ErrorState, LoadingState } from "@/components/StateViews";
import { TextField } from "@/components/TextField";
import { useToast } from "@/contexts/ToastContext";
import { useResponsive } from "@/hooks/useResponsive";
import { useApiQuery } from "@/hooks/useApiQuery";
import { AppError, getErrorMessage } from "@/services/errors";
import { movieService } from "@/services/movieService";
import { colors, fonts, fontSizes, radii, spacing } from "@/styles/theme";
import type { Movie, MovieInput } from "@/types/api";
import { isSafeImageUrl } from "@/utils/format";
import { GENRES } from "@/utils/genres";

interface FormState {
  title: string;
  description: string;
  genre: string;
  director: string;
  releaseYear: string;
  rating: string;
  posterUrl: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  genre: "",
  director: "",
  releaseYear: "",
  rating: "",
  posterUrl: "",
};

const CURRENT_YEAR = new Date().getFullYear();

function fromMovie(movie: Movie): FormState {
  return {
    title: movie.title,
    description: movie.description,
    genre: movie.genre,
    director: movie.director,
    releaseYear: String(movie.releaseYear),
    rating: String(movie.rating),
    posterUrl: movie.posterUrl ?? "",
  };
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.title.trim()) errors.title = "Informe o título.";
  if (!form.description.trim()) errors.description = "Informe a sinopse.";
  else if (form.description.trim().length < 10) errors.description = "A sinopse deve ter pelo menos 10 caracteres.";
  if (!form.genre) errors.genre = "Selecione um gênero.";
  if (!form.director.trim()) errors.director = "Informe o diretor.";

  const year = Number(form.releaseYear);
  if (!form.releaseYear.trim()) errors.releaseYear = "Informe o ano.";
  else if (!Number.isInteger(year) || year < 1888 || year > CURRENT_YEAR + 5)
    errors.releaseYear = `Digite um ano entre 1888 e ${CURRENT_YEAR + 5}.`;

  const rating = Number(form.rating.replace(",", "."));
  if (!form.rating.trim()) errors.rating = "Informe a nota.";
  else if (Number.isNaN(rating) || rating < 0 || rating > 10) errors.rating = "A nota deve estar entre 0 e 10.";

  if (form.posterUrl.trim() && !isSafeImageUrl(form.posterUrl))
    errors.posterUrl = "Use um endereço que comece com http:// ou https://.";
  return errors;
}

function toPayload(form: FormState): MovieInput {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    genre: form.genre,
    director: form.director.trim(),
    releaseYear: Number(form.releaseYear),
    rating: Math.round(Number(form.rating.replace(",", ".")) * 10) / 10,
    posterUrl: form.posterUrl.trim() || null,
  };
}

export default function MovieFormScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  if (!params.id) return <MovieForm movie={null} />;
  return <EditMovieLoader id={Number(params.id)} />;
}

// Carrega o filme antes de montar o formulário de edição.
function EditMovieLoader({ id }: { id: number }) {
  const fetchMovie = useCallback(async () => {
    if (!Number.isInteger(id) || id <= 0) throw new AppError("notFound", "Filme inválido.");
    return movieService.getById(id);
  }, [id]);
  const { data, error, loading, retry } = useApiQuery(fetchMovie);

  if (loading) return <LoadingState message="Carregando filme..." />;
  if (error && !data) return <ErrorState error={error} onRetry={error.kind === "notFound" ? undefined : retry} />;
  if (!data) return null;
  return <MovieForm key={data.id} movie={data} />;
}

function MovieForm({ movie }: { movie: Movie | null }) {
  const isEditing = movie !== null;
  const { showToast } = useToast();
  const { isTablet } = useResponsive();

  const [initial, setInitial] = useState<FormState>(() => (movie ? fromMovie(movie) : EMPTY_FORM));
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<Movie | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const update = (field: keyof FormState) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  async function handleSubmit() {
    setFormError(null);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setFormError("Revise os campos destacados.");
      return;
    }

    setSaving(true);
    try {
      if (movie) {
        await movieService.update(movie.id, toPayload(form));
        showToast("Filme atualizado com sucesso!", "success");
        router.back();
      } else {
        const movie = await movieService.create(toPayload(form));
        setInitial(form);
        setCreated(movie);
      }
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (dirty) setConfirmCancel(true);
    else router.back();
  }

  const title = isEditing ? "Editar filme" : "Cadastrar novo filme";

  return (
    <>
      <Stack.Screen options={{ title }} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Screen>
          <PageHeader
            title={title}
            actions={
              isTablet ? (
                <>
                  <Button title="Cancelar" variant="outline" onPress={handleCancel} disabled={saving} />
                  <Button title="Salvar" icon="checkmark" onPress={handleSubmit} loading={saving} />
                </>
              ) : undefined
            }
          />

          <FormError message={formError} />

          <View style={[styles.layout, isTablet && styles.layoutTablet]}>
            <Card style={styles.formCard}>
              <TextField label="Título" placeholder="Ex.: Interestelar" value={form.title} onChangeText={update("title")} error={errors.title} maxLength={150} />
              <TextField
                label="Sinopse"
                placeholder="Sobre o que é o filme?"
                value={form.description}
                onChangeText={update("description")}
                error={errors.description}
                multiline
                maxLength={1000}
              />

              <View style={styles.genreBlock}>
                <Text style={styles.label}>Gênero</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                  {GENRES.map((g) => (
                    <Chip key={g.value} label={g.label} selected={form.genre === g.value} onPress={() => update("genre")(g.value)} />
                  ))}
                </ScrollView>
                {!!errors.genre && <Text style={styles.error}>{errors.genre}</Text>}
              </View>

              <TextField label="Diretor" placeholder="Ex.: Christopher Nolan" value={form.director} onChangeText={update("director")} error={errors.director} maxLength={120} />

              <View style={styles.row}>
                <View style={styles.flex}>
                  <TextField
                    label="Ano de lançamento"
                    placeholder="2014"
                    value={form.releaseYear}
                    onChangeText={(v) => update("releaseYear")(v.replace(/\D/g, ""))}
                    error={errors.releaseYear}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
                <View style={styles.flex}>
                  <TextField
                    label="Nota (0 a 10)"
                    placeholder="8,7"
                    value={form.rating}
                    onChangeText={(v) => update("rating")(v.replace(/[^\d.,]/g, ""))}
                    error={errors.rating}
                    keyboardType="decimal-pad"
                    maxLength={4}
                  />
                </View>
              </View>

              <TextField
                label="URL do pôster (opcional)"
                placeholder="https://..."
                value={form.posterUrl}
                onChangeText={update("posterUrl")}
                error={errors.posterUrl}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={500}
              />
            </Card>

            <Card style={[styles.previewCard, isTablet && styles.previewCardTablet]}>
              <Text style={styles.label}>Pré-visualização</Text>
              <Poster uri={isSafeImageUrl(form.posterUrl) ? form.posterUrl.trim() : null} title={form.title || "Novo filme"} style={styles.preview} />
              <Text style={styles.previewTitle} numberOfLines={2}>
                {form.title || "Título do filme"}
              </Text>
            </Card>
          </View>

          {!isTablet && (
            <View style={styles.mobileActions}>
              <Button title="Salvar" icon="checkmark" size="lg" onPress={handleSubmit} loading={saving} />
              <Button title="Cancelar" variant="outline" onPress={handleCancel} disabled={saving} />
            </View>
          )}
        </Screen>
      </KeyboardAvoidingView>

      <FeedbackModal
        visible={created !== null}
        tone="success"
        title="Adicionado com sucesso!"
        message={created ? `"${created.title}" já está no catálogo.` : undefined}
        confirmLabel="Ver filme"
        onConfirm={() => {
          const id = created?.id;
          setCreated(null);
          if (id) router.replace(`/movie/${id}`);
        }}
        cancelLabel="Voltar para a lista"
        onCancel={() => {
          setCreated(null);
          router.back();
        }}
      />

      <FeedbackModal
        visible={confirmCancel}
        tone="warning"
        title="Descartar alterações?"
        message="Os dados preenchidos não serão mantidos."
        confirmLabel="Descartar"
        onConfirm={() => {
          setConfirmCancel(false);
          router.back();
        }}
        cancelLabel="Continuar editando"
        onCancel={() => setConfirmCancel(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  layout: { gap: spacing.lg },
  layoutTablet: { flexDirection: "row", alignItems: "flex-start" },
  formCard: { flex: 1, gap: spacing.md, padding: spacing.lg },
  genreBlock: { gap: spacing.sm },
  label: { fontFamily: fonts.semiBold, fontSize: fontSizes.paragraph, color: colors.text },
  chips: { gap: spacing.sm },
  error: { fontFamily: fonts.semiBold, fontSize: fontSizes.label, color: colors.danger },
  row: { flexDirection: "row", gap: spacing.md },
  previewCard: { alignItems: "center", gap: spacing.sm, padding: spacing.lg },
  previewCardTablet: { width: 280 },
  preview: { width: 180, borderRadius: radii.lg },
  previewTitle: { fontFamily: fonts.bold, fontSize: fontSizes.subtitle, color: colors.title, textAlign: "center" },
  mobileActions: { gap: spacing.sm },
});
