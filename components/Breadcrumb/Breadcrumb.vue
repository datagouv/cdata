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

const updateBreadcrumbs = () => {
  breadcrumbs.value = [...root.value.children].map((child) => {
    if (!('__vueParentComponent' in child)) {
      console.log('Child of `Breadcrumb` is not a vue component')
      return null
    }

    return child.__vueParentComponent?.props?.to as string
  })
  breadcrumbs.value.push(route.fullPath)
}

const observer = ref<MutationObserver | null>(null)
onMounted(() => {
  updateBreadcrumbs()
})
onMounted(() => {
  if (!root.value) return
  if (typeof MutationObserver === 'undefined') return

  observer.value = new MutationObserver(() => {
    if (updating.value) return
    updating.value = true
    nextTick(() => {
      try {
        updateBreadcrumbs()
      }
      finally {
        updating.value = false
      }
    })
  })
  observer.value.observe(root.value, {
    childList: true,
  })
})
onBeforeUnmount(() => {
  if (observer.value) observer.value.disconnect()
})
</script>
