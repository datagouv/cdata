<template>
  <Sidemenu
    :button-text="$t('Dans cette page')"
    fixed
  >
    <template #title>
      {{ $t('Sommaire') }}
    </template>
    <HeadingsSidemenuList :headings="tree" />
  </Sidemenu>
</template>

<script setup lang="ts">
import HeadingsSidemenuList from './HeadingsSidemenuList.vue'
import type { SidemenuHeading } from './HeadingsSidemenuList.vue'
import type { Heading } from '~/utils/headings'

const props = defineProps<{
  headings: Array<Heading>
}>()

const tree = computed(() => {
  const roots: Array<SidemenuHeading> = []
  const parents: Array<SidemenuHeading> = []
  for (const heading of props.headings) {
    const node: SidemenuHeading = { ...heading, children: [] }
    while (parents.length && parents[parents.length - 1].level >= node.level) parents.pop()
    const parent = parents[parents.length - 1]
    if (parent) parent.children.push(node)
    else roots.push(node)
    parents.push(node)
  }
  return roots
})
</script>
