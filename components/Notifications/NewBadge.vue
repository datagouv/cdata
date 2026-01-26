<template>
  <div class="p-3 flex gap-3 relative hover:bg-gray-some">
    <div class="flex-none">
      <RiCheckboxCircleLine class="size-4" />
    </div>
    <div class="flex-1 truncate">
      <p class="m-0 text-xs font-bold">
        {{ $t(`Votre organisation a été {badge}`, { badge }) }}
      </p>
      <OrganizationOwner
        :organization="notification.details.organization as OrganizationReference"
        logo-size-class="size-3"
        :logo-no-border="true"
        name-size="xs"
        name-color="text-gray-plain"
        :with-link="false"
      />
    </div>
    <div class="flex-none flex m-0 gap-1.5">
      <p class="m-0 text-xs">
        {{ formatDate(notification.created_at) }}
      </p>
      <AnimatedLoader
        v-if="loading"
        class="size-2"
      />
      <div
        v-else-if="!notification.handled_at"
        class="size-2 rounded-full bg-new-primary mt-0.5"
      />
    </div>
    <button
      v-if="!notification.handled_at"
      class="after:absolute after:inset-0 bg-none"
      :title="$t('Marquer la notification comme lue')"
      @click="markAsRead"
    />
  </div>
</template>

<script setup lang="ts">
import { RiCheckboxCircleLine } from '@remixicon/vue'
import type { DeepReadonly } from 'vue'
import { AnimatedLoader, throwOnNever, useFormatDate } from '@datagouv/components-next'
import type { OrganizationReference } from '@datagouv/components-next'
import type { NewBadgeNotification } from '~/types/notifications'

const props = defineProps<{
  notification: DeepReadonly<NewBadgeNotification>
}>()

const { refreshNotifications } = useNotifications()
const { formatDate } = useFormatDate()
const { $api } = useNuxtApp()
const { t } = useTranslation()
const loading = ref(false)

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

async function markAsRead() {
  try {
    loading.value = true
    await $api(`/api/1/notifications/${props.notification.id}/read/`, { method: 'POST' })
    await refreshNotifications()
  }
  finally {
    loading.value = false
  }
}
</script>
