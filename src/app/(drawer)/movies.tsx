import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { Chip } from "@/components/Chip";
import { DeleteMovieModal } from "@/components/DeleteMovieModal";
import { MovieCard } from "@/components/MovieCard";
import { SearchBar } from "@/components/SearchBar";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateViews";
import { useToast } from "@/contexts/ToastContext";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMovieActions } from "@/hooks/useMovieActions";
import { useGridColumns, useResponsive } from "@/hooks/useResponsive";
import { AppError, getErrorMessage, toAppError } from "@/services/errors";
import { favoriteService } from "@/services/favoriteService";
import { movieService } from "@/services/movieService";
import { colors, fonts, fontSizes, shadows, spacing } from "@/styles/theme";
import type { Movie } from "@/types/api";
import { GENRES } from "@/utils/genres";

const PAGE_SIZE = 12;

export default function MoviesScreen() {
  const { showToast } = useToast();
  const { isTablet } = useResponsive();
  const columns = useGridColumns(isTablet ? 200 : 160);

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim());

  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const requestId = useRef(0);

  const actions = useMovieActions({
    onDeleted: (id) => {
      setMovies((prev) => prev.filter((m) => m.id !== id));
      setTotal((t) => Math.max(0, t - 1));
    },
  });
  const { setFavoriteIds } = actions;

  const load = useCallback(
    async (mode: "initial" | "refresh" | "silent") => {
      const id = ++requestId.current;
      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);
      setFetching(true);
      setError(null);
      try {
        const [result, favorites] = await Promise.all([
          movieService.list({
            page: 1,
            limit: PAGE_SIZE,
            search: debouncedSearch || undefined,
            genre: genre ?? undefined,
            sortBy: "title",
            order: "asc",
          }),
          favoriteService.list(),
        ]);
        if (id !== requestId.current) return;
        setMovies(result.movies);
        setPage(1);
        setTotalPages(result.pagination.totalPages);
        setTotal(result.pagination.total);
        setFavoriteIds(new Set(favorites.map((f) => f.id)));
      } catch (err) {
        if (id !== requestId.current) return;
        setError(toAppError(err));
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setRefreshing(false);
          setFetching(false);
        }
      }
    },
    [debouncedSearch, genre, setFavoriteIds]
  );

  // Recarrega ao mudar busca/filtro e ao voltar para a tela (após criar/editar).
  const hasLoaded = useRef(false);
  useFocusEffect(
    useCallback(() => {
      void load(hasLoaded.current ? "silent" : "initial");
      hasLoaded.current = true;
    }, [load])
  );

  async function loadMore() {
    if (loadingMore || loading || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const result = await movieService.list({
        page: next,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        genre: genre ?? undefined,
        sortBy: "title",
        order: "asc",
      });
      setMovies((prev) => {
        const ids = new Set(prev.map((m) => m.id));
        return [...prev, ...result.movies.filter((m) => !ids.has(m.id))];
      });
      setPage(next);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setLoadingMore(false);
    }
  }

  const header = (
    <View style={styles.header}>
      <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por título, diretor..." />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="Todos" selected={genre === null} onPress={() => setGenre(null)} />
        {GENRES.map((g) => (
          <Chip key={g.value} label={g.label} selected={genre === g.value} onPress={() => setGenre(g.value)} />
        ))}
      </ScrollView>
      {!loading && !error && (
        <View style={styles.countRow}>
          <Text style={styles.count}>
            {total} {total === 1 ? "filme encontrado" : "filmes encontrados"}
          </Text>
          {fetching && <ActivityIndicator size="small" color={colors.secondary} />}
        </View>
      )}
    </View>
  );

  const hasFilters = Boolean(debouncedSearch || genre);

  return (
    <View style={styles.root}>
      <FlatList
        key={columns}
        data={loading || error ? [] : movies}
        keyExtractor={(item) => String(item.id)}
        numColumns={columns}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={[styles.list, isTablet && styles.listTablet]}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <View style={[styles.cell, { maxWidth: `${100 / columns}%` }]}>
            <MovieCard
              movie={item}
              onPress={() => router.push(`/movie/${item.id}`)}
              onEdit={() => router.push({ pathname: "/movie/form", params: { id: item.id } })}
              onDelete={() => actions.requestDelete(item)}
              isFavorite={actions.favoriteIds.has(item.id)}
              onToggleFavorite={() => void actions.toggleFavorite(item)}
              favoriteLoading={actions.pendingFavorite === item.id}
            />
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <LoadingState message="Buscando filmes..." />
          ) : error ? (
            <ErrorState error={error} onRetry={() => void load("initial")} />
          ) : hasFilters ? (
            <EmptyState
              icon="search-outline"
              title="Nenhum filme encontrado"
              message="Tente buscar por outro termo ou remover o filtro de gênero."
              actionLabel="Limpar filtros"
              onAction={() => {
                setSearch("");
                setGenre(null);
              }}
            />
          ) : (
            <EmptyState
              title="Nenhum filme cadastrado"
              message="Que tal adicionar o primeiro?"
              actionLabel="Adicionar filme"
              onAction={() => router.push("/movie/form")}
            />
          )
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footer} color={colors.secondary} /> : null}
        onEndReached={() => void loadMore()}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load("refresh")}
            tintColor={colors.secondary}
            colors={[colors.secondary]}
          />
        }
        keyboardShouldPersistTaps="handled"
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Adicionar filme"
        onPress={() => router.push("/movie/form")}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Ionicons name="add" size={32} color={colors.white} />
      </Pressable>

      <DeleteMovieModal
        movie={actions.movieToDelete}
        loading={actions.deleting}
        onConfirm={() => void actions.confirmDelete()}
        onCancel={actions.cancelDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: 120, gap: spacing.md, flexGrow: 1 },
  listTablet: { padding: spacing.xl },
  header: { gap: spacing.md, marginBottom: spacing.xs },
  chips: { gap: spacing.sm, paddingRight: spacing.md },
  countRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  count: { fontFamily: fonts.semiBold, fontSize: fontSizes.paragraph, color: colors.textMuted },
  columns: { gap: spacing.md },
  cell: { flex: 1 },
  footer: { marginVertical: spacing.lg },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.xl,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.button,
  },
  fabPressed: { opacity: 0.85, transform: [{ scale: 0.96 }] },
});
