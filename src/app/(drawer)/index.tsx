import { router } from "expo-router";
import { useCallback, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Poster } from "@/components/Poster";
import { Screen } from "@/components/Screen";
import { SectionCard } from "@/components/SectionCard";
import { StatCard } from "@/components/StatCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { useAuth } from "@/contexts/AuthContext";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useResponsive } from "@/hooks/useResponsive";
import { favoriteService } from "@/services/favoriteService";
import { movieService } from "@/services/movieService";
import { colors, fonts, fontSizes, radii, spacing } from "@/styles/theme";
import { formatRating } from "@/utils/format";
import { genreLabel } from "@/utils/genres";

export default function HomeScreen() {
  const { user } = useAuth();
  const { isTablet } = useResponsive();

  const fetchDashboard = useCallback(async () => {
    const [catalog, favorites] = await Promise.all([
      movieService.list({ limit: 100, sortBy: "rating", order: "desc" }),
      favoriteService.list(),
    ]);
    return { ...catalog, favorites };
  }, []);

  const { data, error, loading, refreshing, refresh, retry } = useApiQuery(fetchDashboard);

  const stats = useMemo(() => {
    if (!data) return null;
    const { movies } = data;
    const average = movies.length ? movies.reduce((sum, m) => sum + m.rating, 0) / movies.length : 0;

    const byGenre = new Map<string, number>();
    movies.forEach((m) => byGenre.set(m.genre, (byGenre.get(m.genre) ?? 0) + 1));
    const genres = [...byGenre.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    const recent = [...movies].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);

    return { average, genres, top: movies.slice(0, 8), recent, genreCount: byGenre.size };
  }, [data]);

  if (loading) return <LoadingState message="Carregando painel..." />;
  if (error && !data) return <ErrorState error={error} onRetry={retry} />;
  if (!data || !stats) return null;

  const firstName = user?.name.split(" ")[0];
  const maxGenre = stats.genres[0]?.[1] ?? 1;

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      {!!firstName && <Text style={styles.greeting}>Olá, {firstName}! 👋</Text>}

      <View style={styles.stats}>
        <StatCard label="Total de filmes" value={String(data.pagination.total)} icon="film-outline" />
        <StatCard label="Favoritos" value={String(data.favorites.length)} icon="heart-outline" />
        <StatCard label="Nota média" value={formatRating(stats.average)} icon="star-outline" />
        <StatCard label="Gêneros" value={String(stats.genreCount)} icon="pricetags-outline" />
      </View>

      {data.movies.length === 0 ? (
        <EmptyState
          title="Nenhum filme cadastrado"
          message="Cadastre o primeiro filme do catálogo."
          actionLabel="Adicionar filme"
          onAction={() => router.push("/movie/form")}
        />
      ) : (
        <>
          <View style={[styles.row, isTablet && styles.rowTablet]}>
            <SectionCard
              title="Filmes por gênero"
              style={styles.flex}
              onSeeAll={() => router.navigate("/movies")}
            >
              {stats.genres.map(([genre, count]) => (
                <View key={genre} style={styles.genreRow}>
                  <Text style={styles.genreLabel} numberOfLines={1}>
                    {genreLabel(genre)}
                  </Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${(count / maxGenre) * 100}%` }]} />
                  </View>
                  <Text style={styles.genreCount}>{count}</Text>
                </View>
              ))}
            </SectionCard>

            <SectionCard
              title="Adicionados recentemente"
              style={styles.flex}
              onSeeAll={() => router.navigate("/movies")}
              onAdd={() => router.push("/movie/form")}
              addLabel="Adicionar filme"
            >
              <View style={styles.tableHeader}>
                <Text style={[styles.th, styles.colTitle]}>Título</Text>
                <Text style={[styles.th, styles.colYear]}>Ano</Text>
                <Text style={[styles.th, styles.colRating]}>Nota</Text>
              </View>
              {stats.recent.map((movie) => (
                <Pressable
                  key={movie.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Ver ${movie.title}`}
                  onPress={() => router.push(`/movie/${movie.id}`)}
                  style={({ pressed }) => [styles.tableRow, pressed && styles.pressed]}
                >
                  <Text style={[styles.td, styles.colTitle]} numberOfLines={1}>
                    {movie.title}
                  </Text>
                  <Text style={[styles.td, styles.colYear]}>{movie.releaseYear}</Text>
                  <Text style={[styles.td, styles.colRating]}>{formatRating(movie.rating)}</Text>
                </Pressable>
              ))}
            </SectionCard>
          </View>

          <SectionCard title="Mais bem avaliados" onSeeAll={() => router.navigate("/movies")}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {stats.top.map((movie) => (
                <Pressable
                  key={movie.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Ver ${movie.title}, nota ${formatRating(movie.rating)}`}
                  onPress={() => router.push(`/movie/${movie.id}`)}
                  style={({ pressed }) => [styles.topItem, pressed && styles.pressed]}
                >
                  <Poster uri={movie.posterUrl} title={movie.title} style={styles.topPoster} />
                  <Text style={styles.topTitle} numberOfLines={1}>
                    {movie.title}
                  </Text>
                  <Text style={styles.topMeta}>★ {formatRating(movie.rating)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </SectionCard>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  greeting: { fontFamily: fonts.bold, fontSize: fontSizes.subheading, color: colors.title },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  row: { gap: spacing.lg },
  rowTablet: { flexDirection: "row" },
  flex: { flex: 1 },
  genreRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: 28 },
  genreLabel: { width: 110, fontFamily: fonts.semiBold, fontSize: fontSizes.paragraph, color: colors.textMuted },
  barTrack: { flex: 1, height: 14, backgroundColor: "#E9ECF1", borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: colors.secondary, borderRadius: 4 },
  genreCount: { width: 24, textAlign: "right", fontFamily: fonts.bold, fontSize: fontSizes.paragraph, color: colors.title },
  tableHeader: { flexDirection: "row", paddingBottom: spacing.xs },
  tableRow: {
    flexDirection: "row",
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  th: { fontFamily: fonts.bold, fontSize: fontSizes.label + 1, color: colors.textMuted },
  td: { fontFamily: fonts.regular, fontSize: fontSizes.paragraph - 1, color: colors.text },
  colTitle: { flex: 1, paddingRight: spacing.sm },
  colYear: { width: 52 },
  colRating: { width: 40, textAlign: "right" },
  pressed: { opacity: 0.7 },
  carousel: { gap: spacing.md, paddingVertical: spacing.xs },
  topItem: { width: 110, gap: 4 },
  topPoster: { borderRadius: radii.md },
  topTitle: { fontFamily: fonts.bold, fontSize: fontSizes.label + 1, color: colors.text },
  topMeta: { fontFamily: fonts.semiBold, fontSize: fontSizes.label, color: colors.textMuted },
});
