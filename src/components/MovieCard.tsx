import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Movie } from "@/types/api";
import { colors, fonts, fontSizes, radii, spacing } from "@/styles/theme";
import { formatRating } from "@/utils/format";
import { genreLabel } from "@/utils/genres";

import { Card } from "./Card";
import { IconButton } from "./IconButton";
import { Poster } from "./Poster";

interface MovieCardProps {
  movie: Movie;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  favoriteLoading?: boolean;
}

// Inspirado no card de membro do Zeus: selo no topo, imagem, nome e ações.
export function MovieCard({
  movie,
  onPress,
  onEdit,
  onDelete,
  isFavorite,
  onToggleFavorite,
  favoriteLoading,
}: MovieCardProps) {
  return (
    <Card style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver detalhes de ${movie.title}`}
        onPress={onPress}
        style={({ pressed }) => [styles.content, pressed && styles.pressed]}
      >
        <View style={styles.badge}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {genreLabel(movie.genre)}
          </Text>
        </View>
        <Poster uri={movie.posterUrl} title={movie.title} style={styles.poster} />
        <Text style={styles.title} numberOfLines={2}>
          {movie.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {movie.director} · {movie.releaseYear}
        </Text>
        <View style={styles.rating}>
          <Ionicons name="star" size={14} color="#F5B301" />
          <Text style={styles.ratingText}>{formatRating(movie.rating)}</Text>
        </View>
      </Pressable>

      {(onToggleFavorite || onEdit || onDelete) && (
        <View style={styles.actions}>
          {onToggleFavorite && (
            <IconButton
              icon={isFavorite ? "heart" : "heart-outline"}
              label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              onPress={onToggleFavorite}
              loading={favoriteLoading}
            />
          )}
          {onEdit && <IconButton icon="create-outline" label={`Editar ${movie.title}`} onPress={onEdit} />}
          {onDelete && <IconButton icon="trash-outline" label={`Excluir ${movie.title}`} onPress={onDelete} />}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, padding: spacing.sm + 4, gap: spacing.sm },
  content: { alignItems: "center", gap: 6 },
  pressed: { opacity: 0.85 },
  badge: {
    alignSelf: "stretch",
    backgroundColor: colors.secondary,
    borderRadius: radii.md,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    alignItems: "center",
  },
  badgeText: { fontFamily: fonts.bold, fontSize: fontSizes.label + 1, color: colors.white },
  poster: { borderRadius: radii.md, marginTop: 2 },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.subtitle,
    color: colors.text,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.label,
    color: colors.textMuted,
    textAlign: "center",
  },
  rating: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontFamily: fonts.bold, fontSize: fontSizes.label + 1, color: colors.title },
  actions: { flexDirection: "row", justifyContent: "center", gap: spacing.sm },
});
