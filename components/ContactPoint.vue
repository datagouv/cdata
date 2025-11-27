<template>
  <div>
    <div
      class="text-sm space-x-2"
      :class="{ inline: !link, flex: link }"
    >
      <component
        :is="link ? 'a' : 'span'"
        :href="link"
        :rel="link ? 'ugc nofollow noopener' : undefined"
        :target="link ? '_blank' : undefined"
        :title="label"
        class="text-grey-title"
        :class="{ truncate: link }"
      >
        {{ label }}
      </component>
      <small class="text-grey-medium italic">({{ role }})</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContactPoint } from '@datagouv/components-next'

const props = defineProps<{
  contact: ContactPoint
}>()

const { t } = useTranslation()

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
    rightsHolder: t('Détenteur des droits'),
    custodian: t('Gestionnaire'),
    distributor: t('Distributeur'),
    originator: t('Producteur'),
    principalInvestigator: t('Investigateur principal'),
    processor: t('Exécutant'),
    resourceProvider: t('Fournisseur'),
    user: t('Utilisateur'),
  }[props.contact.role]
})
</script>
