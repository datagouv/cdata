<template>
  <div class="space-y-1 py-6">
    <h3 class="uppercase text-gray-plain text-sm font-bold">
      {{ t('Informations') }}
    </h3>
    <DescriptionList>
      <div v-if="dataset.tags && dataset.tags.length">
        <DescriptionListTerm>{{ t('Mots-clés') }}</DescriptionListTerm>
        <DescriptionListDetails class="flex flex-wrap gap-2 items-start">
          <AppLink
            v-for="tag in dataset.tags"
            :key="tag"
            class="fr-raw-link"
            :to="getTagUrl(tag)"
          >
            <Tag type="secondary">
              {{ tag }}
            </Tag>
          </AppLink>
        </DescriptionListDetails>
      </div>
      <div>
        <DescriptionListTerm>{{ t('Identifiant') }}</DescriptionListTerm>
        <DescriptionListDetails class="flex items-center gap-2">
          {{ dataset.id }}
          <CopyButton
            class="!-mt-0.5"
            :label="t(`Copier l'identifiant`)"
            :copied-label="t('Identifiant copié !')"
            :text="dataset.id"
            :hide-label="true"
          />
        </DescriptionListDetails>
      </div>
      <div v-if="dataset.license">
        <DescriptionListTerm>{{ t('Licence') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <LicenseBadge :license="dataset.license" />
        </DescriptionListDetails>
      </div>
      <slot />
    </DescriptionList>
  </div>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/useTranslation'
import { useComponentsConfig } from '../../config'
import type { DatasetV2WithFullObject } from '../../types/datasets'
import DescriptionList from '../DescriptionList.vue'
import DescriptionListTerm from '../DescriptionListTerm.vue'
import DescriptionListDetails from '../DescriptionListDetails.vue'
import AppLink from '../AppLink.vue'
import CopyButton from '../CopyButton.vue'
import LicenseBadge from '../LicenseBadge.vue'
import Tag from '../Tag.vue'

const props = defineProps<{
  dataset: DatasetV2WithFullObject
  tagUrl?: (tag: string) => string
}>()

const { t } = useTranslation()
const config = useComponentsConfig()

function getTagUrl(tag: string): string {
  if (props.tagUrl) {
    return props.tagUrl(tag)
  }
  const base = config.baseUrl.endsWith('/') ? config.baseUrl.slice(0, -1) : config.baseUrl
  return `${base}/datasets/search?tag=${tag}`
}
</script>
