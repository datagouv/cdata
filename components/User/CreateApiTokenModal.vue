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
      <InputGroup
        v-model="expiresAt"
        type="date"
        class="mt-4"
        :label="$t('Date d\'expiration (optionnel)')"
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
import { FetchError } from 'ofetch'
import type { ApiTokenCreated } from '~/types/api-tokens'
import InputGroup from '~/components/InputGroup/InputGroup.vue'

const { t } = useTranslation()
const { $api } = useNuxtApp()

const emit = defineEmits<{
  created: [token: ApiTokenCreated]
}>()

// The request lives in the URL, as for the switch to ProConnect only, along with what was
// typed: when the creation requires a fresh session, the user is sent to /verify with this
// URL as `next`, and comes back to the form as they left it.
const route = useRoute()
const router = useRouter()
const isOpen = computed({
  get: () => route.query.api_token === 'create',
  set: open => router.replace({
    query: { ...route.query, api_token: open ? 'create' : undefined, api_token_name: undefined, api_token_expires_at: undefined },
  }),
})
const fromQuery = (value: unknown) => typeof value === 'string' ? value : ''

const loading = ref(false)
const name = ref(fromQuery(route.query.api_token_name))
const expiresAt = ref(fromQuery(route.query.api_token_expires_at))

async function submit(close: () => void) {
  loading.value = true
  try {
    await router.replace({
      query: { ...route.query, api_token_name: name.value.trim() || undefined, api_token_expires_at: expiresAt.value || undefined },
    })
    const result = await $api<ApiTokenCreated>('/api/1/me/api_tokens/', {
      method: 'POST',
      body: {
        name: name.value.trim(),
        expires_at: expiresAt.value,
      },
    })
    toast.success(t('Token créé avec succès.'))
    name.value = ''
    expiresAt.value = ''
    close()
    emit('created', result)
  }
  catch (e) {
    // A 401 has already sent the user to /verify, with this page's URL as `next`.
    if (e instanceof FetchError && e.statusCode === 401) return
    toast.error(t('Impossible de créer le token.'))
  }
  finally {
    loading.value = false
  }
}
</script>
