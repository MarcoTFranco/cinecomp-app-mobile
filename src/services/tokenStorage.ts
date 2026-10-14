import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "cinecomp.auth.token";

// O token fica no armazenamento criptografado do sistema (Keychain no iOS,
// Keystore no Android). Na web não há armazenamento equivalente seguro,
// então a sessão vive apenas em memória e termina ao fechar a aba.
const isNative = Platform.OS !== "web";

let memoryToken: string | null = null;

export const tokenStorage = {
  async get(): Promise<string | null> {
    if (memoryToken) return memoryToken;
    if (!isNative) return null;
    try {
      memoryToken = await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      memoryToken = null;
    }
    return memoryToken;
  },

  // persist = false mantém o token só durante o uso atual do app
  // (opção "Manter conectado" desmarcada).
  async set(token: string, persist: boolean): Promise<void> {
    memoryToken = token;
    if (!isNative) return;
    if (persist) {
      await SecureStore.setItemAsync(TOKEN_KEY, token, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  },

  async clear(): Promise<void> {
    memoryToken = null;
    if (!isNative) return;
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      // Nada a fazer: o token em memória já foi descartado.
    }
  },

  peek(): string | null {
    return memoryToken;
  },
};
