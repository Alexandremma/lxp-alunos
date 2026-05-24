import { QueryClient } from "@tanstack/react-query";

/** Evita refetch ao voltar à aba do navegador; listagens ficam estáveis por 60s. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60_000,
    },
  },
});
