import { create } from "axios";

import { toAppError } from "./errors";
import { tokenStorage } from "./tokenStorage";

const baseURL = process.env.EXPO_PUBLIC_API_URL;

if (!baseURL && __DEV__) {
  console.warn("EXPO_PUBLIC_API_URL não definida. Crie o arquivo .env a partir do .env.example.");
}

export const api = create({
  baseURL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

let onUnauthorized: (() => void) | null = null;

// O AuthContext registra aqui o que fazer quando a API recusa o token.
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

api.interceptors.request.use((config) => {
  const token = tokenStorage.peek();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const appError = toAppError(error);
    const hadToken = Boolean(error?.config?.headers?.Authorization);
    // 401 numa requisição autenticada = token expirado/inválido: encerra a sessão.
    if (appError.kind === "auth" && hadToken) onUnauthorized?.();
    return Promise.reject(appError);
  }
);
