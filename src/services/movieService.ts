import type { Movie, MovieInput, MovieQuery, Pagination } from "@/types/api";

import { api } from "./api";
import { unexpectedResponse } from "./errors";
import { isMovie, isMovieList, isPagination, unwrap } from "./validators";

export const movieService = {
  async list(query: MovieQuery = {}): Promise<{ movies: Movie[]; pagination: Pagination }> {
    const { data } = await api.get("/movies", { params: query });
    const movies = unwrap(data, isMovieList);
    if (!isPagination(data.pagination)) throw unexpectedResponse();
    return { movies, pagination: data.pagination };
  },

  async getById(id: number): Promise<Movie> {
    const { data } = await api.get(`/movies/${id}`);
    return unwrap(data, isMovie);
  },

  async create(input: MovieInput): Promise<Movie> {
    const { data } = await api.post("/movies", input);
    return unwrap(data, isMovie);
  },

  async update(id: number, input: Partial<MovieInput>): Promise<Movie> {
    const { data } = await api.put(`/movies/${id}`, input);
    return unwrap(data, isMovie);
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/movies/${id}`);
  },
};
