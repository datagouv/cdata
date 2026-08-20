<template>
  <BrandedButton
    :href="adminUrl"
    icon-only
    :icon="RiPencilLine"
    color="warning"
    :disabled="!!disabledReason"
    :title="disabledReason ?? t('Éditer le fichier')"
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
  disabledReason?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  isCommunityResource: false,
  disabledReason: null,
})

const { t } = useTranslation()

const adminUrl = computed(() => {
  if (props.isCommunityResource) {
    return `/admin/site/community-resources/?resource_id=${props.resourceId}`
  }

  return `/admin/datasets/${props.datasetId}/files/?resource_id=${props.resourceId}`
})
</script>
