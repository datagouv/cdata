import type { Dataservice, DatasetV2, DatasetV2WithFullObject, Organization, Report, ReportReason, ReportSubject, Reuse, User } from '@datagouv/components-next'
import type { ObjectType } from '~/types/delete'
import type { Thread } from '~/types/discussions'

// The reasons are loaded apart from the reports: until then, the raw value stands in for the label
export function getReportReasonLabel(report: Report, reasons: Array<ReportReason> | null | undefined): string {
  return reasons?.find(reason => reason.value === report.reason)?.label || report.reason
}

export function getReportSubjectTitle(subject: DatasetV2 | DatasetV2WithFullObject | Dataservice | Reuse | Organization | Thread | User | null | undefined): string | undefined {
  if (!subject) return undefined
  if ('title' in subject) return subject.title
  if ('name' in subject) return subject.name
  if ('first_name' in subject) return `${subject.first_name} ${subject.last_name}`.trim() || subject.slug
  return undefined
}

// Only the objects with a draft state can be hidden: an organization or a user cannot.
export function getSwitchToPrivateMethodAndUrl(subject: ReportSubject): { method: 'PUT' | 'PATCH', url: string } | null {
  return {
    Dataset: { method: 'PUT' as const, url: `/api/1/datasets/${subject.id}/` },
    Dataservice: { method: 'PATCH' as const, url: `/api/1/dataservices/${subject.id}/` },
    Reuse: { method: 'PUT' as const, url: `/api/1/reuses/${subject.id}/` },
    Organization: null,
    Discussion: null,
    User: null,
  }[subject.class]
}

// `embedId` is a comment of the discussion (`Report.subject_embed_id`)
export function getDeleteUrl(subject: ReportSubject, embedId: string | null = null): string {
  if (subject.class === 'Discussion' && embedId) {
    return `/api/1/discussions/${subject.id}/comments/${embedId}/`
  }

  return {
    Dataset: `/api/1/datasets/${subject.id}/`,
    Dataservice: `/api/1/dataservices/${subject.id}/`,
    Reuse: `/api/1/reuses/${subject.id}/`,
    Organization: `/api/1/organizations/${subject.id}/`,
    Discussion: `/api/1/discussions/${subject.id}/`,
    User: `/api/1/users/${subject.id}/`,
  }[subject.class]
}

export function getObjectType(subjectClass: ReportSubject['class']): ObjectType {
  return ({
    Dataset: 'dataset',
    Dataservice: 'dataservice',
    Reuse: 'reuse',
    Organization: 'organization',
    Discussion: 'discussion',
    User: 'user',
  } as const)[subjectClass]
}
