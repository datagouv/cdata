<template>
  <ModalWithButton
    :title="$t('Changer de mot de passe')"
    size="lg"
  >
    <template #button="{ attrs, listeners }">
      <BrandedButton
        color="secondary"
        size="xs"
        :icon="RiEditLine"
        :disabled="loading"
        v-bind="attrs"
        v-on="listeners"
      >
        {{ $t("Changer de mot de passe") }}
      </BrandedButton>
    </template>

    <template #default="{ close }">
      <form>
        <InputGroup
          type="password"
          :label="$t('Mot de passe actuel')"
        />
        <InputGroup
          type="password"
          :label="$t('Nouveau mot de passe')"
        />
        <InputGroup
          type="password"
          :label="$t('Confirmer le nouveau mot de passe')"
        />
      </form>
    </template>

    <template #footer="{ close }">
      <div class="fr-grid-row fr-grid-row--gutters fr-grid-row--right">
        <div class="fr-col-auto">
          <BrandedButton
            color="secondary"
            :disabled="loading"
            @click="close"
          >
            {{ $t("Cancel") }}
          </BrandedButton>
        </div>
        <div class="fr-col-auto">
          <BrandedButton
            type="submit"
            color="primary"
            :disabled="loading"
          >
            {{ $t("Changer de mot de passe") }}
          </BrandedButton>
        </div>
      </div>
    </template>
  </ModalWithButton>
</template>

<script setup lang="ts">
import { BrandedButton, type User } from '@datagouv/components-next'
import { RiEditLine } from '@remixicon/vue'

defineProps<{ user: User }>()

const loading = ref(false)
</script>
