import type { Dataservice, DatasetV2, Reuse } from '@datagouv/components-next'
import { RiArticleLine, RiDatabase2Line, RiLineChartLine, RiTerminalLine } from '@remixicon/vue'
import type { $Fetch } from 'ofetch'
import type { DiscussionSubject, DiscussionSubjectTypes } from '~/types/discussions'

export async function getSubject(api: $Fetch, subject: DiscussionSubject): Promise<DiscussionSubjectTypes | null> {
  switch (subject.class) {
    case 'Dataservice':
      return await api<Dataservice>(`/api/1/dataservices/${subject.id}`)
    case 'Dataset':
      return await api<DatasetV2>(`/api/2/datasets/${subject.id}`)
    case 'Reuse':
      return await api<Reuse>(`/api/1/reuses/${subject.id}`)
    default:
      return null
  };
}

export function getSubjectTitle(subject: DiscussionSubjectTypes) {
  if (subject === null) {
    return ''
  }
  if ('title' in subject) {
    return subject.title
  }

  return throwOnNever(subject as never, `Unknown type ${subject}`)
};

export function getSubjectPage(subject: DiscussionSubjectTypes) {
  if (subject === null) {
    return ''
  }
  if ('page' in subject) {
    return subject.page
  }
  if ('self_web_url' in subject) {
    return subject.self_web_url
  }
  return throwOnNever(subject, `Unknown type ${subject}`)
};

export function getSubjectTypeIcon(subjectClass: DiscussionSubject['class']) {
  switch (subjectClass) {
    case 'Dataservice':
      return RiTerminalLine
    case 'Dataset':
      return RiDatabase2Line
    case 'Post':
      return RiArticleLine
    case 'Reuse':
      return RiLineChartLine
    default:
      return ''
  };
};

export function getDiscussionUrl(discussionId: string, subject: DiscussionSubjectTypes | null) {
  if (!subject) {
    return ''
  }
  return `${getSubjectPage(subject)}#/discussions/${discussionId}`
}
