import {QueryClient} from "@tanstack/react-query";
import {MutationCache} from "@tanstack/query-core";
import {toAppError} from "@/api/core/api-error";
import {toast} from "sonner";

const queryClient = new QueryClient({
    mutationCache: new MutationCache({
        onError: (error) => {
            const appError = toAppError(error);
            toast.error(appError.message);
        },
    }),
    defaultOptions: {
        queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            retry: false,
            refetchOnWindowFocus: false, // Tắt tự động gọi lại API khi tab focus
        },
    },
});
export default queryClient;