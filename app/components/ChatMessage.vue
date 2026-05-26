<script setup lang="ts">
import type { InternalChatMessage } from '~/types'

const props = defineProps<{ message: InternalChatMessage }>()
const emit = defineEmits<{ openReport: [id: number] }>()

const moodEmoji: Record<string, string> = {
  great: '😊', good: '🙂', neutral: '😐', bad: '😕', terrible: '😞',
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}
function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('ru-RU', { day: '2-digit', month: 'long' })
}
</script>

<template>
  <div class="flex flex-col items-end mb-3">
    <div
      class="max-w-[75%] rounded-2xl rounded-br-sm px-4 py-2.5 shadow-md"
      :class="[
        message.failed ? 'bg-red-700' : 'bg-indigo-600',
        message.pending ? 'opacity-60' : '',
      ]"
    >
      <p class="text-sm text-white whitespace-pre-wrap break-words leading-relaxed">
        {{ message.message_text }}
      </p>

      <div
        v-if="message.daily_report"
        class="mt-2 bg-indigo-700/50 border border-indigo-400/30 rounded-xl p-3 space-y-2 cursor-pointer hover:bg-indigo-700/70 transition"
        @click="emit('openReport', message.daily_report!.id)"
      >
        <div class="flex items-center justify-between text-[11px] text-indigo-200">
          <span class="font-semibold">📋 Дейлик · {{ formatDate(message.daily_report.report_date) }}</span>
          <span v-if="message.daily_report.mood">{{ moodEmoji[message.daily_report.mood] ?? '' }}</span>
        </div>

        <div v-if="message.daily_report.yesterday_text" class="text-xs text-white">
          <div class="text-indigo-200 font-medium mb-0.5">Вчера</div>
          <div class="line-clamp-2 whitespace-pre-wrap">{{ message.daily_report.yesterday_text }}</div>
        </div>
        <div v-if="message.daily_report.today_text" class="text-xs text-white">
          <div class="text-indigo-200 font-medium mb-0.5">Сегодня</div>
          <div class="line-clamp-2 whitespace-pre-wrap">{{ message.daily_report.today_text }}</div>
        </div>
        <div v-if="message.daily_report.blockers_text" class="text-xs text-white">
          <div class="text-amber-300 font-medium mb-0.5">⚠ Блокеры</div>
          <div class="line-clamp-2 whitespace-pre-wrap">{{ message.daily_report.blockers_text }}</div>
        </div>

        <div
          v-if="message.daily_report.self_rating != null || message.daily_report.needs_help"
          class="flex items-center gap-2 pt-1"
        >
          <span
            v-if="message.daily_report.self_rating != null"
            class="text-[10px] bg-white/10 rounded-full px-2 py-0.5 text-white"
          >
            Самооценка: {{ message.daily_report.self_rating }}/10
          </span>
          <span
            v-if="message.daily_report.needs_help"
            class="text-[10px] bg-amber-500/30 text-amber-200 rounded-full px-2 py-0.5"
          >
            🙋 Нужна помощь
          </span>
        </div>

        <div class="text-[10px] text-indigo-300/60 pt-1">Нажми, чтобы открыть</div>
      </div>

      <div class="flex items-center justify-end gap-2 mt-1.5">
        <span v-if="message.pending" class="text-[10px] text-indigo-200">отправка…</span>
        <span v-else-if="message.failed" class="text-[10px] text-red-200">не отправлено</span>

        <span
          v-else-if="message.daily_report"
          class="text-[10px] font-medium bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 rounded-full px-2 py-0.5"
        >
          ✓ Дейлик сохранён
        </span>

        <span
          v-else-if="message.parsed_to_daily_report && !message.daily_report_id"
          class="text-[10px] font-medium bg-slate-600/40 text-slate-400 border border-slate-500/30 rounded-full px-2 py-0.5 italic"
          title="Дейлик, привязанный к этому сообщению, был удалён"
        >
          🗑 Дейлик удалён
        </span>

        <span class="text-[11px] text-indigo-200">{{ formatTime(message.created_at) }}</span>
      </div>
    </div>
  </div>
</template>