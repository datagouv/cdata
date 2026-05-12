<template>
  <NotificationLayout
    :icon="RiCheckboxCircleLine"
    :title="$t(`Votre organisation a été {badge}`, { badge })"
    :notification="notification"
    :requires-action="false"
  >
    <OrganizationOwner
      :organization="notification.details.organization as OrganizationReference"
      logo-size-class="size-3"
      :logo-no-border="true"
      name-size="xs"
      name-color="text-gray-plain"
      :with-link="false"
    />
  </NotificationLayout>
</template>

<script setup lang="ts">
import { RiCheckboxCircleLine } from '@remixicon/vue'
import { throwOnNever } from '@datagouv/components-next'
import type { OrganizationReference } from '@datagouv/components-next'
import type { NewBadgeNotification } from '~/types/notifications'
import NotificationLayout from './NotificationLayout.vue'

const props = defineProps<{
  notification: NewBadgeNotification
}>()

const { t } = useTranslation()

const badge = computed(() => {
  switch (props.notification.details.kind) {
    case 'certified':
      return t('certifiée')
    case 'association':
      return t('identifiée comme association')
    case 'company':
      return t('identifiée comme entreprise')
    case 'local-authority':
      return t('identifiée comme collectivité territoriale')
    case 'public-service':
      return t('identifiée comme service public')
    default:
      return throwOnNever(props.notification.details.kind, 'No other type')
  }
})
</script>
