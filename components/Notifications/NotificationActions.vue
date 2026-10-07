<template>
  <div class="space-y-2 text-xs">
    <p
      v-if="reasonLabels.length"
      class="m-0 text-gray-medium"
    >
      {{ t('Vous recevez cette notification {reasons}.', { reasons: humanJoin(reasonLabels) }) }}
    </p>
    <div class="flex flex-wrap gap-2">
      <BrandedButton
        v-for="action in actions"
        :key="action.label"
        color="secondary"
        size="xs"
        :loading="pending === action.label"
        @click="apply(action)"
      >
        {{ action.label }}
      </BrandedButton>
      <BrandedButton
        color="tertiary"
        size="xs"
        href="/admin/me/notifications"
      >
        {{ t('Gérer mes notifications') }}
      </BrandedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, toast } from '@datagouv/components-next'
import type { NotificationReason, NotificationScope, UserNotification } from '~/types/notifications'

type Action = { label: string, run: () => Promise<unknown> }

const props = defineProps<{
  notification: UserNotification
}>()

const { t } = useTranslation()
const { setRule, follow, followSubject } = useNotificationSettings()

const REASON_LABELS = computed<Record<NotificationReason, string>>(() => ({
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

const reasonLabels = computed(() => props.notification.reasons.map(reason => REASON_LABELS.value[reason]).filter(Boolean))

const ignoreSubject = (label: string, scope: NotificationScope): Action => ({ label, run: () => followSubject(scope, false) })

// The subject-level ways out, for the notifications whose subject is known.
function subjectActions(notification: UserNotification): Array<Action> {
  switch (notification.type) {
    case 'discussion.new':
    case 'discussion.comment':
    case 'discussion.closed':
      return [
        { label: t('Ne plus suivre cette discussion'), run: () => follow({ class: 'Discussion', id: notification.details.discussion.id }, 'discussion', false) },
        ignoreSubject(t('Ne rien recevoir sur ce contenu'), notification.details.discussion.subject),
      ]
    case 'reuse.created':
    case 'dataservice.created':
      return [
        ignoreSubject(t('Ne rien recevoir sur ce jeu de données'), { class: 'Dataset', id: notification.details.dataset.id }),
      ]
    case 'organization.badge.certified':
    case 'organization.badge.public-service':
    case 'organization.badge.company':
    case 'organization.badge.association':
    case 'organization.badge.local-authority':
    case 'organization.membership.accepted':
    case 'organization.membership.refused':
      return [
        ignoreSubject(t('Ne rien recevoir sur cette organisation'), { class: 'Organization', id: notification.details.organization.id }),
      ]
    default:
      return []
  }
}

// Every action says "no": on this subject when it is known, and on this kind of
// notification anywhere.
const actions = computed<Array<Action>>(() => [
  ...subjectActions(props.notification),
  { label: t('Ne plus recevoir ce type de notification'), run: () => setRule({ event: props.notification.type }, false) },
])

const pending = ref<string | null>(null)

async function apply(action: Action) {
  pending.value = action.label
  try {
    await action.run()
    toast.success(t('C\'est noté, vous ne recevrez plus ces notifications'))
  }
  finally {
    pending.value = null
  }
}
</script>
