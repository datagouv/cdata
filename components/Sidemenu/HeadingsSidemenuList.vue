<template>
  <ul class="fr-sidemenu__list">
    <!-- Not keyed by id: the same heading in two blocs has the same id -->
    <li
      v-for="(heading, index) in headings"
      :key="index"
      class="fr-sidemenu__item"
    >
      <a
        class="fr-sidemenu__link"
        :href="`#${heading.id}`"
        target="_self"
      >
        {{ heading.label }}
      </a>
      <HeadingsSidemenuList
        v-if="heading.children.length"
        :headings="heading.children"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
export type SidemenuHeading = {
  id: string
  label: string
  level: number
  children: Array<SidemenuHeading>
}

defineProps<{
  headings: Array<SidemenuHeading>
}>()
</script>
