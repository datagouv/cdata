<template>
  <BrandedButton
    size="xs"
    color="secondary"
    :icon="RiImageAddLine"
    :loading
    @click="input?.click()"
  >
    {{ replacing ? $t("Remplacer l'image") : $t('Choisir une image') }}
  </BrandedButton>
  <input
    ref="input"
    type="file"
    class="hidden"
    accept="image/png,image/jpeg,image/webp,image/svg+xml"
    :aria-label="$t('Image')"
    @change="upload"
  >
</template>

<script setup lang="ts">
import { BrandedButton, toast } from '@datagouv/components-next'
import { RiImageAddLine } from '@remixicon/vue'
import { FetchError } from 'ofetch'
import { UPLOADS_IN_PROGRESS } from '~/utils/blocs'

defineProps<{
  // The bloc has an image already.
  replacing: boolean
}>()

const emit = defineEmits<{
  uploaded: [url: string]
}>()

const { $fileApi } = useNuxtApp()
const { t } = useTranslation()

const input = useTemplateRef('input')
const loading = ref(false)
const uploads = inject(UPLOADS_IN_PROGRESS, ref(0))

async function upload() {
  const file = input.value?.files?.[0]
  if (!file) return
  const body = new FormData()
  body.set('file', file)
  loading.value = true
  uploads.value++
  try {
    emit('uploaded', (await $fileApi<{ url: string }>('/api/1/images/', { method: 'POST', body })).url)
  }
  catch (error) {
    // `$fileApi` tells why the server refused the image; it says nothing when there was no
    // answer at all.
    if (!(error instanceof FetchError) || !error.response) {
      toast.error(t('L\'image n\'a pas pu être envoyée, vérifiez votre connexion.'))
    }
  }
  finally {
    loading.value = false
    uploads.value--
    // Picking the same file again uploads it again.
    input.value!.value = ''
  }
}
</script>
