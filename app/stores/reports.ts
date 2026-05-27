import { defineStore } from 'pinia'
import type { DailyReport } from '~/types'

export const useReportsStore = defineStore('reports', () => {
  const { apiFetch } = useApi()
  const dailyReports = ref<DailyReport[]>([])
  const loading = ref(false)

  async function loadReports(params?: { date_from?: string; date_to?: string }): Promise<void> {
    loading.value = true
    try {
      const query = new URLSearchParams()
      if (params?.date_from) query.set('date_from', params.date_from)
      if (params?.date_to) query.set('date_to', params.date_to)
      const qs = query.toString()
      const data = await apiFetch<DailyReport[]>(`/employee/daily-reports${qs ? `?${qs}` : ''}`)
      dailyReports.value = [...data].sort(
        (a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime(),
      )
    } finally {
      loading.value = false
    }
  }

  function reportForDate(date: string): DailyReport | undefined {
    return dailyReports.value.find((r) => r.report_date === date)
  }

  async function updateReport(id: number, payload: Partial<DailyReport>): Promise<DailyReport> {
    const updated = await apiFetch<DailyReport>(`/employee/daily-reports/${id}`, {
      method: 'PUT',
      body: payload,
    })
    const idx = dailyReports.value.findIndex(r => r.id === id)
    if (idx !== -1) dailyReports.value[idx] = updated
    return updated
  }

  async function deleteReport(id: number): Promise<void> {
    await apiFetch(`/employee/daily-reports/${id}`, { method: 'DELETE' })
    dailyReports.value = dailyReports.value.filter(r => r.id !== id)
  }

  return { dailyReports, loading, loadReports, reportForDate, updateReport, deleteReport }
})
