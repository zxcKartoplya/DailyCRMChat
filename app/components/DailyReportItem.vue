<script setup lang="ts">
import type { DailyReport } from '~/types'

defineProps<{ report: DailyReport }>()
const emit = defineEmits<{
  click: []
  edit: []
  delete: []
}>()
</script>

<template>
  <div
    class="group relative px-3 py-2.5 rounded-lg hover:bg-slate-700/60 cursor-pointer transition-colors"
    @click="emit('click')"
  >
    <div class="flex items-center justify-between gap-2">
      <div class="min-w-0 flex-1">
        <p class="text-sm text-white font-medium truncate">
          {{ new Date(report.report_date + 'T00:00:00').toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }) }}
        </p>
        <p class="text-xs text-slate-400 truncate">
          {{ report.today_text || report.yesterday_text || 'Без описания' }}
        </p>
      </div>
      <!-- action buttons, visible on hover -->
      <div class="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          title="Изменить"
          class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded transition-colors"
          @click.stop="emit('edit')"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          title="Удалить"
          class="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded transition-colors"
          @click.stop="emit('delete')"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>