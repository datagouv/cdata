<template>
  <div class="proposal-contact">
    <component
      :is="link ? 'a' : 'span'"
      :href="link"
      :rel="link ? 'ugc nofollow noopener' : undefined"
      :target="link ? '_blank' : undefined"
      :title="label"
    >
      {{ label || t('Contact non renseigné') }}
    </component>
    <span
      v-if="role"
      class="proposal-contact-role"
    >{{ role }}</span>
  </div>
</template>

<script setup lang="ts">
import type { ContactPoint } from '@datagouv/components-next'

const props = defineProps<{
  contact: ContactPoint
}>()

const { t } = useTranslation()

const link = computed(() => {
  if (props.contact.email) return `mailto:${props.contact.email}`
  if (props.contact.contact_form) return props.contact.contact_form
  return null
})

const label = computed(() => props.contact.name || props.contact.email || props.contact.contact_form)

const role = computed(() => ({
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
}[props.contact.role]))
</script>

<style scoped>
.proposal-contact {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 8px;
  min-width: 0;
  font-family: var(--font-marianne);
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  overflow-wrap: anywhere;
}

.proposal-contact a,
.proposal-contact a:visited {
  color: var(--color-gray-title);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  background-image: none;
  overflow-wrap: anywhere;
  --underline-img: none;
}

.proposal-contact a:hover,
.proposal-contact a:active,
.proposal-contact a:focus-visible {
  color: var(--color-new-primary);
}

.proposal-contact a:focus-visible {
  outline: 2px solid var(--color-new-focus);
  outline-offset: 2px;
}

.proposal-contact-role {
  color: var(--color-gray-secondary);
  font-size: 12px;
  line-height: 18px;
}
</style>
