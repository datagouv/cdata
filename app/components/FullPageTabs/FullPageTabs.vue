<template>
  <div class="border-b border-gray-default">
    <div class="container">
      <div
        class="flex gap-2 overflow-auto -my-px"
      >
        <component
          :is="as"
          v-for="link in links"
          :key="link.label"
          class="flex font-bold text-base whitespace-nowrap lg:whitespace-normal m-0"
        >
          <CdataLink
            class="!bg-none bg-blue-action-low px-4 py-2 aria-current-page:text-new-primary aria-current-page:border-t-2 aria-current-page:border-t-new-primary aria-current-page:bg-white aria-current-page:border-x aria-current-page:border-x-gray-default hover:aria-current-page:!bg-white active:aria-current-page:!bg-white hover:!bg-blue-action-low-hover active:!bg-blue-action-low-active"
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
        </component>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  links: Array<{ href: string, label: string, count?: number }>
  as?: string
}>(), {
  as: 'h2',
})

const isCurrentUrl = useIsCurrentUrl()
</script>
