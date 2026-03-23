<template>
  <div>
    <SimpleBanner
      v-if="newlyCreatedToken"
      type="warning"
      class="mb-4"
    >
      <div class="font-bold mb-1">
        {{ $t("Copiez ce token maintenant, il ne sera plus affiché.") }}
      </div>
      <div class="flex items-center gap-2">
        <code class="text-sm break-all">{{ newlyCreatedToken }}</code>
        <CopyButton
          :label="$t('Copier le token')"
          :copied-label="$t('Token copié')"
          :text="newlyCreatedToken"
        />
      </div>
    </SimpleBanner>

    <div
      v-if="tokens.length === 0 && !newlyCreatedToken"
      class="text-sm text-gray-500 mb-4"
    >
      {{ $t("Aucun token API. Créez-en un pour accéder à l'API.") }}
    </div>

    <div
      v-for="token in tokens"
      :key="token.id"
      class="flex items-center justify-between gap-4 py-3 border-b border-gray-200 last:border-b-0"
    >
      <div class="min-w-0">
        <div class="text-sm truncate">
          <span class="font-medium">{{ token.name || `${token.token_prefix}…` }}</span>
          <span
            v-if="token.name"
            class="text-gray-400 ml-1"
          >{{ token.token_prefix }}…</span>
        </div>
        <div class="text-xs text-gray-500">
          <span>{{ $t('Créé {date}', { date: formatRelativeIfRecentDate(token.created_at) }) }}</span>
          <span v-if="token.last_used_at"> · {{ $t('Utilisé {date}', { date: formatRelativeIfRecentDate(token.last_used_at) }) }}</span>
          <span v-else> · {{ $t('Jamais utilisé') }}</span>
          <template v-if="token.user_agents.length === 1">
            · {{ token.user_agents[0] }}
          </template>
          <template v-else-if="token.user_agents.length > 1">
            ·
            <button
              class="underline hover:text-gray-700"
              type="button"
              @click="userAgentsModalList = token.user_agents"
            >
              {{ $t('{n} user agents', { n: token.user_agents.length }) }}
            </button>
          </template>
        </div>
      </div>
      <BrandedButton
        color="danger"
        size="xs"
        :icon="RiDeleteBin6Line"
        :disabled="!!revoking"
        icon-only
        @click="tokenToRevoke = token"
      />
    </div>

    <div class="mt-4">
      <CreateApiTokenModal @created="onTokenCreated" />
    </div>

    <ModalClient
      :opened="!!tokenToRevoke"
      :title="$t('Révoquer ce token ?')"
      size="lg"
      @close="tokenToRevoke = null"
    >
      {{ $t('Le token {name} sera définitivement révoqué. Les applications qui l\'utilisent ne pourront plus accéder à l\'API.', { name: tokenToRevoke?.name || `${tokenToRevoke?.token_prefix}…` }) }}
      <template #footer>
        <div class="w-full flex justify-end gap-2">
          <BrandedButton
            color="secondary"
            :disabled="!!revoking"
            @click="tokenToRevoke = null"
          >
            {{ $t('Annuler') }}
          </BrandedButton>
          <BrandedButton
            color="danger"
            :icon="RiDeleteBin6Line"
            :loading="!!revoking"
            @click="revokeToken(tokenToRevoke!)"
          >
            {{ $t('Révoquer') }}
          </BrandedButton>
        </div>
      </template>
    </ModalClient>

    <ModalClient
      :opened="!!userAgentsModalList"
      :title="$t('User agents')"
      size="lg"
      @close="userAgentsModalList = null"
    >
      <ul class="list-disc pl-5 space-y-1">
        <li
          v-for="(ua, i) in userAgentsModalList"
          :key="i"
          class="text-sm break-all"
        >
          {{ ua }}
        </li>
      </ul>
    </ModalClient>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, CopyButton, SimpleBanner, toast, useFormatDate } from '@datagouv/components-next'
import { RiDeleteBin6Line } from '@remixicon/vue'
import type { ApiToken, ApiTokenCreated } from '~/types/api-tokens'
import CreateApiTokenModal from './CreateApiTokenModal.vue'
import ModalClient from '~/components/Modal/Modal.client.vue'

const { t } = useTranslation()
const { $api } = useNuxtApp()
const { formatRelativeIfRecentDate } = useFormatDate()

const tokens = ref<ApiToken[]>([])
const newlyCreatedToken = ref<string | null>(null)
const revoking = ref(false)
const tokenToRevoke = ref<ApiToken | null>(null)
const userAgentsModalList = ref<string[] | null>(null)

async function fetchTokens() {
  tokens.value = await $api<ApiToken[]>('/api/1/me/tokens/')
}

async function onTokenCreated(created: ApiTokenCreated) {
  newlyCreatedToken.value = created.token
  await fetchTokens()
}

async function revokeToken(token: ApiToken) {
  revoking.value = true
  try {
    await $api(`/api/1/me/tokens/${token.id}/`, {
      method: 'DELETE',
    })
    toast.success(t('Token révoqué.'))
    tokenToRevoke.value = null
    await fetchTokens()
  }
  catch {
    toast.error(t('Impossible de révoquer le token.'))
  }
  finally {
    revoking.value = false
  }
}

await fetchTokens()
</script>
