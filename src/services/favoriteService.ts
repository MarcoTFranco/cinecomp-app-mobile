import type { Movie } from "@/types/api";

import { api } from "./api";
import { isMovieList, unwrap } from "./validators";

export const favoriteService = {
  async list(): Promise<Movie[]> {
    const { data } = await api.get("/favorites");
    return unwrap(data, isMovieList);
  },

  async add(movieId: number): Promise<void> {
    await api.post(`/favorites/${movieId}`);
  },

  async remove(movieId: number): Promise<void> {
    await api.delete(`/favorites/${movieId}`);
  },
};
