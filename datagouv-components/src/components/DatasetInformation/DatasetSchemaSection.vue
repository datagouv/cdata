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
            :href="schema.url ? schema.url : `${config.schemasSiteUrl}${schema.name}`"
          >
            {{ t('Voir la documentation du schéma') }}
          </BrandedButton>
        </div>
      </div>
      <p
        v-if="config.schemasSiteUrl && config.schemasSiteName"
        class="text-sm"
      >
        <TranslationT keypath="Les schémas de données permettent de décrire des modèles de données, découvrez comment les schémas améliorent la qualité des données et quels sont les cas d'usages possibles sur {link}">
          <template #link>
            <AppLink
              :to="config.schemasSiteUrl"
              external
            >
              {{ config.schemasSiteName }}
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
import { useComponentsConfig } from '../../config'
import { useFetch } from '../../functions/api'
import type { Dataset, DatasetV2, DatasetV2WithFullObject } from '../../types/datasets'
import type { Schema } from '../../types/schemas'
import Tag from '../Tag.vue'
import BrandedButton from '../BrandedButton.vue'
import TranslationT from '../TranslationT.vue'
import AppLink from '../AppLink.vue'

const props = defineProps<{
  dataset: Dataset | DatasetV2 | DatasetV2WithFullObject
}>()

const { t } = useTranslation()
const config = useComponentsConfig()

const { data } = await useFetch<Array<Schema>>(`/api/2/datasets/${props.dataset.id}/schemas/`)
const schemas = data
</script>
