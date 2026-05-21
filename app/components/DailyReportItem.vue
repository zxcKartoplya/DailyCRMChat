<script setup lang="ts">
import type { DailyReport } from '~/types'

const props = defineProps<{ report: DailyReport }>()
const emit = defineEmits<{ click: [report: DailyReport] }>()

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const statusConfig = {
  submitted: { label: 'Отправлен', classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  draft: { label: 'Черновик', classes: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  imported: { label: 'Импорт', classes: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
} as const
</script>

<template>
  <button
    class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-700 transition-colors text-left group"
    @click="emit('click', report)"
  >
    <div class="flex flex-col gap-0.5 min-w-0">
      <span class="text-sm font-medium text-slate-200 group-hover:text-white transition-colors truncate">
        {{ formatDate(report.report_date) }}
      </span>
      <span v-if="report.self_rating" class="text-xs text-slate-400">
        Оценка: {{ report.self_rating }}/10
      </span>
    </div>
    <span
      class="text-[10px] font-medium border rounded-full px-2 py-0.5 whitespace-nowrap ml-2 flex-shrink-0"
      :class="statusConfig[report.status]?.classes ?? statusConfig.draft.classes"
    >
      {{ statusConfig[report.status]?.label ?? report.status }}
    </span>
  </button>
</template>
