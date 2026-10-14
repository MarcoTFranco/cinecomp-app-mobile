import { useCallback, useState } from "react";

import { useToast } from "@/contexts/ToastContext";
import { getErrorMessage } from "@/services/errors";
import { favoriteService } from "@/services/favoriteService";
import { movieService } from "@/services/movieService";
import type { Movie } from "@/types/api";

// Ações compartilhadas entre listagem, favoritos e detalhes:
// alternar favorito e excluir com confirmação.
export function useMovieActions(options: { onDeleted?: (id: number) => void } = {}) {
  const { showToast } = useToast();
  const { onDeleted } = options;

  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [pendingFavorite, setPendingFavorite] = useState<number | null>(null);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);
  const [deleting, setDeleting] = useState(false);

  const toggleFavorite = useCallback(
    async (movie: Movie) => {
      const isFavorite = favoriteIds.has(movie.id);
      setPendingFavorite(movie.id);
      try {
        if (isFavorite) await favoriteService.remove(movie.id);
        else await favoriteService.add(movie.id);

        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (isFavorite) next.delete(movie.id);
          else next.add(movie.id);
          return next;
        });
        showToast(
          isFavorite ? `"${movie.title}" removido dos favoritos.` : `"${movie.title}" adicionado aos favoritos!`,
          "success"
        );
        return !isFavorite;
      } catch (error) {
        showToast(getErrorMessage(error), "error");
        return isFavorite;
      } finally {
        setPendingFavorite(null);
      }
    },
    [favoriteIds, showToast]
  );

  const confirmDelete = useCallback(async () => {
    if (!movieToDelete) return;
    setDeleting(true);
    try {
      await movieService.remove(movieToDelete.id);
      showToast(`"${movieToDelete.title}" foi excluído.`, "success");
      onDeleted?.(movieToDelete.id);
      setMovieToDelete(null);
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setDeleting(false);
    }
  }, [movieToDelete, onDeleted, showToast]);

  return {
    favoriteIds,
    setFavoriteIds,
    pendingFavorite,
    toggleFavorite,
    movieToDelete,
    requestDelete: setMovieToDelete,
    cancelDelete: () => setMovieToDelete(null),
    confirmDelete,
    deleting,
  };
}
