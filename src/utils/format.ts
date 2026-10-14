export function formatRating(rating: number): string {
  return rating.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// Aceita apenas URLs http(s) para imagens vindas da API ou digitadas no formulário.
export function isSafeImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  return /^https?:\/\/[^\s]+$/i.test(url.trim());
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
