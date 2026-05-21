import type { NitroFetchOptions } from 'nitropack'

export function useApi() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase as string

  function getToken(): string | null {
    if (import.meta.client) {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  async function apiFetch<T>(
    path: string,
    options: NitroFetchOptions<string> = {},
  ): Promise<T> {
    const token = getToken()
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> | undefined),
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      return await $fetch<T>(`${baseURL}${path}`, {
        ...options,
        headers,
      })
    } catch (err: unknown) {
      const fetchError = err as { status?: number; statusCode?: number }
      const status = fetchError?.status ?? fetchError?.statusCode
      if (status === 401) {
        if (import.meta.client) {
          localStorage.removeItem('auth_token')
        }
        await navigateTo('/login')
      }
      throw err
    }
  }

  return { apiFetch }
}
