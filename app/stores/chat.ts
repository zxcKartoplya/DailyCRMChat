import { defineStore } from 'pinia'
import type { InternalChatMessage, InternalChatMessageCreate } from '~/types'

export const useChatStore = defineStore('chat', () => {
  const { apiFetch } = useApi()
  const messages = ref<InternalChatMessage[]>([])
  const loading = ref(false)
  const sending = ref(false)

  async function loadMessages(): Promise<void> {
    loading.value = true
    try {
      const data = await apiFetch<InternalChatMessage[]>('/employee/chat/messages')
      // API returns DESC, we want ASC for chat display (oldest at top)
      console.log('loaded', data)
      messages.value = [...data].reverse()
    } finally {
      loading.value = false
    }
  }

  async function sendMessage(payload: InternalChatMessageCreate): Promise<void> {
    sending.value = true

    const tempId = -Date.now()
    const optimistic: InternalChatMessage = {
      id: tempId,
      user_id: 0,
      message_text: payload.message_text,
      created_at: new Date().toISOString(),
      parsed_to_daily_report: !!payload.daily_report,
      daily_report_id: null,
      daily_report: null,
      pending: true,
    }
    messages.value.push(optimistic)

    try {
      const newMsg = await apiFetch<InternalChatMessage>('/employee/chat/messages', {
        method: 'POST',
        body: payload,
      })
      const idx = messages.value.findIndex(m => m.id === tempId)
      if (idx !== -1) messages.value[idx] = newMsg
      else messages.value.push(newMsg)
    } catch (err) {
      const idx = messages.value.findIndex(m => m.id === tempId)
      const optimisticMsg = messages.value[idx]
      if (optimisticMsg) {
        optimisticMsg.pending = false
        optimisticMsg.failed = true
      }
      throw err
    } finally {
      sending.value = false
    }
  }
  function detachReportFromMessages(reportId: number): void {
    messages.value = messages.value.map(m =>
      m.daily_report_id === reportId
        ? { ...m, daily_report_id: null, daily_report: null }
        : m,
    )
  }

  return { messages, loading, sending, loadMessages, sendMessage, detachReportFromMessages }
})