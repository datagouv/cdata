<template>
  <div v-if="data">
    <div
      v-if="data"
      class="flex items-center space-x-4"
    >
      <img
        :src="data.imageb64"
        :alt="$t('Recopiez les lettres présentes sur cette image')"
      >
      <div class="flex items-center">
        <BrandedButton
          type="button"
          :icon="RiVolumeUpLine"
          icon-only
          size="xl"
          color="secondary-softer"
          keep-margins-even-without-borders
          @click="playSound"
        >
          {{ $t('Énoncer le code du captcha') }}
        </BrandedButton>
        <BrandedButton
          :icon="RiRefreshLine"
          color="secondary-softer"
          size="xl"
          icon-only
          keep-margins-even-without-borders
          @click="() => refresh()"
        >
          {{ $t('Générer un nouveau captcha') }}
        </BrandedButton>
      </div>
    </div>
    <InputGroup
      v-model="code"
      type="text"
      :label="$t('Saisissez les caractères de l\'image')"
      class="w-full !mb-0"
      :error-text="errors"
      :has-error="!! errors"
      required
    />
  </div>
</template>

<script setup lang="ts">
import { RiRefreshLine, RiVolumeUpLine } from '@remixicon/vue'
import { BrandedButton } from '@datagouv/components-next'

const config = useRuntimeConfig()

defineProps<{
  errors: string | null
}>()

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
