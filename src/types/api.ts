// Formatos de resposta da CineComp API.

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> extends ApiSuccess<T[]> {
  pagination: Pagination;
}

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Movie {
  id: number;
  title: string;
  description: string;
  genre: string;
  director: string;
  releaseYear: number;
  rating: number;
  posterUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export type MovieInput = Pick<
  Movie,
  "title" | "description" | "genre" | "director" | "releaseYear" | "rating"
> & { posterUrl?: string | null };

export interface MovieQuery {
  search?: string;
  genre?: string;
  page?: number;
  limit?: number;
  sortBy?: "title" | "releaseYear" | "rating" | "createdAt";
  order?: "asc" | "desc";
}

export interface LoginResponse {
  user: User;
  token: string;
}
