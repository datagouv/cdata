import type { NotificationEvent, NotificationReason } from '~/types/notifications'

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
    'sysadmin': t('en tant qu\'administrateur du site'),
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

  // The label of a name, or of its closest prefix: the five badge types read as badges.
  // `null` for a name of no known type.
  function knownLabel(name: string): string | null {
    const parts = name.split('.')
    for (let length = parts.length; length > 0; length--) {
      // A prefix of a type is an event name itself.
      const label = EVENT_LABELS.value[parts.slice(0, length).join('.') as NotificationEvent]
      if (label) return label
    }
    return null
  }

  function eventLabel(event: NotificationEvent) {
    return knownLabel(event) ?? event
  }

  // A name read from outside (a link) as an event, if it is one with a label.
  function knownEvent(name: string): NotificationEvent | null {
    return knownLabel(name) === null ? null : name as NotificationEvent
  }

  return { reasonsPhrase, eventLabel, knownEvent }
}
