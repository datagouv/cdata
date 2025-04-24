<template>
  <button
    type="button"
    class="fr-btn fr-btn--sm fr-btn--secondary fr-btn--secondary-grey-500 follow-button"
    :disabled="readOnlyEnabled"
    @click.prevent="toggleFollow"
  >
    <span>
      <RiStarFill
        v-if="following"
        :class="{ 'animate-ping': animating }"
        class="size-4"
      />
      <RiStarLine
        v-else
        :class="{ 'animate-ping': animating }"
        class="size-4"
      />
    </span>
    <span class="fr-ml-1w">
      <template v-if="following">{{ $t("Remove from favourites") }}</template>
      <template v-else>{{ $t("Add to favourites") }}</template>
    </span>
  </button>
</template>

<script setup lang="ts">
import { RiStarFill, RiStarLine } from '@remixicon/vue'
import { ref } from 'vue'

const props = defineProps<{
  url: string
  following?: boolean
}>()

const config = useRuntimeConfig()
const { $api } = useNuxtApp()

const animating = ref(false)
const following = ref(props.following)
const readOnlyEnabled = config.public.readOnlyMode

async function toggleFollow() {
  const me = useMaybeMe()
  if (!me.value) {
    const localePath = useLocalePath()
    return navigateTo(localePath('/login'), { external: true })
  }

  await $api(props.url, {
    method: following.value ? 'DELETE' : 'POST',
  })
  following.value = !following.value
  if (following.value) {
    animating.value = true
    setTimeout(() => (animating.value = false), 1300)
  }
}
</script>
