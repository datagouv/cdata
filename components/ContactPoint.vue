<template>
  <div class="text-sm space-x-2">
    <component
      :is="link ? 'a' : 'span'"
      :href="link"
      rel="ugc nofollow noopener"
      :target="link ? '_blank' : undefined"
      class="text-grey-title text-overflow-ellipsis overflow-hidden"
    >
      {{ label }}
    </component>
    <small class="text-grey-medium italic">({{ role }})</small>
  </div>
</template>

<script setup lang="ts">
import type { ContactPoint } from '~/types/types'

const props = defineProps<{
  contact: ContactPoint
}>()

const { t } = useI18n()

const link = computed(() => {
  if (props.contact.email) {
    return `mailto:${props.contact.email}`
  }

  if (props.contact.contact_form) {
    return props.contact.contact_form
  }

  return null
})

const label = computed(() => {
  return props.contact.name || props.contact.email || props.contact.contact_form
})

const role = computed(() => {
  return {
    contact: t('Contact'),
    creator: t('Créateur'),
    publisher: t('Éditeur'),
  }[props.contact.role]
})
</script>
