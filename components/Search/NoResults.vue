<template>
  <ActionCard
    actions-alignment="start"
    :title="t(`Vous n'avez pas trouvé ce que vous cherchez ?`)"
    icon="/illustrations/magnifying_glass.svg"
    type="primary"
  >
    <p class="mt-1 mb-3">
      {{ t("Essayez de réinitialiser les filtres pour élargir votre recherche.") }}<br>
      {{ t("Vous pouvez aussi regarder les demandes en cours et soumettre la vôtre sur notre forum dédié à la recherche et à l’ouverture de données.") }}
    </p>
    <template #actions>
      <BrandedButton
        color="primary-soft"
        type="button"
        @click="$emit('resetFilters')"
      >
        {{ t("Réinitialiser les filtres") }}
      </BrandedButton>
      <BrandedButton
        v-if="forumUrl"
        color="tertiary"
        :href="forumUrl"
        :icon="RiLightbulbLine"
        class="ml-2"
      >
        {{ t("Voir le forum") }}
      </BrandedButton>
    </template>
  </ActionCard>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { useI18n } from 'vue-i18n'
import { RiLightbulbLine } from '@remixicon/vue'

const { t } = useI18n()

defineProps<{
  forumUrl: string
}>()

defineEmits<{
  (e: 'resetFilters'): void
}>()
</script>
