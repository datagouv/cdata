<template>
  <!-- Not a <p>: TextClamp is a .client component, its SSR placeholder is a
       <div> and a <div> inside a <p> is restructured by the browser parser,
       causing hydration mismatches -->
  <div
    v-if="'email' in user && user.email"
    class="fr-m-0 fr-text--xs text-mention-grey italic inline-flex items-center"
  >
    <RiMailLine class="size-3" />
    <TextClamp
      class="fr-px-1v"
      :text="(user.email as string)"
      :auto-resize="true"
      :max-lines="1"
    />
  </div>
</template>

<script setup lang="ts">
import { RiMailLine } from '@remixicon/vue'
import type { User } from '@datagouv/components-next'

defineProps<{
  user: User
}>()
</script>
