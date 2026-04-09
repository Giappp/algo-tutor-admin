import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            retry: false,
            refetchOnWindowFocus: true,
        },
    },
});
export default queryClient;