import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const errorData = await res.json();
      // Check if it's a structured error response
      if (errorData.error && errorData.error.code) {
        const error = new Error(errorData.error.message || res.statusText);
        (error as any).code = errorData.error.code;
        (error as any).details = errorData.error.details;
        (error as any).statusCode = res.status;
        throw error;
      }
    } catch (jsonError) {
      // Fallback to text if JSON parsing fails
      const text = (await res.text()) || res.statusText;
      throw new Error(`${res.status}: ${text}`);
    }
    throw new Error(`${res.status}: ${res.statusText}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes for better performance
      gcTime: 30 * 60 * 1000, // 30 minutes cache
      retry: (failureCount, error: any) => {
        // Don't retry auth errors or validation errors
        if (error?.statusCode === 401 || error?.statusCode === 400) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: (failureCount, error: any) => {
        if (error?.statusCode === 401 || error?.statusCode === 400) return false;
        return failureCount < 1;
      },
    },
  },
});

// Cache scan results longer for better performance
export const getCachedScanResults = (scanId: string) => {
  return queryClient.getQueryData(['/api/scans', scanId, 'results']);
};

export const setCachedScanResults = (scanId: string, data: any) => {
  queryClient.setQueryData(['/api/scans', scanId, 'results'], data);
};
