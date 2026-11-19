<template>
  <!-- Opening a new tab takes the rel and the screen reader warning with it: they live here so no caller forgets one -->
  <Badge
    v-if="url"
    :to="url"
    external
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="`${label} (${t('nouvel onglet')})`"
    :icon-right="RiExternalLinkLine"
    :tone
    :size
    :wrap
  >
    {{ label }}
  </Badge>
  <Badge
    v-else
    :tone
    :size
    :wrap
  >
    {{ label }}
  </Badge>
</template>

<script setup lang="ts">
import { Badge, type BadgeTone } from '@datagouv/components-next'
import { RiExternalLinkLine } from '@remixicon/vue'

defineProps<{
  label: string
  // Without an url, the badge is a plain label
  url: string | null
  tone?: BadgeTone
  size?: 'xs' | 'sm'
  wrap?: boolean
}>()

const { t } = useTranslation()
</script>
