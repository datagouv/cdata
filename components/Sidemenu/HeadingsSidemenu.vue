<template>
  <Sidemenu
    :button-text="$t('Dans cette page')"
    fixed
  >
    <template #title>
      {{ $t('Sommaire') }}
    </template>
    <HeadingsSidemenuList :headings />
  </Sidemenu>
</template>

<script setup lang="ts">
import { useMutationObserver } from '@vueuse/core'
import HeadingsSidemenuList from './HeadingsSidemenuList.vue'
import type { SidemenuHeading } from './HeadingsSidemenuList.vue'

const props = defineProps<{
  content: HTMLElement | null
}>()

const headings = ref<Array<SidemenuHeading>>([])

// Read from the rendered page rather than from the post: the headings come from bloc
// titles, Markdown and raw HTML alike. Ids are set here because raw HTML headings have
// none and the same heading ("Données") in two blocs gets the same id.
function scan() {
  if (!props.content) return
  const usedIds = new Set<string>()
  const roots: Array<SidemenuHeading> = []
  const parents: Array<SidemenuHeading> = []
  for (const element of props.content.querySelectorAll<HTMLElement>('h2, h3, h4')) {
    const label = element.textContent?.trim()
    if (!label) continue
    const base = element.id || slugify(label) || 'section'
    let id = base
    for (let suffix = 1; usedIds.has(id); suffix++) id = `${base}-${suffix}`
    usedIds.add(id)
    element.id = id

    const heading: SidemenuHeading = { id, label, level: Number(element.tagName[1]), children: [] }
    while (parents.length && parents[parents.length - 1].level >= heading.level) parents.pop()
    const parent = parents[parents.length - 1]
    if (parent) parent.children.push(heading)
    else roots.push(heading)
    parents.push(heading)
  }
  headings.value = roots
}

// Not `attributes`: setting the ids would trigger a new scan.
useMutationObserver(() => props.content, scan, { childList: true, subtree: true, characterData: true })

watch(() => props.content, scan, { immediate: true })
</script>
