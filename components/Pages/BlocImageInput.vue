<template>
  <div class="flex flex-wrap items-center gap-2">
    <BrandedButton
      size="xs"
      color="secondary"
      :icon="RiImageAddLine"
      :loading
      @click="input?.click()"
    >
      {{ image ? $t("Remplacer l'image") : $t('Choisir une image') }}
    </BrandedButton>
    <BrandedButton
      v-if="image && removable"
      size="xs"
      color="tertiary"
      :icon="RiDeleteBinLine"
      @click="image = null"
    >
      {{ $t("Retirer l'image") }}
    </BrandedButton>
    <input
      ref="input"
      type="file"
      class="hidden"
      accept="image/png,image/jpeg,image/webp,image/svg+xml"
      :aria-label="$t('Image')"
      @change="upload"
    >
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { RiDeleteBinLine, RiImageAddLine } from '@remixicon/vue'

defineProps<{
  // Whether the bloc can do without an image.
  removable?: boolean
}>()

// The URL of the image, once uploaded.
const image = defineModel<string | null>({ required: true })

const { $fileApi } = useNuxtApp()

const input = useTemplateRef('input')
const loading = ref(false)

async function upload() {
  const file = input.value?.files?.[0]
  if (!file) return
  const body = new FormData()
  body.set('file', file)
  loading.value = true
  try {
    image.value = (await $fileApi<{ url: string }>('/api/1/images/', { method: 'POST', body })).url
  }
  catch {
    // `$fileApi` told why the image was refused: the bloc keeps its previous one.
  }
  finally {
    loading.value = false
    // Picking the same file again uploads it again.
    input.value!.value = ''
  }
}
</script>
