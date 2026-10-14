import type { Movie } from "@/types/api";

import { FeedbackModal } from "./FeedbackModal";

interface DeleteMovieModalProps {
  movie: Movie | null;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Modal "Excluir" do Zeus: "Você tem certeza? Os dados não serão mantidos".
export function DeleteMovieModal({ movie, loading, onConfirm, onCancel }: DeleteMovieModalProps) {
  return (
    <FeedbackModal
      visible={movie !== null}
      tone="danger"
      title="Você tem certeza?"
      message={movie ? `"${movie.title}" será excluído e os dados não serão mantidos.` : undefined}
      confirmLabel="Excluir"
      onConfirm={onConfirm}
      cancelLabel="Cancelar"
      onCancel={onCancel}
      loading={loading}
    />
  );
}
