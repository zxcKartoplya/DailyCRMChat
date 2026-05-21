<script setup lang="ts">
import type { DailyReport } from '~/types'

const props = defineProps<{ report: DailyReport | null }>()
const emit = defineEmits<{ close: [] }>()

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const moodLabels: Record<string, string> = {
  great: '😊 Отлично',
  good: '🙂 Хорошо',
  neutral: '😐 Нейтрально',
  bad: '😕 Плохо',
  terrible: '😞 Ужасно',
}

function ratingColor(r: number | null): string {
  if (!r) return 'text-slate-400'
  if (r <= 4) return 'text-red-400'
  if (r <= 6) return 'text-yellow-400'
  return 'text-emerald-400'
}

const statusConfig = {
  submitted: { label: 'Отправлен', classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  draft: { label: 'Черновик', classes: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  imported: { label: 'Импорт', classes: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
} as const
</script>

<template>
  <Transition name="modal">
    <div
      v-if="report"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="emit('close')"
    >
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')" />
      <div class="relative z-10 w-full max-w-lg bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div>
            <p class="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Дейлик</p>
            <h2 class="text-base font-semibold text-white">{{ formatDate(report.report_date) }}</h2>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="text-[11px] font-medium border rounded-full px-2.5 py-0.5"
              :class="statusConfig[report.status]?.classes ?? statusConfig.draft.classes"
            >
              {{ statusConfig[report.status]?.label ?? report.status }}
            </span>
            <button
              class="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-700"
              @click="emit('close')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="px-5 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
          <div v-if="report.yesterday_text" class="space-y-1">
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Вчера</p>
            <p class="text-sm text-slate-200 whitespace-pre-wrap">{{ report.yesterday_text }}</p>
          </div>
          <div v-if="report.today_text" class="space-y-1">
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Сегодня</p>
            <p class="text-sm text-slate-200 whitespace-pre-wrap">{{ report.today_text }}</p>
          </div>
          <div v-if="report.blockers_text" class="space-y-1">
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Блокеры</p>
            <p class="text-sm text-slate-200 whitespace-pre-wrap">{{ report.blockers_text }}</p>
          </div>
          <div class="flex flex-wrap gap-4 pt-1">
            <div v-if="report.mood" class="flex flex-col gap-0.5">
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Настроение</p>
              <p class="text-sm text-slate-200">{{ moodLabels[report.mood] ?? report.mood }}</p>
            </div>
            <div v-if="report.self_rating" class="flex flex-col gap-0.5">
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Самооценка</p>
              <p class="text-2xl font-bold" :class="ratingColor(report.self_rating)">
                {{ report.self_rating }}<span class="text-sm text-slate-400 font-normal">/10</span>
              </p>
            </div>
            <div class="flex flex-col gap-0.5">
              <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Нужна помощь</p>
              <p class="text-sm" :class="report.needs_help ? 'text-amber-400' : 'text-slate-400'">
                {{ report.needs_help ? '⚠️ Да' : 'Нет' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
