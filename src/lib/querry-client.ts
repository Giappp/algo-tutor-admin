import {QueryClient} from "@tanstack/query-core";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000,
            gcTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: true,
        }
    }
})
export default queryClient