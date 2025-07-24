<template>
  <div>
    <InputGroup
      v-model="link.title"
      :label="$t('Titre')"
    />
    <div class="flex space-x-2">
      <InputGroup
        v-model="link.url"
        class="w-full mb-0"
        :label="$t('Lien vers la page')"
      />
      <InputGroup
        v-model="link.color"
        class="w-full mb-0"
        :label="$t('Couleur')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LinkInBloc } from '~/types/pages'

const link = defineModel<LinkInBloc>({ required: true })
</script>
