<template>
  <form :action="`${config.public.apiBase}${ACTION_PATHS[action]}`">
    <input
      v-if="next"
      type="hidden"
      name="next"
      :value="next"
    >
    <div class="fr-connect-group flex flex-col items-center">
      <button class="fr-connect">
        <span class="fr-connect__login">{{ label }}</span>
        <span class="fr-connect__brand">ProConnect</span>
      </button>
      <p>
        <CdataLink
          :href="config.public.proconnect.homepage"
          target="_blank"
          rel="noopener"
        >
          {{ $t(`Qu'est-ce que ProConnect ?`) }}
        </CdataLink>
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
const ACTION_PATHS = {
  login: '/api/1/proconnect/login/',
  reauth: '/api/1/proconnect/reauth/',
  // Completes the password login waiting for its 2FA setup, ProConnect's second factor required.
  twoFactorSetup: '/api/1/proconnect/two-factor-setup/',
} as const

defineProps<{
  label: string
  action: keyof typeof ACTION_PATHS
  // The page to land back on once signed in: udata redirects there after ProConnect.
  next?: string
}>()

const config = useRuntimeConfig()
</script>
