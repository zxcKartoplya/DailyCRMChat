<script setup lang="ts">
import type { DailyReport } from '~/types'

const props = defineProps<{ report: DailyReport | null }>()
const emit = defineEmits<{ close: []; deleted: [id: number]; updated: [report: DailyReport] }>()

const reportsStore = useReportsStore()
const chatStore = useChatStore()

const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const confirmDelete = ref(false)

const draft = ref<Partial<DailyReport>>({})

watch(() => props.report, (r) => {
  isEditing.value = false
  confirmDelete.value = false
  draft.value = r ? { ...r } : {}
}, { immediate: true })

function startEdit() {
  if (!props.report) return
  draft.value = { ...props.report }
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  draft.value = props.report ? { ...props.report } : {}
}

async function save() {
  if (!props.report) return
  saving.value = true
  try {
    const updated = await reportsStore.updateReport(props.report.id, {
      yesterday_text: draft.value.yesterday_text,
      today_text: draft.value.today_text,
      blockers_text: draft.value.blockers_text,
      mood: draft.value.mood,
      self_rating: draft.value.self_rating,
      needs_help: draft.value.needs_help,
      status: draft.value.status,
    })
    isEditing.value = false
    emit('updated', updated)
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  if (!props.report) return
  deleting.value = true
  try {
    const id = props.report.id
    await reportsStore.deleteReport(id)
    chatStore.detachReportFromMessages(id)
    emit('deleted', id)
    emit('close')
  } finally {
    deleting.value = false
  }
}

function formatDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('ru-RU', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

const moodLabels: Record<string, string> = {
  great: '😊 Отлично', good: '🙂 Хорошо', neutral: '😐 Нейтрально',
  bad: '😕 Плохо', terrible: '😞 Ужасно',
}

const moods = [
  { value: 'great', label: '😊 Отлично' },
  { value: 'good', label: '🙂 Хорошо' },
  { value: 'neutral', label: '😐 Нейтрально' },
  { value: 'bad', label: '😕 Плохо' },
  { value: 'terrible', label: '😞 Ужасно' },
]

function ratingColor(r: number | null | undefined): string {
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
            <p class="text-xs text-slate-400 uppercase tracking-wider mb-0.5">
              {{ isEditing ? 'Редактирование дейлика' : 'Дейлик' }}
            </p>
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

        <!-- Body: VIEW MODE -->
        <div v-if="!isEditing" class="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
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

        <!-- Body: EDIT MODE -->
        <div v-else class="px-5 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <div>
            <label class="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Вчера</label>
            <textarea
              v-model="draft.yesterday_text"
              rows="2"
              class="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Сегодня</label>
            <textarea
              v-model="draft.today_text"
              rows="2"
              class="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div>
            <label class="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Блокеры</label>
            <textarea
              v-model="draft.blockers_text"
              rows="2"
              class="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div class="flex flex-wrap gap-3">
            <div class="flex-1 min-w-[160px]">
              <label class="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Настроение</label>
              <select
                v-model="draft.mood"
                class="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option :value="null">—</option>
                <option v-for="m in moods" :key="m.value" :value="m.value">{{ m.label }}</option>
              </select>
            </div>
            <div class="w-32">
              <label class="block text-xs text-slate-400 mb-1 uppercase tracking-wider">Самооценка</label>
              <input
                v-model.number="draft.self_rating"
                type="number"
                min="1" max="10"
                class="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <label class="flex items-center gap-2 cursor-pointer text-sm text-slate-200 pt-1">
            <input v-model="draft.needs_help" type="checkbox" class="rounded" />
            Нужна помощь
          </label>
        </div>

        <!-- Footer -->
        <div class="px-5 py-3 border-t border-slate-700 flex items-center justify-between gap-2">
          <!-- View mode actions -->
          <template v-if="!isEditing && !confirmDelete">
            <button
              class="text-sm text-red-400 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-red-900/20 transition-colors"
              @click="confirmDelete = true"
            >
              🗑 Удалить
            </button>
            <div class="flex gap-2">
              <button
                class="text-sm text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors"
                @click="emit('close')"
              >
                Закрыть
              </button>
              <button
                class="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                @click="startEdit"
              >
                Изменить
              </button>
            </div>
          </template>

          <!-- Delete confirmation -->
          <template v-else-if="confirmDelete">
            <p class="text-sm text-slate-300">Удалить дейлик и связанное сообщение?</p>
            <div class="flex gap-2">
              <button
                :disabled="deleting"
                class="text-sm text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-40"
                @click="confirmDelete = false"
              >
                Отмена
              </button>
              <button
                :disabled="deleting"
                class="text-sm bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-40"
                @click="doDelete"
              >
                {{ deleting ? 'Удаление…' : 'Удалить' }}
              </button>
            </div>
          </template>

          <!-- Edit mode actions -->
          <template v-else>
            <div />
            <div class="flex gap-2">
              <button
                :disabled="saving"
                class="text-sm text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-40"
                @click="cancelEdit"
              >
                Отмена
              </button>
              <button
                :disabled="saving"
                class="text-sm bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-40"
                @click="save"
              >
                {{ saving ? 'Сохранение…' : 'Сохранить' }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }
</style>