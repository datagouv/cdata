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
  type: 'organizations' | 'posts' | 'reuses'
  id: string
}>()

const { t } = useI18n()

const link = computed(() => {
  const base = `/beta/admin/${props.type}/${props.id}/`
  switch (props.type) {
    case 'organizations':
      return `${base}profile`
    case 'posts':
    case 'reuses':
      return base
    default:
      return throwOnNever(props.type as never, t('No other type defined'))
  }
})
</script>
