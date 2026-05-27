<script setup lang="ts">
import type { DailyReport, InternalChatDailyReportPayload } from '~/types'

definePageMeta({ middleware: 'auth' })

const authStore = useAuthStore()
const chatStore = useChatStore()
const reportsStore = useReportsStore()

function openEdit(report: DailyReport) {
  selectedReport.value = report
}

async function quickDelete(report: DailyReport) {
  if (!confirm(`Удалить дейлик за ${report.report_date} и связанное сообщение?`)) return
  try {
    await reportsStore.deleteReport(report.id)
    chatStore.detachReportFromMessages(report.id)
    showToast('Дейлик удалён', 'success')
  } catch (err: unknown) {
    const e = err as { data?: { detail?: string }; message?: string }
    showToast(e?.data?.detail ?? e?.message ?? 'Ошибка при удалении')
  }
}
// ── init ────────────────────────────────────────────────────────────────────

onMounted(async () => {
  authStore.init()
  if (!authStore.user) await authStore.fetchMe()
  await Promise.all([chatStore.loadMessages(), reportsStore.loadReports()])
  scrollToBottom()
  textareaRef.value?.focus()
})

// ── sidebar: daily reports ───────────────────────────────────────────────────

const selectedReport = ref<DailyReport | null>(null)

// ── chat messages ────────────────────────────────────────────────────────────

const messagesEl = ref<HTMLDivElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}

watch(() => chatStore.messages.length, () => scrollToBottom())

// ── compose area ─────────────────────────────────────────────────────────────

const textareaRef = ref<HTMLTextAreaElement | null>(null)
const messageText = ref('')
const showReportForm = ref(false)

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

const reportPayload = ref<InternalChatDailyReportPayload>({
  report_date: today(),
  source: 'internal_web',
  status: 'submitted',
})

const hasReportForSelectedDate = computed(() =>
  !!reportsStore.reportForDate(reportPayload.value.report_date ?? today()),
)

function toggleReportForm() {
  showReportForm.value = !showReportForm.value
  if (showReportForm.value) {
    reportPayload.value = {
      report_date: today(),
      source: 'internal_web',
      status: 'submitted',
    }
  }
}

const canSend = computed(() => messageText.value.trim().length > 0 && !chatStore.sending)

const toast = ref<{ message: string; type: 'error' | 'success' } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(message: string, type: 'error' | 'success' = 'error') {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { message, type }
  toastTimer = setTimeout(() => (toast.value = null), 4000)
}

async function send() {
  if (!canSend.value) return

  const payload = {
    message_text: messageText.value.trim(),
    daily_report: showReportForm.value ? { ...reportPayload.value, source: 'internal_web' as const } : null,
  }

  try {
    await chatStore.sendMessage(payload)
    messageText.value = ''
    showReportForm.value = false
    reportPayload.value = { report_date: today(), source: 'internal_web', status: 'submitted' }
    await reportsStore.loadReports()
  } catch (err: unknown) {
    const e = err as { data?: { detail?: string }; message?: string }
    showToast(e?.data?.detail ?? e?.message ?? 'Ошибка при отправке')
  }
}

function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    send()
  }
}


</script>

