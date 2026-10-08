import type { NotificationEvent, NotificationReason, NotificationRuleKey, NotificationScope } from '~/types/notifications'
import { getSubjectDemonstrative } from '~/utils/discussions'

// How notifications are spoken of to the user: why they get one, what kind it is and
// where it reaches them. Shared by the bell, the settings page and the subject pages.
export function useNotificationLabels() {
  const { t } = useTranslation()

  const REASON_PHRASES = computed<Record<NotificationReason, string>>(() => ({
    'owner': t('en tant que propriétaire'),
    'organization.admin': t('en tant qu\'administrateur de l\'organisation'),
    'organization.editor': t('en tant qu\'éditeur de l\'organisation'),
    'organization.partial_editor': t('parce que ce contenu vous est assigné'),
    'discussion.participant': t('parce que vous participez à cette discussion'),
    'explicit_subscriber': t('parce que vous suivez ce contenu'),
    'contributor': t('parce que vous avez modifié ce contenu'),
    'discussant': t('parce que vous avez participé aux discussions de ce contenu'),
    'requester': t('parce que vous avez fait cette demande'),
  }))

  const EVENT_LABELS = computed<Partial<Record<NotificationEvent, string>>>(() => ({
    'discussion': t('Discussions'),
    'discussion.new': t('Nouvelles discussions'),
    'discussion.comment': t('Réponses aux discussions'),
    'discussion.closed': t('Discussions clôturées'),
    'reuse.created': t('Nouvelles réutilisations'),
    'dataservice.created': t('Nouvelles API'),
    'organization.badge': t('Badges de l\'organisation'),
    'organization.membership.accepted': t('Adhésions acceptées'),
    'organization.membership.refused': t('Adhésions refusées'),
    'harvest.source.accepted': t('Moissonneurs validés'),
    'harvest.source.refused': t('Moissonneurs refusés'),
  }))

  // "en tant que propriétaire et parce que vous suivez ce contenu". A partial editor hears
  // about what is assigned to them, and about the organization itself as a whole: nothing
  // of it was assigned to them then.
  function reasonsPhrase(reasons: Array<NotificationReason>, aboutOrganization = false) {
    return humanJoin(reasons.map(reason =>
      reason === 'organization.partial_editor' && aboutOrganization
        ? t('en tant qu\'éditeur partiel de l\'organisation')
        : REASON_PHRASES.value[reason],
    ).filter(Boolean))
  }

  // `toString` and the like are no events.
  function labelOf(name: string): string | null {
    return Object.hasOwn(EVENT_LABELS.value, name) ? EVENT_LABELS.value[name as NotificationEvent]! : null
  }

  // The label of an event, or of its closest prefix: the five badge types read as badges.
  function eventLabel(event: NotificationEvent) {
    const parts = event.split('.')
    for (let length = parts.length; length > 0; length--) {
      const label = labelOf(parts.slice(0, length).join('.'))
      if (label) return label
    }
    return event
  }

  // A name read from outside (a link) as an event: one of those a link names, a type or
  // a prefix udata accepts too, nothing that merely starts like one.
  function knownEvent(name: string): NotificationEvent | null {
    return labelOf(name) === null ? null : name as NotificationEvent
  }

  // A subject in a sentence: by its title when the caller knows it, "ce jeu de données"
  // otherwise.
  function subjectPhrase(subjectClass: NotificationScope['class'], title?: string | null) {
    if (!title) return getSubjectDemonstrative(t, subjectClass)
    return subjectClass === 'Discussion' ? t('la discussion « {title} »', { title }) : `« ${title} »`
  }

  // What the toast says once a "stop" is done, wherever it was asked from.
  function mutedMessage(key: NotificationRuleKey, title?: string | null) {
    if (key.scope?.class === 'Discussion') return t('Vous ne suivez plus {subject}', { subject: subjectPhrase('Discussion', title) })
    if (key.scope) return t('Vous ne recevrez plus de notifications sur {subject}', { subject: subjectPhrase(key.scope.class, title) })
    return t('Vous ne recevrez plus : {type}', { type: eventLabel(key.event!) })
  }

  return { reasonsPhrase, eventLabel, knownEvent, subjectPhrase, mutedMessage }
}
