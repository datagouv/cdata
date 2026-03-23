<template>
  <ModalWithButton
    v-model="isOpen"
    :title="$t('Créer un token API')"
    size="lg"
    form
    @submit.prevent="(_$el, _close) => submit(_close)"
  >
    <template #button="{ attrs, listeners }">
      <BrandedButton
        color="secondary"
        size="xs"
        :icon="RiAddLine"
        :disabled="loading"
        v-bind="attrs"
        v-on="listeners"
      >
        {{ $t('Créer un token') }}
      </BrandedButton>
    </template>

    <template #default>
      <InputGroup
        v-model="name"
        :label="$t('Nom (optionnel)')"
        :hint-text="$t('Un nom pour identifier ce token, par exemple « CI/CD » ou « Mon script »')"
      />
    </template>

    <template #footer="{ close: _close }">
      <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--right">
        <div class="fr-col-auto">
          <BrandedButton
            color="secondary"
            :disabled="loading"
            @click="_close"
          >
            {{ $t('Annuler') }}
          </BrandedButton>
        </div>
        <div class="fr-col-auto">
          <BrandedButton
            type="submit"
            color="primary"
            :loading="loading"
          >
            {{ $t('Créer') }}
          </BrandedButton>
        </div>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { BrandedButton, toast } from '@datagouv/components-next'
import { RiAddLine } from '@remixicon/vue'
import type { ApiTokenCreated } from '~/types/api-tokens'
import InputGroup from '~/components/InputGroup/InputGroup.vue'

const { t } = useTranslation()
const { $api } = useNuxtApp()

const emit = defineEmits<{
  created: [token: ApiTokenCreated]
}>()

const isOpen = ref(false)
const loading = ref(false)
const name = ref('')

async function submit(close: () => void) {
  loading.value = true
  try {
    const trimmed = name.value.trim()
    const body = trimmed ? { name: trimmed } : {}
    const result = await $api<ApiTokenCreated>('/api/1/me/tokens/', {
      method: 'POST',
      body,
    })
    toast.success(t('Token créé avec succès.'))
    name.value = ''
    close()
    emit('created', result)
  }
  catch {
    toast.error(t('Impossible de créer le token.'))
  }
  finally {
    loading.value = false
  }
}
</script>
