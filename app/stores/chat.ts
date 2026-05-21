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
      messages.value = [...data].reverse()
    } finally {
      loading.value = false
    }
  }

  async function sendMessage(payload: InternalChatMessageCreate): Promise<void> {
    sending.value = true
    try {
      const newMsg = await apiFetch<InternalChatMessage>('/employee/chat/messages', {
        method: 'POST',
        body: payload,
      })
      messages.value.push(newMsg)
    } finally {
      sending.value = false
    }
  }

  return { messages, loading, sending, loadMessages, sendMessage }
})
