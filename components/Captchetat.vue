<template>
  <div v-if="data">
    <div
      v-if="data"
      class="flex space-x-4"
    >
      <img
        :src="data.imageb64"
        :alt="$t('Recopiez les lettres présentes sur cette image')"
      >
      <button
        type="button"
        @click="playSound"
      >
        <RiVolumeUpLine class="size-9" />
        <span class="sr-only">{{ $t('Énoncer le code du captcha') }}</span>
      </button>
      <button
        type="button"
        @click="() => refresh()"
      >
        <RiRefreshLine class="size-8" />
        <span class="sr-only">{{ $t('Générer un nouveau captcha') }}</span>
      </button>
    </div>
    <InputGroup
      v-model="code"
      type="text"
      :label="$t('Saisissez les caractères de l\'image')"
      class="w-full !mb-0"
      required
    />
  </div>
</template>

<script setup lang="ts">
import { RiRefreshLine, RiVolumeUpLine } from '@remixicon/vue'

const config = useRuntimeConfig()

const uuid = defineModel<string>('uuid', { required: true })
const code = defineModel<string>('code', { required: true })

const query = computed(() => {
  return {
    get: 'image',
    c: config.public.captcheta.style,
  }
})

const { data, refresh } = await useAPI<{ uuid: string, imageb64: string }>('/api/2/captchetat', { query })

watchEffect(() => {
  if (!data.value) return
  uuid.value = data.value.uuid
})

const playSound = async () => {
  const query = new URLSearchParams({ get: 'sound', c: config.public.captcheta.style, t: data.value.uuid })
  await new Audio(`${config.public.apiBase}/api/2/captchetat?${query.toString()}`).play()
}
</script>
