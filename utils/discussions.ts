import { throwOnNever, type Dataservice, type DatasetV2, type Reuse, type TopicV2, type TranslationFunction } from '@datagouv/components-next'
import { RiArticleLine, RiBookShelfLine, RiBuilding2Line, RiChat3Line, RiDatabase2Line, RiLineChartLine, RiTerminalLine } from '@remixicon/vue'
import type { Comment, DiscussionSubject, DiscussionSubjectTypes, Thread } from '~/types/discussions'
import type { Post } from '~/types/posts'
import type { ApiFetch } from '~/types/types'

export async function getSubject(api: ApiFetch, subject: DiscussionSubject): Promise<DiscussionSubjectTypes | null> {
  switch (subject.class) {
    case 'Dataservice':
      return await api<Dataservice>(`/api/1/dataservices/${subject.id}/`)
    case 'Dataset':
      return await api<DatasetV2>(`/api/2/datasets/${subject.id}/`)
    case 'Reuse':
      return await api<Reuse>(`/api/1/reuses/${subject.id}/`)
    case 'Post':
      return await api<Post>(`/api/1/posts/${subject.id}/`)
    case 'Topic':
      return await api<TopicV2>(`/api/2/topics/${subject.id}/`)
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
  if ('name' in subject) {
    return subject.name
  }

  return throwOnNever(subject as never, `Unknown type ${subject}`)
};

export function getSubjectPage(subject: DiscussionSubjectTypes) {
  if (subject === null) {
    return ''
  }
  // TODO: remove once udata#3765 is merged. Until then the topic API doesn't
  // return `page`, so the `'page' in subject` check below fails at runtime and
  // we'd hit throwOnNever. Matching on `elements` (always present on topics)
  // avoids the crash while the field is missing.
  if ('elements' in subject) {
    return subject.page
  }
  if ('page' in subject) {
    return subject.page
  }
  if ('self_web_url' in subject) {
    return subject.self_web_url
  }
  return throwOnNever(subject, `Unknown type ${subject}`)
};

export function getSubjectTypeIcon(subjectClass: DiscussionSubject['class'] | 'Discussion') {
  switch (subjectClass) {
    case 'Dataservice':
      return RiTerminalLine
    case 'Dataset':
      return RiDatabase2Line
    case 'Post':
      return RiArticleLine
    case 'Reuse':
      return RiLineChartLine
    case 'Topic':
      return RiBookShelfLine
    case 'Organization':
      return RiBuilding2Line
    case 'Discussion':
      return RiChat3Line
  };
  return throwOnNever(subjectClass, `Unknown type ${subjectClass}`)
};

// How a sentence points at a subject of this class: "ce jeu de données", "cette API"…
export function getSubjectDemonstrative(t: TranslationFunction, subjectClass: DiscussionSubject['class'] | 'Discussion') {
  switch (subjectClass) {
    case 'Dataservice':
      return t('cette API')
    case 'Dataset':
      return t('ce jeu de données')
    case 'Post':
      return t('cet article')
    case 'Reuse':
      return t('cette réutilisation')
    case 'Topic':
      return t('cette thématique')
    case 'Organization':
      return t('cette organisation')
    case 'Discussion':
      return t('cette discussion')
  };
  return throwOnNever(subjectClass, `Unknown type ${subjectClass}`)
}

export function getDiscussionUrl(discussionId: string, subject: DiscussionSubjectTypes | null) {
  if (!subject) {
    return ''
  }
  return `${getSubjectPage(subject)}/discussions?discussion_id=${discussionId}`
}

export function isProducerOfSubject(subject: DiscussionSubjectTypes, comment: Comment): boolean {
  if (subject.owner && !comment.posted_by_organization && subject.owner.id === comment.posted_by.id) {
    return true
  }

  if ('organization' in subject && subject.organization && comment.posted_by_organization && subject.organization.id == comment.posted_by_organization.id) {
    return true
  }

  return false
}

export function getLastComment(discussion: Thread): Comment {
  return discussion.discussion.slice(-1)[0]
}
