import type { LoginResponse, User } from "@/types/api";

import { api } from "./api";
import { isLoginResponse, isUser, unwrap } from "./validators";

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post("/auth/login", {
      email: email.trim().toLowerCase(),
      password,
    });
    return unwrap(data, isLoginResponse);
  },

  async register(name: string, email: string, password: string): Promise<User> {
    const { data } = await api.post("/auth/register", {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
    return unwrap(data, isUser);
  },
};
