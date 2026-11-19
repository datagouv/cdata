import type { Report, ReportSubject } from '@datagouv/components-next'
import { getSwitchToPrivateMethodAndUrl } from '~/utils/reports'

export async function dismissReport(report: Report) {
  await useNuxtApp().$api(`/api/1/reports/${report.id}/`, {
    method: 'PATCH',
    body: { dismissed_at: new Date() },
  })
}

export async function switchSubjectToPrivate(subject: ReportSubject) {
  const methodAndUrl = getSwitchToPrivateMethodAndUrl(subject)
  if (!methodAndUrl) return

  await useNuxtApp().$api(methodAndUrl.url, {
    method: methodAndUrl.method,
    body: { private: true },
  })
}
