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
const updating = ref(false)

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
    const component = '__vueParentComponent' in child ? child.__vueParentComponent as { props?: { to?: string } } : null
    if (!component || !component.props) {
      console.error('Child of `Breadcrumb` is not a vue component')
      return null
    }

    return component.props.to as string
  })
  breadcrumbs.value.push(route.fullPath)
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
