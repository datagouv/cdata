<template>
  <BrandedButton
    color="warning"
    :href="link"
    :icon="RiEdit2Line"
    size="xs"
  >
    {{ $t('Modifier') }}
  </BrandedButton>
</template>

<script setup lang="ts">
import { BrandedButton, throwOnNever } from '@datagouv/components-next'
import { RiEdit2Line } from '@remixicon/vue'

const props = defineProps<{
  type: 'organizations' | 'users' | 'posts' | 'reuses' | 'dataservices' | 'datasets'
  id: string
}>()

const { t } = await useTranslation()

const link = computed(() => {
  const base = `/admin/${props.type}/${props.id}/`
  switch (props.type) {
    case 'organizations':
      return `${base}profile`
    case 'users':
      return `${base}profile`
    case 'posts':
    case 'reuses':
    case 'dataservices':
    case 'datasets':
      return base
    default:
      return throwOnNever(props.type as never, t('Aucun autre type défini'))
  }
})
</script>
