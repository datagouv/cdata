<template>
  <MetadataSection :title="t('Informations')">
    <DescriptionList>
      <div>
        <DescriptionListTerm>{{ t('Mots-clés') }}</DescriptionListTerm>
        <DescriptionListDetails
          v-if="dataset.tags?.length"
          class="flex flex-wrap gap-2 items-start"
        >
          <Tag
            v-for="tag in dataset.tags"
            :key="tag"
            :to="getTagUrl(tag)"
          >
            {{ tag }}
          </Tag>
        </DescriptionListDetails>
        <DescriptionListDetails v-else>
          <MetadataEmptyValue />
        </DescriptionListDetails>
      </div>
      <div>
        <DescriptionListTerm>{{ t('Identifiant') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <TechnicalValue
            :value="dataset.id"
            :label="t(`Copier l'identifiant`)"
            :copied-label="t('Identifiant copié !')"
          />
        </DescriptionListDetails>
      </div>
      <div>
        <DescriptionListTerm>{{ t('Licence') }}</DescriptionListTerm>
        <DescriptionListDetails>
          <TechnicalValue
            v-if="dataset.license"
            :value="dataset.license.title"
            :href="dataset.license.url"
            :copy-text="dataset.license.url || dataset.license.title"
            :label="t('Copier la licence')"
            :copied-label="t('Licence copiée !')"
          />
          <MetadataEmptyValue v-else />
        </DescriptionListDetails>
      </div>
      <slot />
    </DescriptionList>
  </MetadataSection>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/useTranslation'
import { useComponentsConfig } from '../../config'
import type { RouteLocationRaw } from 'vue-router'
import type { DatasetV2WithFullObject } from '../../types/datasets'
import DescriptionList from '../DescriptionList.vue'
import DescriptionListTerm from '../DescriptionListTerm.vue'
import DescriptionListDetails from '../DescriptionListDetails.vue'
import TechnicalValue from '../TechnicalValue.vue'
import Tag from '../Tag.vue'
import MetadataSection from './MetadataSection.vue'
import MetadataEmptyValue from '../MetadataEmptyValue.vue'

const props = defineProps<{
  dataset: DatasetV2WithFullObject
  tagUrl?: (tag: string) => string | RouteLocationRaw
}>()

const { t } = useTranslation()
const config = useComponentsConfig()

function getTagUrl(tag: string): string | RouteLocationRaw {
  if (props.tagUrl) {
    return props.tagUrl(tag)
  }
  const base = config.baseUrl.endsWith('/') ? config.baseUrl.slice(0, -1) : config.baseUrl
  return `${base}/datasets/search?tag=${tag}`
}
</script>
