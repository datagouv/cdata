<template>
  <ModalWithButton
    v-model="isOpen"
    :title="$t('Créer un token API')"
    size="lg"
    form
    @submit.prevent="submit"
  >
    <template #button="{ attrs, listeners }">
      <BrandedButton
        color="secondary"
        size="xs"
        :icon="RiAddLine"
        :disabled="loading"
        :loading="pending"
        v-bind="attrs"
        v-on="listeners"
      >
        {{ $t('Créer un token') }}
      </BrandedButton>
    </template>

    <template #default>
      <SimpleBanner
        v-if="createdToken"
        type="warning"
      >
        <div class="font-bold mb-1">
          {{ $t("Copiez ce token maintenant, il ne sera plus affiché.") }}
        </div>
        <div class="flex items-center gap-2">
          <code class="text-sm break-all">{{ createdToken }}</code>
          <CopyButton
            :label="$t('Copier le token')"
            :copied-label="$t('Token copié')"
            :text="createdToken"
          />
        </div>
      </SimpleBanner>
      <template v-else>
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
    </template>

    <template #footer="{ close: _close }">
      <div
        v-if="createdToken"
        class="fr-grid-row fr-grid-row--right"
      >
        <div class="fr-col-auto">
          <BrandedButton
            color="primary"
            @click="_close"
          >
            {{ $t('Fermer') }}
          </BrandedButton>
        </div>
      </div>
      <div
        v-else
        class="fr-grid-row fr-grid-row--gutters fr-grid-row--right"
      >
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
import { BrandedButton, CopyButton, SimpleBanner, toast } from '@datagouv/components-next'
import { RiAddLine } from '@remixicon/vue'
import { FetchError } from 'ofetch'
import type { ApiTokenCreated } from '~/types/api-tokens'
import InputGroup from '~/components/InputGroup/InputGroup.vue'

const { t } = useTranslation()
const { $api } = useNuxtApp()

const { isOpen: requestedOpen, pending } = useFreshSessionModal('api_token', 'create', async () => {
  await $api('/api/1/me/fresh/')
})
const loading = ref(false)
// Closing the modal changes the URL, which remounts the profile page (keyed by
// `fullPath`): this component, the form and the token go with it. Closing during the
// creation would lose the token, shown once only, so the modal stays open until it ends.
const isOpen = computed({
  get: () => requestedOpen.value,
  set: (open: boolean) => {
    if (!open && loading.value) return
    requestedOpen.value = open
  },
})
const name = ref('')
const expiresAt = ref('')
// Shown in the modal rather than on the page, which the closing remounts.
const createdToken = ref<string | null>(null)

async function submit() {
  loading.value = true
  try {
    const result = await $api<ApiTokenCreated>('/api/1/me/api_tokens/', {
      method: 'POST',
      body: {
        name: name.value.trim(),
        expires_at: expiresAt.value,
      },
    })
    toast.success(t('Token créé avec succès.'))
    createdToken.value = result.token
  }
  catch (e) {
    // The session may have gone stale since the modal opened: a 401 has already sent the
    // user to /verify or /login, with this page's URL as `next`.
    if (e instanceof FetchError && e.statusCode === 401) return
    toast.error(t('Impossible de créer le token.'))
  }
  finally {
    loading.value = false
  }
}
</script>
