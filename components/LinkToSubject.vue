<template>
  <a
    class="inline-flex items-baseline !bg-none underline space-x-1 link"
    :href="subject.page || subject.self_web_url"
  >
    <component
      :is="icon"
      class="self-center size-3.5"
    />
    <TextClamp
      :text="subject.title"
      :auto-resize="true"
      :max-lines="1"
    />
  </a>
</template>

<script setup lang="ts">
import { RiDatabase2Line, RiLineChartLine, RiRobot2Line } from '@remixicon/vue'
import { throwOnNever } from '@datagouv/components-next'
import type { LinkToSubject } from '~/types/types'

const props = defineProps<{
  type: 'Dataservice' | 'Dataset' | 'Reuse'
  subject: LinkToSubject
}>()

const icon = computed(() => {
  if (props.type === 'Dataset') return RiDatabase2Line
  if (props.type === 'Dataservice') return RiRobot2Line
  if (props.type === 'Reuse') return RiLineChartLine

  return throwOnNever(props.type, `Unknown subject ${JSON.stringify(props.subject)}`)
})
</script>
