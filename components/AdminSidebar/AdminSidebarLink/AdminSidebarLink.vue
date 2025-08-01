<template>
  <li class="fr-sidemenu__item">
    <div
      class="fr-enlarge-link relative text-[var(--text-action-high-grey)] flex flex-row items-center w-full mb-2 py-1 px-1.5 has-[[aria-current=page]]:rounded-sm has-[[aria-current=page]]:bg-neutral-100 has-[[aria-current=page]]:font-extrabold"
    >
      <component
        :is="icon"
        class="fr-mr-1w size-4"
      />
      <CdataLink
        :to
        class="[[aria-current=page]]:-translate-y-0.5"
        :aria-current="route.fullPath === localeRoute(to)?.fullPath || isLastBreadcrumb ? 'page' : false"
      >
        <TextClamp
          :text="label"
          :auto-resize="true"
          :max-lines="1"
        />
      </CdataLink>
    </div>
  </li>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

const route = useRoute()
const localeRoute = useLocaleRoute()

const props = defineProps<{
  label: string
  icon: Component
  to: RouteLocationRaw
}>()

const id = useId()
// :BreadcrumbInSidebar
const breadcrumbs = useBreadcrumbs()
const sidebarLinks = useSidebarLinks()

// We key by ID to avoid destroying a value created by another component.
onMounted(() => sidebarLinks.value[id] = props.to)
// eslint-disable-next-line @typescript-eslint/no-dynamic-delete
onUnmounted(() => delete sidebarLinks.value[id])

const lastBreadcrumbInSidebar = computed(() => {
  const breadcrumbsInSidebar = breadcrumbs.value.filter((breadcrumbUrl) => {
    if (!breadcrumbUrl) return false
    return Object.values(sidebarLinks.value)
      .find(sidebarLink => localeRoute(sidebarLink)?.fullPath === localeRoute(breadcrumbUrl)?.fullPath)
  })
  if (!breadcrumbsInSidebar.length) return null
  return breadcrumbsInSidebar[breadcrumbsInSidebar.length - 1]
})
const isLastBreadcrumb = computed(() => {
  if (!lastBreadcrumbInSidebar.value) return false
  return localeRoute(lastBreadcrumbInSidebar.value)?.fullPath === localeRoute(props.to)?.fullPath
})
</script>

<style scoped>
.fr-sidemenu__link[aria-current]:not([aria-current=false])::before {
  width: 0;
}

.fr-sidemenu__link:has(> [aria-current]):hover {
  background-color: var(--background-alt-grey-hover);
}

.fr-sidemenu__link:has(> [aria-current]):active {
  background-color: var(--background-alt-grey-active);
}
</style>
