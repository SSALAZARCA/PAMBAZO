import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UseApiOptions<T> {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: any;
    headers?: Record<string, string>;
    autoFetch?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
}

interface UseApiReturn<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    mutate: (newData?: any) => Promise<void>;
}

export function useApi<T = any>(options: UseApiOptions<T>): UseApiReturn<T> {
    const {
        url,
        method = 'GET',
        body,
        headers = {},
        autoFetch = true,
        onSuccess,
        onError,
    } = options;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async (customBody?: any) => {
        setLoading(true);
        setError(null);

        try {
            const requestBody = customBody || body;
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
                ...(requestBody ? { body: JSON.stringify(requestBody) } : {}),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setData(result);
            onSuccess?.(result);
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
            onError?.(error);
            toast.error(`Error: ${error.message}`);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [url, method, body, headers, onSuccess, onError]);

    useEffect(() => {
        if (autoFetch && method === 'GET') {
            fetchData();
        }
    }, [autoFetch, method, fetchData]);

    const refetch = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

    const mutate = useCallback(async (newData?: any) => {
        await fetchData(newData);
    }, [fetchData]);

    return { data, loading, error, refetch, mutate };
}

// Hook específico para GET requests
export function useApiGet<T = any>(url: string, options?: Omit<UseApiOptions<T>, 'url' | 'method'>) {
    return useApi<T>({ url, method: 'GET', ...options });
}

// Hook específico para POST requests
export function useApiPost<T = any>(url: string, options?: Omit<UseApiOptions<T>, 'url' | 'method'>) {
    return useApi<T>({ url, method: 'POST', autoFetch: false, ...options });
}

// Hook específico para PUT requests
export function useApiPut<T = any>(url: string, options?: Omit<UseApiOptions<T>, 'url' | 'method'>) {
    return useApi<T>({ url, method: 'PUT', autoFetch: false, ...options });
}

// Hook específico para DELETE requests
export function useApiDelete<T = any>(url: string, options?: Omit<UseApiOptions<T>, 'url' | 'method'>) {
    return useApi<T>({ url, method: 'DELETE', autoFetch: false, ...options });
}

export default useApi;
