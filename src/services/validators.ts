import type { LoginResponse, Movie, Pagination, User } from "@/types/api";

import { unexpectedResponse } from "./errors";

// Guardas de tipo: a resposta da API é validada antes de chegar às telas,
// para que um formato inesperado vire uma mensagem clara e não um crash.

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isUser(value: unknown): value is User {
  return (
    isObject(value) &&
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    typeof value.email === "string"
  );
}

export function isMovie(value: unknown): value is Movie {
  return (
    isObject(value) &&
    typeof value.id === "number" &&
    typeof value.title === "string" &&
    typeof value.genre === "string" &&
    typeof value.director === "string" &&
    typeof value.releaseYear === "number" &&
    typeof value.rating === "number"
  );
}

export function isMovieList(value: unknown): value is Movie[] {
  return Array.isArray(value) && value.every(isMovie);
}

export function isPagination(value: unknown): value is Pagination {
  return (
    isObject(value) &&
    typeof value.page === "number" &&
    typeof value.total === "number" &&
    typeof value.totalPages === "number"
  );
}

export function isLoginResponse(value: unknown): value is LoginResponse {
  return isObject(value) && typeof value.token === "string" && isUser(value.user);
}

// Extrai `data` do envelope { success, data } garantindo o formato esperado.
export function unwrap<T>(body: unknown, guard: (value: unknown) => value is T): T {
  if (!isObject(body) || body.success !== true || !guard(body.data)) {
    throw unexpectedResponse();
  }
  return body.data;
}
