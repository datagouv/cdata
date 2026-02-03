<template>
  <div
    v-if="schemas && schemas.length"
    class="space-y-1 py-6"
  >
    <h3 class="uppercase text-gray-plain text-sm font-bold">
      {{ t('Schéma de données') }}
    </h3>
    <div class="space-y-4">
      <div
        v-for="schema, index in schemas"
        :key="index"
        class="flex flex-col md:flex-row gap-2 justify-between items-center"
      >
        <p class="text-sm mb-0">
          {{ t('Les fichiers du jeu de données suivent le schéma :') }}
          <Tag
            type="secondary"
            :icon="RiCheckboxCircleLine"
          >
            {{ schema.name || schema.url }}
          </Tag>
        </p>
        <div v-if="schema.url || schema.name">
          <BrandedButton
            color="secondary"
            :icon="RiBook2Line"
            :href="schema.url ? schema.url : `${schemasSiteUrl}${schema.name}`"
          >
            {{ t('Voir la documentation du schéma') }}
          </BrandedButton>
        </div>
      </div>
      <p class="text-sm">
        <TranslationT keypath="Les schémas de données permettent de décrire des modèles de données, découvrez comment les schémas améliorent la qualité des données et quels sont les cas d'usages possibles sur {link}">
          <template #link>
            <AppLink
              :to="schemasSiteUrl"
              external
            >
              {{ schemasSiteName }}
            </AppLink>
          </template>
        </TranslationT>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RiBook2Line, RiCheckboxCircleLine } from '@remixicon/vue'
import { useTranslation } from '../../composables/useTranslation'
import type { Schema } from '../../types/schemas'
import Tag from '../Tag.vue'
import BrandedButton from '../BrandedButton.vue'
import TranslationT from '../TranslationT.vue'
import AppLink from '../AppLink.vue'

defineProps<{
  schemas: Array<Schema> | null
  schemasSiteUrl: string
  schemasSiteName: string
}>()

const { t } = useTranslation()
</script>
