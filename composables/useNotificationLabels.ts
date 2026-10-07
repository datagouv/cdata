import type { NotificationChannel, NotificationEvent, NotificationReason } from '~/types/notifications'

// How notifications are spoken of to the user: why they get one, what kind it is and
// where it reaches them. Shared by the bell, the settings page and the subject pages.
export function useNotificationLabels() {
  const { t } = useTranslation()

  const REASON_PHRASES = computed<Record<NotificationReason, string>>(() => ({
    'owner': t('en tant que propriétaire'),
    'organization.admin': t('en tant qu\'administrateur de l\'organisation'),
    'organization.editor': t('en tant qu\'éditeur de l\'organisation'),
    'organization.partial_editor': t('parce que ce contenu vous est confié'),
    'discussion.participant': t('parce que vous participez à cette discussion'),
    'explicit_subscriber': t('parce que vous suivez ce contenu'),
    'contributor': t('parce que vous avez modifié ce contenu'),
    'requester': t('parce que vous avez fait cette demande'),
    'sysadmin': t('en tant qu\'administrateur du site'),
  }))

  const EVENT_LABELS = computed<Record<string, string>>(() => ({
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

  // "en tant que propriétaire et parce que vous suivez ce contenu"
  function reasonsPhrase(reasons: Array<NotificationReason>) {
    return humanJoin(reasons.map(reason => REASON_PHRASES.value[reason]).filter(Boolean))
  }

  // The label of the type, or of its closest prefix: the five badge types read as badges.
  function eventLabel(event: NotificationEvent) {
    const parts = event.split('.')
    for (let length = parts.length; length > 0; length--) {
      const label = EVENT_LABELS.value[parts.slice(0, length).join('.')]
      if (label) return label
    }
    return event
  }

  // "dans l'application et par e-mail"
  function channelsPhrase(channels: Array<NotificationChannel>) {
    if (channels.includes('app') && channels.includes('mail')) return t('dans l\'application et par e-mail')
    return channels.includes('app') ? t('dans l\'application seulement') : t('par e-mail seulement')
  }

  return { reasonsPhrase, eventLabel, channelsPhrase }
}
