<script setup lang="ts">
import type { InternalChatMessage } from '~/types'

const props = defineProps<{ message: InternalChatMessage }>()

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function formatFull(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="flex flex-col items-end mb-3">
    <div class="max-w-[75%] bg-indigo-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 shadow-md relative">
      <p class="text-sm whitespace-pre-wrap break-words leading-relaxed">{{ message.message_text }}</p>
      <div class="flex items-center justify-end gap-2 mt-1.5">
        <span
          v-if="message.parsed_to_daily_report"
          class="text-[10px] font-medium bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 rounded-full px-2 py-0.5"
        >
          ✓ Дейлик сохранён
        </span>
        <span
          :title="formatFull(message.created_at)"
          class="text-[11px] text-indigo-200 cursor-default select-none"
        >
          {{ formatTime(message.created_at) }}
        </span>
      </div>
    </div>
  </div>
</template>
