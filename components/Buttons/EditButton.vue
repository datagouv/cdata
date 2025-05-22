<template>
  <BrandedButton
    color="danger"
    :href="link"
    :icon="RiEdit2Line"
    size="xs"
  >
    {{ $t('Edit') }}
  </BrandedButton>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { RiEdit2Line } from '@remixicon/vue'

const props = defineProps<{
  type: 'organizations' | 'users' | 'posts' | 'reuses' | 'dataservices' | 'datasets'
  id: string
}>()

const { t } = useI18n()

const link = computed(() => {
  const base = `/admin/${props.type}/${props.id}/`
  switch (props.type) {
    case 'organizations':
      return `${base}profile`
    case 'posts':
    case 'reuses':
    case 'dataservices':
    case 'datasets':
    case 'users':
      return base
    default:
      return throwOnNever(props.type as never, t('No other type defined'))
  }
})
</script>
