import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

import { AppError, toAppError } from "@/services/errors";

interface QueryState<T> {
  data: T | null;
  error: AppError | null;
  loading: boolean;
  refreshing: boolean;
}

// Busca dados sempre que a tela ganha foco, expondo loading, erro e refresh.
export function useApiQuery<T>(fetcher: () => Promise<T>) {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    error: null,
    loading: true,
    refreshing: false,
  });
  const requestId = useRef(0);

  const run = useCallback(
    async (mode: "initial" | "refresh") => {
      const id = ++requestId.current;
      setState((prev) => ({
        ...prev,
        error: null,
        loading: mode === "initial" && prev.data === null,
        refreshing: mode === "refresh",
      }));
      try {
        const data = await fetcher();
        if (id === requestId.current) {
          setState({ data, error: null, loading: false, refreshing: false });
        }
      } catch (error) {
        if (id === requestId.current) {
          setState((prev) => ({
            ...prev,
            error: toAppError(error),
            loading: false,
            refreshing: false,
          }));
        }
      }
    },
    [fetcher]
  );

  useFocusEffect(
    useCallback(() => {
      void run("initial");
    }, [run])
  );

  const refresh = useCallback(() => run("refresh"), [run]);
  const retry = useCallback(() => run("initial"), [run]);

  return { ...state, refresh, retry, setData: (data: T) => setState((s) => ({ ...s, data })) };
}
