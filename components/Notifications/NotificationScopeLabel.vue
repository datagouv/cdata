<template>
  <div class="flex items-center gap-1.5">
    <component
      :is="icon"
      class="size-3.5 flex-none"
      aria-hidden="true"
    />
    <span
      v-if="status === 'pending'"
      class="text-gray-medium"
    >
      {{ $t('Chargement…') }}
    </span>
    <CdataLink
      v-else-if="label"
      class="link truncate"
      :to="label.url"
    >
      {{ label.title }}
    </CdataLink>
    <span
      v-else
      class="text-gray-medium"
    >
      {{ $t(`Ce contenu n'est plus accessible`) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { Organization } from '@datagouv/components-next'
import { RiBuilding2Line, RiChat3Line } from '@remixicon/vue'
import CdataLink from '../CdataLink.vue'
import type { Thread } from '~/types/discussions'
import type { NotificationScope } from '~/types/notifications'

const props = defineProps<{
  scope: NotificationScope
}>()

const { $api } = useNuxtApp()

const icon = computed(() => {
  switch (props.scope.class) {
    case 'Organization':
      return RiBuilding2Line
    case 'Discussion':
      return RiChat3Line
    default:
      return getSubjectTypeIcon(props.scope.class)
  }
})

// A decision may outlive the user's access to its subject (a dataset made private or
// deleted): such a scope cannot be loaded and is shown as inaccessible.
const { data: label, status } = useAsyncData(`notification-scope-${props.scope.class}-${props.scope.id}`, async () => {
  const { class: scopeClass, id } = props.scope
  try {
    switch (scopeClass) {
      case 'Organization': {
        const organization = await $api<Organization>(`/api/1/organizations/${id}/`)
        return { title: organization.name, url: organization.page }
      }
      case 'Discussion': {
        const thread = await $api<Thread>(`/api/1/discussions/${id}/`)
        const subject = await getSubject($api, thread.subject)
        return { title: thread.title, url: getDiscussionUrl(thread.id, subject) }
      }
      default: {
        const subject = await getSubject($api, { class: scopeClass, id })
        return subject ? { title: getSubjectTitle(subject), url: getSubjectPage(subject) } : null
      }
    }
  }
  catch {
    return null
  }
}, { server: false, lazy: true })
</script>
