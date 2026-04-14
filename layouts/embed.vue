<script setup lang="ts">
const router = useRouter()
router.beforeEach((to) => {
  if (!to.path.includes('/embeds/')) {
    window.top!.location.href = to.fullPath
    return false
  }
})
</script>

<template>
  <div>
    <slot />
  </div>
</template>
