<template>
  <BrandedButton
    :href="adminUrl"
    icon-only
    :icon="RiPencilLine"
    color="warning"
    :disabled="disabled"
    :title="disabled ? t('Vous ne pouvez pas modifier cette ressource car elle est synchronisée avec cartes.gouv.fr') : t('Éditer le fichier')"
    data-testid="edit-button"
  />
</template>

<script setup lang="ts">
import { RiPencilLine } from '@remixicon/vue'
import { computed } from 'vue'
import BrandedButton from '../BrandedButton.vue'
import { useTranslation } from '../../composables/useTranslation'

type Props = {
  datasetId: string
  isCommunityResource?: boolean
  resourceId: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isCommunityResource: false,
  disabled: false,
})

const { t } = useTranslation()

const adminUrl = computed(() => {
  if (props.isCommunityResource) {
    return `/admin/site/community-resources/?resource_id=${props.resourceId}`
  }

  return `/admin/datasets/${props.datasetId}/files/?resource_id=${props.resourceId}`
})
</script>
