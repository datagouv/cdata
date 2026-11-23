<template>
  <AvatarWithName
    v-if="report.by"
    :user="report.by"
    :size
  />
  <span
    v-else
    class="inline-flex items-center gap-1"
  >
    <component
      :is="report.reason === 'auto_spam' ? RiRobot2Line : RiSpyLine"
      class="size-3.5 shrink-0"
    />
    <span class="font-bold">{{ report.reason === 'auto_spam' ? $t('Spam bot') : $t('Anonyme') }}</span>
  </span>
</template>

<script setup lang="ts">
import { AvatarWithName } from '@datagouv/components-next'
import type { Report } from '@datagouv/components-next'
import { RiRobot2Line, RiSpyLine } from '@remixicon/vue'

// Without `by`, the report comes either from the spam detection or from a logged out visitor
defineProps<{
  report: Report
  size?: number
}>()
</script>
