<script setup lang="ts">
import type { InternalChatDailyReportPayload } from '~/types'

const props = defineProps<{
  modelValue: InternalChatDailyReportPayload
  hasReportForDate: boolean
}>()
const emit = defineEmits<{
  'update:modelValue': [v: InternalChatDailyReportPayload]
}>()

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function update(key: keyof InternalChatDailyReportPayload, value: unknown) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

const moods = [
  { value: 'great', label: '😊 Отлично' },
  { value: 'good', label: '🙂 Хорошо' },
  { value: 'neutral', label: '😐 Нейтрально' },
  { value: 'bad', label: '😕 Плохо' },
  { value: 'terrible', label: '😞 Ужасно' },
]

function ratingColor(r: number): string {
  if (r <= 4) return 'text-red-400'
  if (r <= 6) return 'text-yellow-400'
  return 'text-emerald-400'
}
</script>

<template>
  <div class="space-y-3">
    <div v-if="hasReportForDate" class="flex items-center gap-2 text-xs bg-amber-900/30 border border-amber-700/40 text-amber-300 rounded-lg px-3 py-2">
      <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M12 3a9 9 0 110 18A9 9 0 0112 3z" />
      </svg>
      Дейлик за эту дату уже существует, он будет обновлён
    </div>

    <!-- Date + Status row -->
    <div class="flex gap-3">
      <div class="flex-1">
        <label class="block text-xs text-slate-400 mb-1">Дата отчёта</label>
        <input
          :value="modelValue.report_date ?? today()"
          type="date"
          class="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          @input="update('report_date', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="flex-shrink-0">
        <label class="block text-xs text-slate-400 mb-1">Статус</label>
        <div class="flex gap-2 mt-1">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              :checked="(modelValue.status ?? 'submitted') === 'submitted'"
              class="accent-indigo-500"
              @change="update('status', 'submitted')"
            />
            <span class="text-sm text-slate-300">Отправить</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              :checked="modelValue.status === 'draft'"
              class="accent-indigo-500"
              @change="update('status', 'draft')"
            />
            <span class="text-sm text-slate-300">Черновик</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Yesterday -->
    <div>
      <label class="block text-xs text-slate-400 mb-1">Вчера</label>
      <textarea
        :value="modelValue.yesterday_text ?? ''"
        rows="2"
        placeholder="Что сделал вчера?"
        class="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        @input="update('yesterday_text', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>

    <!-- Today -->
    <div>
      <label class="block text-xs text-slate-400 mb-1">Сегодня</label>
      <textarea
        :value="modelValue.today_text ?? ''"
        rows="2"
        placeholder="Что планирую сегодня?"
        class="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        @input="update('today_text', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>

    <!-- Blockers -->
    <div>
      <label class="block text-xs text-slate-400 mb-1">Блокеры / проблемы</label>
      <textarea
        :value="modelValue.blockers_text ?? ''"
        rows="2"
        placeholder="Блокеры / проблемы"
        class="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
        @input="update('blockers_text', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>

    <!-- Mood + self_rating -->
    <div class="flex gap-3">
      <div class="flex-1">
        <label class="block text-xs text-slate-400 mb-1">Настроение</label>
        <select
          :value="modelValue.mood ?? ''"
          class="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          @change="update('mood', ($event.target as HTMLSelectElement).value || undefined)"
        >
          <option value="">— не указано —</option>
          <option v-for="m in moods" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </div>
      <div class="w-28">
        <label class="block text-xs text-slate-400 mb-1">
          Самооценка:
          <span
            class="font-bold ml-0.5"
            :class="ratingColor(modelValue.self_rating ?? 5)"
          >{{ modelValue.self_rating ?? '—' }}</span>
        </label>
        <input
          :value="modelValue.self_rating ?? 5"
          type="range"
          min="1"
          max="10"
          class="w-full accent-indigo-500 mt-1.5"
          @input="update('self_rating', Number(($event.target as HTMLInputElement).value))"
        />
        <div class="flex justify-between text-[10px] text-slate-500 mt-0.5">
          <span>1</span><span>10</span>
        </div>
      </div>
    </div>

    <!-- Needs help -->
    <label class="flex items-center gap-2.5 cursor-pointer select-none">
      <input
        type="checkbox"
        :checked="modelValue.needs_help ?? false"
        class="w-4 h-4 accent-indigo-500 rounded"
        @change="update('needs_help', ($event.target as HTMLInputElement).checked)"
      />
      <span class="text-sm text-slate-300">Нужна помощь</span>
    </label>
  </div>
</template>
