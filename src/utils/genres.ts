// Gêneros aceitos pela CineComp API (valores sem acento, como estão no banco)
// e os rótulos exibidos ao usuário.
export const GENRES = [
  { value: "Acao", label: "Ação" },
  { value: "Animacao", label: "Animação" },
  { value: "Aventura", label: "Aventura" },
  { value: "Biografia", label: "Biografia" },
  { value: "Comedia", label: "Comédia" },
  { value: "Crime", label: "Crime" },
  { value: "Drama", label: "Drama" },
  { value: "Fantasia", label: "Fantasia" },
  { value: "Ficcao Cientifica", label: "Ficção Científica" },
  { value: "Musical", label: "Musical" },
  { value: "Romance", label: "Romance" },
  { value: "Terror", label: "Terror" },
  { value: "Thriller", label: "Thriller" },
] as const;

export function genreLabel(value: string): string {
  return GENRES.find((genre) => genre.value === value)?.label ?? value;
}
