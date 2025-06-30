<template>
  <BrandedButton
    v-if="!config.public.readOnlyMode"
    :href="link"
    color="primary"
    :external="type === 'harvester'"
  >
    <span v-if="type === 'harvester'">{{ t("Créer un moissoneur sur") }}</span>
    <span v-else>{{ t("Publier sur") }}</span>&nbsp;<SiteLogo />
  </BrandedButton>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

const props = defineProps<{
  type: 'dataset' | 'harvester' | 'reuse' | 'dataservice'
}>()

const { t } = useI18n()

const config = useRuntimeConfig()

const link = computed(() => {
  switch (props.type) {
    case 'dataset':
      return '/admin/datasets/new'
    case 'harvester':
      return `/admin/harvesters/new/`
    case 'reuse':
      return '/admin/reuses/new'
    case 'dataservice':
      return '/admin/dataservices/new'
    default:
      throwOnNever(props.type, '')
      return ''
  }
})
</script>
