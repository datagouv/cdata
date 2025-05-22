<template>
  <LoadingBlock :status="followStatus">
    <BrandedButton
      v-if="me"
      type="button"
      color="secondary"
      :disabled="readOnlyEnabled"
      :icon="following ? RiStarFill : RiStarLine"
      :icon-attrs
      :loading
      size="xs"
      @click.prevent="toggleFollow"
    >
      <template v-if="following">
        {{ $t("Remove from favourites") }}
      </template>
      <template v-else>
        {{ $t("Add to favourites") }}
      </template>
    </BrandedButton>
  </LoadingBlock>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { RiStarFill, RiStarLine } from '@remixicon/vue'
import { ref } from 'vue'
import type { PaginatedArray } from '~/types/types'

const props = defineProps<{
  url: string
}>()

const config = useRuntimeConfig()
const { $api } = useNuxtApp()

const me = useMaybeMe()

const { data: follower, status: followStatus } = await useAPI<PaginatedArray<{
  id: string
  follower: string
  since: string
}>>(props.url, {
  query: {
    user: me.value?.id ?? undefined,
  },
})

const animating = ref(false)
const following = ref(false)
const loading = ref(false)
const readOnlyEnabled = config.public.readOnlyMode

watchEffect(() => {
  following.value = follower && follower.value.total > 0
})

const iconAttrs = computed(() => ({
  class: animating.value ? 'animate-ping' : '',
}))

async function toggleFollow() {
  const me = useMaybeMe()
  if (!me.value) {
    const localePath = useLocalePath()
    return navigateTo(localePath('/login'), { external: true })
  }
  loading.value = true
  try {
    await $api(props.url, {
      method: following.value ? 'DELETE' : 'POST',
    })
    following.value = !following.value
    if (following.value) {
      animating.value = true
      setTimeout(() => (animating.value = false), 1300)
    }
  }
  finally {
    loading.value = false
  }
}
</script>
