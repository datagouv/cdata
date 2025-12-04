<template>
  <a
    class="inline-flex items-baseline !bg-none underline space-x-1 link"
    :href="subject.page || subject.self_web_url"
  >
    <component
      :is="icon"
      class="self-center size-3.5"
    />
    <span class="truncate">{{ title }}</span>
  </a>
</template>

<script setup lang="ts">
import { RiBuilding2Line, RiChat2Line, RiDatabase2Line, RiLineChartLine, RiRobot2Line } from '@remixicon/vue'
import { throwOnNever } from '@datagouv/components-next'
import type { LinkToSubject } from '~/types/types'

const props = defineProps<{
  type: 'Dataservice' | 'Dataset' | 'Reuse' | 'Organization' | 'Discussion'
  subject: LinkToSubject
}>()

const title = computed(() => {
  if ('title' in props.subject) return props.subject.title
  if ('name' in props.subject) return props.subject.name

  return throwOnNever(props.subject, `Subject "${props.type}" without title or name (subject is ${JSON.stringify(props.subject)}).`)
})

const icon = computed(() => {
  if (props.type === 'Dataset') return RiDatabase2Line
  if (props.type === 'Dataservice') return RiRobot2Line
  if (props.type === 'Reuse') return RiLineChartLine
  if (props.type === 'Organization') return RiBuilding2Line
  if (props.type === 'Discussion') return RiChat2Line

  return throwOnNever(props.type, `Unknown subject "${props.type}" in \`LinkToSubject\` (subject is ${JSON.stringify(props.subject)})`)
})
</script>
