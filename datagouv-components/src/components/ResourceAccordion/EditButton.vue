<template>
  <BrandedButton
    :href="adminUrl"
    icon-only
    :icon="RiPencilLine"
    color="warning"
    data-testid="edit-button"
  >
    {{ t("Edit file") }}
  </BrandedButton>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RiPencilLine } from '@remixicon/vue'
import { computed } from 'vue'
import BrandedButton from '../BrandedButton.vue'

type Props = {
  datasetId: string
  isCommunityResource?: boolean
  resourceId: string
}

const props = withDefaults(defineProps<Props>(), {
  isCommunityResource: false,
})

const { t } = useI18n()

const adminUrl = computed(() => {
  if (props.isCommunityResource) {
    return `/admin/site/community-resources/?resource_id=${props.resourceId}`
  }

  return `/admin/datasets/${props.datasetId}/files/?resource_id=${props.resourceId}`
})
</script>