<template>
  <div class="h-screen bg-slate-900 flex overflow-hidden">
    <!-- ── LEFT SIDEBAR ─────────────────────────────────────────────────── -->
    <aside class="w-72 flex-shrink-0 bg-slate-800 border-r border-slate-700 flex flex-col">
      <!-- User card -->
      <div class="px-4 py-4 border-b border-slate-700">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {{ authStore.user?.name?.charAt(0)?.toUpperCase() ?? '?' }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-white truncate">{{ authStore.user?.name ?? '...' }}</p>
            <p class="text-xs text-slate-400 truncate">{{ authStore.user?.email ?? '' }}</p>
          </div>
        </div>
        <button
          class="mt-3 w-full text-sm text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1.5 group"
          @click="authStore.logout()"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
          Выйти
        </button>
      </div>

      <!-- Reports list -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <div class="px-4 pt-3 pb-1">
          <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Мои дейлики</p>
        </div>
        <div class="flex-1 overflow-y-auto px-2 pb-2">
          <div v-if="reportsStore.loading" class="flex justify-center py-6">
            <svg class="animate-spin h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <template v-else-if="reportsStore.dailyReports.length > 0">
            <DailyReportItem
              v-for="report in reportsStore.dailyReports"
              :key="report.id"
              :report="report"
              @click="selectedReport = report"
              @edit="selectedReport = report"
              @delete="quickDelete(report)"
            />
          </template>
          <div v-else class="text-center py-8 text-slate-500 text-sm">
            Дейликов пока нет
          </div>
        </div>
      </div>
    </aside>

    <!-- ── MAIN CHAT AREA ──────────────────────────────────────────────── -->
    <main class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <div class="px-5 py-3.5 border-b border-slate-700 flex-shrink-0">
        <h1 class="text-base font-semibold text-white">Ежедневный отчёт</h1>
        <p class="text-xs text-slate-400">Отправь сообщение с дейликом или без него</p>
      </div>

      <!-- Messages -->
      <div ref="messagesEl" class="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        <div v-if="chatStore.loading" class="flex justify-center py-10">
          <svg class="animate-spin h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <template v-else>
          <div v-if="chatStore.messages.length === 0" class="flex flex-col items-center justify-center h-full text-slate-500 gap-2 pt-16">
            <div class="text-4xl">💬</div>
            <p class="text-sm">Напиши первое сообщение</p>
          </div>
          <ChatMessage
            v-for="msg in chatStore.messages"
            :key="msg.id"
            :message="msg"
            @open-report="(id) => selectedReport = reportsStore.dailyReports.find(r => r.id === id) ?? null"
          />
        </template>
      </div>

      <!-- Compose -->
      <div class="flex-shrink-0 border-t border-slate-700 bg-slate-800/60 backdrop-blur-sm">
        <!-- Daily report form (collapsible) -->
        <Transition name="slide-down">
          <div v-if="showReportForm" class="px-4 pt-3 pb-1 border-b border-slate-700/50">
            <DailyReportForm
              v-model="reportPayload"
              :has-report-for-date="hasReportForSelectedDate"
            />
          </div>
        </Transition>

        <!-- Input row -->
        <div class="px-4 py-3 flex items-end gap-2">
          <!-- Attach daily report toggle -->
          <button
            :title="showReportForm ? 'Скрыть форму дейлика' : 'Прикрепить дейлик'"
            :class="[
              'flex-shrink-0 p-2 rounded-xl border text-sm transition-all',
              showReportForm
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600',
            ]"
            @click="toggleReportForm"
          >
            📋
          </button>

          <!-- Textarea -->
          <textarea
            ref="textareaRef"
            v-model="messageText"
            placeholder="Напиши сообщение... (Ctrl+Enter для отправки)"
            rows="1"
            class="flex-1 bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition max-h-36 overflow-y-auto"
            style="min-height: 42px;"
            @keydown="onKeydown"
            @input="($event.target as HTMLTextAreaElement).style.height = 'auto'; ($event.target as HTMLTextAreaElement).style.height = ($event.target as HTMLTextAreaElement).scrollHeight + 'px'"
          />

          <!-- Send button -->
          <button
            :disabled="!canSend"
            class="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl p-2.5 transition-colors"
            @click="send"
          >
            <svg v-if="chatStore.sending" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </main>

    <!-- ── MODAL ───────────────────────────────────────────────────────── -->
    <DailyReportModal :report="selectedReport" @close="selectedReport = null" />

    <!-- ── TOAST ───────────────────────────────────────────────────────── -->
    <Transition name="toast">
      <div
        v-if="toast"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium"
        :class="toast.type === 'error'
          ? 'bg-red-900/90 border-red-700 text-red-200'
          : 'bg-emerald-900/90 border-emerald-700 text-emerald-200'"
      >
        {{ toast.message }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 600px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}
</style>
