import type { User } from "@/types/api";

import { api } from "./api";
import { isUser, unwrap } from "./validators";

export const userService = {
  async getMe(): Promise<User> {
    const { data } = await api.get("/users/me");
    return unwrap(data, isUser);
  },

  async updateMe(changes: Partial<Pick<User, "name" | "email">>): Promise<User> {
    const { data } = await api.put("/users/me", changes);
    return unwrap(data, isUser);
  },
};
