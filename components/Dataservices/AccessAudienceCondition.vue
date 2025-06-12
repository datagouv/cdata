<template>
  <li
    :key="audience"
    class="flex gap-1 items-center"
  >
    <component
      :is="accessAudienceCondition.icon"
      class="size-4"
      :class="accessAudienceCondition.color"
    />
    {{ accessAudienceLabel }}
  </li>
</template>

<script setup lang="ts">
import type { DataserviceAccessAudienceCondition, DataserviceAccessAudienceType } from '@datagouv/components-next'
import { RiCheckDoubleLine, RiCheckLine, RiCloseLine } from '@remixicon/vue'

const props = defineProps<{
  audience: DataserviceAccessAudienceType
  condition: DataserviceAccessAudienceCondition
}>()

const { t } = useI18n()

const accessAudienceCondition = computed(() => {
  return {
    yes: { icon: RiCheckDoubleLine, label: t('Oui'), color: 'text-success-dark' },
    no: { icon: RiCloseLine, label: t('Non'), color: 'text-danger-dark' },
    under_condition: { icon: RiCheckLine, label: t('Sous condition'), color: 'text-warning-dark' },
  }[props.condition]
})

const accessAudienceLabel = computed(() => {
  return {
    local_authority_and_administration: t('Collectivé et Administration'),
    company_and_association: t('Entreprise et Association'),
    private: t('Particulier'),
  }[props.audience]
})
</script>
