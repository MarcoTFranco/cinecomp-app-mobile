import { Ionicons } from "@expo/vector-icons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { DeleteMovieModal } from "@/components/DeleteMovieModal";
import { Poster } from "@/components/Poster";
import { Screen } from "@/components/Screen";
import { ErrorState, LoadingState } from "@/components/StateViews";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useMovieActions } from "@/hooks/useMovieActions";
import { useResponsive } from "@/hooks/useResponsive";
import { AppError } from "@/services/errors";
import { favoriteService } from "@/services/favoriteService";
import { movieService } from "@/services/movieService";
import { colors, fonts, fontSizes, radii, spacing } from "@/styles/theme";
import { formatRating } from "@/utils/format";
import { genreLabel } from "@/utils/genres";

function parseId(value: string | string[] | undefined): number | null {
  const id = Number(Array.isArray(value) ? value[0] : value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export default function MovieDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = parseId(params.id);
  const { isTablet } = useResponsive();

  const fetchMovie = useCallback(async () => {
    if (id === null) throw new AppError("notFound", "Filme inválido.");
    const [movie, favorites] = await Promise.all([movieService.getById(id), favoriteService.list()]);
    return { movie, isFavorite: favorites.some((f) => f.id === id) };
  }, [id]);

  const { data, error, loading, retry } = useApiQuery(fetchMovie);
  const actions = useMovieActions({ onDeleted: () => router.back() });
  const { setFavoriteIds } = actions;

  useEffect(() => {
    if (data?.isFavorite) setFavoriteIds(new Set([data.movie.id]));
  }, [data, setFavoriteIds]);

  if (loading) return <LoadingState message="Carregando filme..." />;
  if (error && !data) return <ErrorState error={error} onRetry={error.kind === "notFound" ? undefined : retry} />;
  if (!data) return null;

  const { movie } = data;
  const isFavorite = actions.favoriteIds.has(movie.id);

  const fields: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: "Gênero", value: genreLabel(movie.genre), icon: "pricetag-outline" },
    { label: "Diretor", value: movie.director, icon: "videocam-outline" },
    { label: "Ano de lançamento", value: String(movie.releaseYear), icon: "calendar-outline" },
    { label: "Nota", value: `${formatRating(movie.rating)} / 10`, icon: "star-outline" },
  ];

  return (
    <>
      <Stack.Screen options={{ title: movie.title }} />
      <Screen>
        <View style={[styles.layout, isTablet && styles.layoutTablet]}>
          <Card style={[styles.posterCard, isTablet && styles.posterCardTablet]}>
            <Poster uri={movie.posterUrl} title={movie.title} style={styles.poster} />
          </Card>

          <Card style={styles.info}>
            <Text style={styles.title} accessibilityRole="header">
              {movie.title}
            </Text>

            <View style={styles.fields}>
              {fields.map((field) => (
                <View key={field.label} style={styles.field}>
                  <Ionicons name={field.icon} size={20} color={colors.secondary} />
                  <View style={styles.fieldText}>
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                    <Text style={styles.fieldValue}>{field.value}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.description}>
              <Text style={styles.fieldLabel}>Sinopse</Text>
              <Text style={styles.descriptionText}>{movie.description}</Text>
            </View>

            <View style={styles.actions}>
              <Button
                title={isFavorite ? "Desfavoritar" : "Favoritar"}
                icon={isFavorite ? "heart" : "heart-outline"}
                variant="outline"
                loading={actions.pendingFavorite === movie.id}
                onPress={() => void actions.toggleFavorite(movie)}
                style={styles.action}
              />
              <Button
                title="Editar"
                icon="create-outline"
                variant="secondary"
                onPress={() => router.push({ pathname: "/movie/form", params: { id: movie.id } })}
                style={styles.action}
              />
              <Button
                title="Excluir"
                icon="trash-outline"
                variant="danger"
                onPress={() => actions.requestDelete(movie)}
                style={styles.action}
              />
            </View>
          </Card>
        </View>
      </Screen>

      <DeleteMovieModal
        movie={actions.movieToDelete}
        loading={actions.deleting}
        onConfirm={() => void actions.confirmDelete()}
        onCancel={actions.cancelDelete}
      />
    </>
  );
}

const styles = StyleSheet.create({
  layout: { gap: spacing.lg },
  layoutTablet: { flexDirection: "row", alignItems: "flex-start" },
  posterCard: { padding: spacing.sm, alignSelf: "center", width: "70%", maxWidth: 320 },
  posterCardTablet: { width: 300 },
  poster: { borderRadius: radii.lg },
  info: { flex: 1, gap: spacing.lg, padding: spacing.lg },
  title: { fontFamily: fonts.bold, fontSize: fontSizes.headline, color: colors.title, letterSpacing: -0.5 },
  fields: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  field: { flexDirection: "row", gap: spacing.sm, minWidth: 150, flexGrow: 1, flexBasis: "40%" },
  fieldText: { flex: 1 },
  fieldLabel: { fontFamily: fonts.bold, fontSize: fontSizes.label + 1, color: colors.textMuted },
  fieldValue: { fontFamily: fonts.semiBold, fontSize: fontSizes.subtitle, color: colors.text },
  description: { gap: spacing.xs },
  descriptionText: { fontFamily: fonts.regular, fontSize: fontSizes.subtitle, color: colors.text, lineHeight: 24 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  action: { flexGrow: 1, minWidth: 140 },
});
