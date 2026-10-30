import { router } from "expo-router";
import { useCallback, useEffect } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";

import { MovieCard } from "@/components/MovieCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useMovieActions } from "@/hooks/useMovieActions";
import { useGridColumns, useResponsive } from "@/hooks/useResponsive";
import { favoriteService } from "@/services/favoriteService";
import { colors, fonts, fontSizes, spacing } from "@/styles/theme";

export default function FavoritesScreen() {
  const { isTablet } = useResponsive();
  const columns = useGridColumns(isTablet ? 200 : 160);

  const fetchFavorites = useCallback(() => favoriteService.list(), []);
  const { data, error, loading, refreshing, refresh, retry, setData } = useApiQuery(fetchFavorites);
  const actions = useMovieActions();
  const { setFavoriteIds } = actions;

  useEffect(() => {
    if (data) setFavoriteIds(new Set(data.map((m) => m.id)));
  }, [data, setFavoriteIds]);

  if (loading) return <LoadingState message="Carregando favoritos..." />;
  if (error && !data) return <ErrorState error={error} onRetry={retry} />;

  const favorites = data ?? [];

  return (
    <FlatList
      key={columns}
      style={styles.root}
      data={favorites}
      keyExtractor={(item) => String(item.id)}
      numColumns={columns}
      columnWrapperStyle={styles.columns}
      contentContainerStyle={[styles.list, isTablet && styles.listTablet]}
      ListHeaderComponent={
        favorites.length > 0 ? (
          <Text style={styles.count}>
            {favorites.length} {favorites.length === 1 ? "filme favorito" : "filmes favoritos"}
          </Text>
        ) : null
      }
      renderItem={({ item }) => (
        <View style={[styles.cell, { maxWidth: `${100 / columns}%` }]}>
          <MovieCard
            movie={item}
            onPress={() => router.push(`/movie/${item.id}`)}
            isFavorite
            favoriteLoading={actions.pendingFavorite === item.id}
            onToggleFavorite={async () => {
              const stillFavorite = await actions.toggleFavorite(item);
              if (!stillFavorite) setData(favorites.filter((m) => m.id !== item.id));
            }}
          />
        </View>
      )}
      ListEmptyComponent={
        <EmptyState
          icon="heart-outline"
          title="Nenhum favorito ainda"
          message="Toque no coração de um filme para guardá-lo aqui."
          actionLabel="Explorar filmes"
          onAction={() => router.navigate("/movies")}
        />
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.secondary} colors={[colors.secondary]} />
      }
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, gap: spacing.md, flexGrow: 1 },
  listTablet: { padding: spacing.xl },
  count: { fontFamily: fonts.semiBold, fontSize: fontSizes.paragraph, color: colors.textMuted },
  columns: { gap: spacing.md },
  cell: { flex: 1 },
});
