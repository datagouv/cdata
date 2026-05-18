<template>
  <a
    class="inline-flex items-baseline !bg-none underline space-x-1 link"
    :href="subjectUrl"
  >
    <component
      :is="icon"
      class="self-center size-3.5"
    />
    <span class="truncate">{{ title }}</span>
  </a>
</template>

<script setup lang="ts">
import { RiBuilding2Line, RiChat2Line, RiDatabase2Line, RiLineChartLine, RiTerminalLine, RiUserLine } from '@remixicon/vue'
import { throwOnNever } from '@datagouv/components-next'
import type { LinkToSubject } from '~/types/types'

const props = defineProps<{
  type: 'Dataservice' | 'Dataset' | 'Reuse' | 'Organization' | 'Discussion' | 'User'
  subject: LinkToSubject
}>()

const subjectUrl = computed(() => {
  if ('page' in props.subject) return props.subject.page
  if ('self_web_url' in props.subject) return props.subject.self_web_url
  if ('customUrl' in props.subject) return props.subject.customUrl

  return throwOnNever(props.subject, `Subject "${props.type}" without page, self_web_url or customUrl (subject is ${JSON.stringify(props.subject)}).`)
})

const title = computed(() => {
  if ('title' in props.subject) return props.subject.title
  if ('name' in props.subject) return props.subject.name
  if ('customTitle' in props.subject) return props.subject.customTitle
  if ('first_name' in props.subject) return `${props.subject.first_name} ${props.subject.last_name}`.trim() || props.subject.slug

  return throwOnNever(props.subject, `Subject "${props.type}" without title, name or customTitle (subject is ${JSON.stringify(props.subject)}).`)
})

const icon = computed(() => {
  if (props.type === 'Dataset') return RiDatabase2Line
  if (props.type === 'Dataservice') return RiTerminalLine
  if (props.type === 'Reuse') return RiLineChartLine
  if (props.type === 'Organization') return RiBuilding2Line
  if (props.type === 'Discussion') return RiChat2Line
  if (props.type === 'User') return RiUserLine

  return throwOnNever(props.type, `Unknown subject "${props.type}" in \`LinkToSubject\` (subject is ${JSON.stringify(props.subject)})`)
})
</script>
