<template>
  <div class="border-b border-gray-default">
    <div class="container">
      <div class="inline-flex flex-wrap gap-2">
        <CdataLink
          v-for="link in links"
          :key="link.label"
          class="bg-blue-action-low px-4 py-2 !bg-none font-bold aria-current-page:text-datagouv-dark aria-current-page:border-t-2 aria-current-page:border-t-datagouv-dark aria-current-page:bg-white aria-current-page:border-x aria-current-page:border-x-gray-default aria-current-page:shadow-[0_1px_white] hover:aria-current-page:!bg-white active:aria-current-page:!bg-white hover:!bg-blue-action-low-hover active:!bg-blue-action-low-active"
          :to="link.href"
          :aria-current="isCurrentUrl(link.href) ? 'page': false"
        >
          {{ link.label }}
          <sup
            v-if="'count' in link"
            class="font-normal"
          >
            <span aria-hidden="true">(</span>{{ link.count }}<span aria-hidden="true">)</span>
          </sup>
        </CdataLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  links: Array<{ href: string, label: string, count?: number }>
}>()

const isCurrentUrl = useIsCurrentUrl()
</script>
