<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    await navigateTo('/chat')
  } catch (err: unknown) {
    const e = err as { data?: { detail?: string }; message?: string }
    error.value = e?.data?.detail ?? e?.message ?? 'Ошибка входа'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <div class="text-4xl mb-3">💬</div>
        <h1 class="text-2xl font-bold text-white">DailyChat</h1>
        <p class="text-slate-400 mt-1 text-sm">Ежедневные отчёты команды</p>
      </div>

      <form
        class="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700"
        @submit.prevent="handleLogin"
      >
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="you@company.com"
            class="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <div class="mb-5">
          <label class="block text-sm font-medium text-slate-300 mb-1.5">Пароль</label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <Transition name="fade">
          <div v-if="error" class="mb-4 text-sm text-red-400 bg-red-900/30 border border-red-700/40 rounded-lg px-3.5 py-2.5">
            {{ error }}
          </div>
        </Transition>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition-colors"
        >
          <span v-if="loading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Вход...
          </span>
          <span v-else>Войти</span>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
