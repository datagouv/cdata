<template>
  <div class="flex justify-start">
    <nav class="flex space-x-1 font-medium rounded border border-neutral-300">
      <template
        v-for="link in links"
        :key="link.label"
      >
        <CdataLink
          v-if="show(link.href)"
          :to="link.href"
          class="group block rounded bg-none bg-transparent border border-transparent -m-px no-underline outline-none aria-current-page:border aria-current-page:border-primary aria-current-page:text-primary p-1"
          :aria-current="isCurrentUrl(link.href) ? 'page': false"
        >
          <span class="rounded px-2">
            {{ link.label }}
          </span>
        </CdataLink>
      </template>
    </nav>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  links: Array<{ href: string, label: string }>
}>()

const isCurrentUrl = useIsCurrentUrl()

function show(href: string) {
  const router = useRouter()
  const route = router.resolve(href)
  const me = useMaybeMe()
  if (route.meta.requiredRole) {
    return me.value?.roles?.includes(route.meta.requiredRole as string) ?? false
  }
  return true
}
</script>

<style scoped>
.group:not([aria-current='page']):hover span {
  /* Could maybe be replaced by group-hover-not-aria-current-page:bg-white/50 ? */
  background-color: rgba(255, 255, 255, 0.5);
}
</style>
