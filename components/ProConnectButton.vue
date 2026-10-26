<template>
  <form :action="`${config.public.apiBase}/api/1/proconnect/login/`">
    <slot />
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
          {{ $t(`Qu'est-ce que ProConnect ?`) }}
        </CdataLink>
      </p>
    </div>
  </form>
</template>

<script setup lang="ts">
defineProps<{
  label: string
}>()

const config = useRuntimeConfig()
</script>
