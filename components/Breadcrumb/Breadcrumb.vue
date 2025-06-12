<template>
  <nav
    rol="navigation"
    :aria-label="$t(`You're here:`)"
    class="fr-breadcrumb mb-5"
  >
    <ol
      ref="rootRef"
      class="fr-breadcrumb__list"
    >
      <slot />
    </ol>
  </nav>
</template>

<script setup lang="ts">
const root = useTemplateRef('rootRef')
const breadcrumbs = useBreadcrumbs()
const route = useRoute()

//
// :BreadcrumbInSidebar
//
// We watch our children to be notified when there is a new BreadcrumbItem (or
// when a BreadcrumbItem is removed).
// We do that with the DOM to have the correct order because the active sidebar
// should be the last link of the breadcrumb (otherwise /profile is active on most
// pages since it's in almost all the breadcrumbs).
// `onMounted` is called in DOM order but we may have v-if adding `BreadcrumbItem`
// in the middle of the list, breaking the order.
// `AdminSidebarLink` is using this to check if it should activates or not
const updateBreadcrumbs = () => {
  if (!root.value) return
  breadcrumbs.value = [...root.value.children].map((child) => {
    const isBreadcrumbItem = 'breadcrumbItem' in (child as HTMLElement).dataset
    if (!isBreadcrumbItem) {
      console.error('Child of `Breadcrumb` is not a `BreadcrumbItem`')
      return null
    }

    return (child as HTMLElement).dataset.breadcrumbTo || null
  })
  breadcrumbs.value.push(removeLangPrefix(route.fullPath))
}

const observer = ref<MutationObserver | null>(null)
onMounted(() => updateBreadcrumbs())
onMounted(() => {
  if (!root.value) return
  if (typeof MutationObserver === 'undefined') return

  observer.value = new MutationObserver(updateBreadcrumbs)
  observer.value.observe(root.value, {
    childList: true,
  })
})
onBeforeUnmount(() => {
  if (observer.value) observer.value.disconnect()
})
</script>
