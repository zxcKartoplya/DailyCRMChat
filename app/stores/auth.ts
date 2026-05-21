import { defineStore } from 'pinia'
import type { User, LoginResponse } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  function init() {
    if (import.meta.client) {
      const stored = localStorage.getItem('auth_token')
      if (stored) token.value = stored
    }
  }

  async function login(email: string, password: string): Promise<void> {
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBase as string

    const data = await $fetch<LoginResponse>(`${baseURL}/auth/login`, {
      method: 'POST',
      body: { email, password },
    })

    token.value = data.access_token
    user.value = data.user
    if (import.meta.client) {
      localStorage.setItem('auth_token', data.access_token)
    }
  }

  async function fetchMe(): Promise<void> {
    if (!token.value) return
    const config = useRuntimeConfig()
    const baseURL = config.public.apiBase as string
    try {
      const data = await $fetch<User>(`${baseURL}/auth/me`, {
        headers: { Authorization: `Bearer ${token.value}` },
      })
      user.value = data
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = null
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem('auth_token')
    }
    navigateTo('/login')
  }

  const isAuthenticated = computed(() => !!token.value)

  return { user, token, isAuthenticated, init, login, fetchMe, logout }
})
