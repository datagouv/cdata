<template>
  <div
    class="relative flex items-center py-2 fr-enlarge-link border-neutral-200 border-bottom"
    :class="{ 'bg-indigo-100 outline outline-1 outline-primary outline-offset-[-2px]': active }"
  >
    <Placeholder
      :src="logo"
      type="organization"
      :size="30"
      class="flex-none mx-2"
    />
    <CdataLink
      class="flex-1"
      :to="link"
      :external="true"
    >
      <span class="font-bold">{{ name }}</span>
    </CdataLink>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  active: boolean
  logo?: string
  name: string
  link: string
}>()
</script>
