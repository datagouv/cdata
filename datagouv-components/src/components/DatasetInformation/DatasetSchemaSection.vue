<template>
  <MetadataSection
    v-if="schemas && schemas.length"
    :title="t('Schéma de données')"
  >
    <template #title>
      <span class="inline-flex items-center gap-1.5">
        <Toggletip
          :styled-button="false"
          button-class="inline-flex rounded-sm text-gray-secondary hover:text-new-primary focus-visible:text-new-primary focus-visible:outline-2 focus-visible:outline-new-focus"
        >
          <RiInformationLine
            class="size-4"
            aria-hidden="true"
          />
          <span class="sr-only">{{ t(`Qu'est-ce qu'un schéma de données ?`) }}</span>
          <template #toggletip>
            <p class="m-0 text-sm/5 normal-case font-normal">
              {{ t(`Les schémas de données permettent de décrire des modèles de données, découvrez comment les schémas améliorent la qualité des données et quels sont les cas d'usages possibles sur schema.data.gouv.fr.`) }}
              <AppLink
                v-if="config.schemasSiteUrl"
                :to="config.schemasSiteUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="text-current underline underline-offset-3 hover:text-new-primary focus-visible:text-new-primary"
              >
                {{ t('En savoir plus sur schema.data.gouv.fr') }}
              </AppLink>
            </p>
          </template>
        </Toggletip>
        {{ t('Schéma de données') }}
      </span>
    </template>
    <div class="grid gap-4 sm:grid-cols-2">
      <div
        v-for="schema, index in schemas"
        :key="index"
        class="flex min-w-0 flex-col gap-3 rounded border border-gray-default bg-white p-4"
      >
        <h4 class="m-0 text-sm/5 font-medium text-gray-title [overflow-wrap:anywhere]">
          {{ schema.name || schema.url }}
        </h4>
        <p
          v-if="schema.version"
          class="m-0 text-xs/4 text-gray-secondary"
        >
          {{ t('Version') }} : {{ schema.version }}
        </p>
        <div class="mt-auto flex flex-col items-start gap-2 text-sm/5">
          <AppLink
            v-if="schema.url || schema.name"
            :to="schemaDocumentationUrl(schema)"
            class="bg-none text-gray-title underline underline-offset-3 hover:text-new-primary focus-visible:text-new-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t('Lire la documentation du schéma') }}
          </AppLink>
          <AppLink
            v-if="schema.name"
            :to="`${config.baseUrl}/datasets/search?schema=${encodeURIComponent(schema.name)}`"
            class="bg-none text-gray-title underline underline-offset-3 hover:text-new-primary focus-visible:text-new-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t('Explorer les fichiers sur data.gouv.fr') }}
          </AppLink>
        </div>
      </div>
    </div>
  </MetadataSection>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/useTranslation'
import { useComponentsConfig } from '../../config'
import { useFetch } from '../../functions/api'
import type { Dataset, DatasetV2, DatasetV2WithFullObject } from '../../types/datasets'
import type { Schema } from '../../types/schemas'
import AppLink from '../AppLink.vue'
import Toggletip from '../Toggletip.vue'
import { RiInformationLine } from '@remixicon/vue'
import MetadataSection from './MetadataSection.vue'

const props = defineProps<{
  dataset: Dataset | DatasetV2 | DatasetV2WithFullObject
}>()

const { t } = useTranslation()
const config = useComponentsConfig()

const { data } = await useFetch<Array<Schema>>(`/api/2/datasets/${props.dataset.id}/schemas/`)
const schemas = data

function schemaDocumentationUrl(schema: Schema): string | null {
  if (schema.url) return schema.url
  if (!schema.name || !config.schemasSiteUrl) return null
  const base = config.schemasSiteUrl.endsWith('/') ? config.schemasSiteUrl : `${config.schemasSiteUrl}/`
  return `${base}${schema.name}/`
}
</script>
