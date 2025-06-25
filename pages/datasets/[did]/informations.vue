<template>
  <div class="divide-y">
    <div class="space-y-1 py-6">
      <h3 class="uppercase text-gray-plain text-sm font-bold">
        {{ $t('Informations') }}
      </h3>
      <DescriptionList>
        <div v-if="dataset.tags && dataset.tags.length">
          <DescriptionListTerm>{{ $t('Mots-clés') }}</DescriptionListTerm>
          <DescriptionListDetails class="flex flex-wrap gap-2 items-start">
            <NuxtLinkLocale
              v-for="tag in dataset.tags"
              :key="tag"
              class="fr-raw-link"
              :href="`/datasets?tag=${tag}`"
            >
              <Tag

                type="secondary"
              >
                {{ tag }}
              </Tag>
            </NuxtLinkLocale>
          </DescriptionListDetails>
        </div>
        <div>
          <DescriptionListTerm>{{ $t('ID') }}</DescriptionListTerm>
          <DescriptionListDetails class="flex items-center gap-2">
            {{ dataset.id }}
            <CopyButton
              class="!-mt-0.5"
              :label="$t('Copy ID')"
              :copied-label="$t('ID copied')"
              :text="dataset.id"
              :hide-label="true"
            />
          </DescriptionListDetails>
        </div>
        <div v-if="dataset.license">
          <DescriptionListTerm>{{ $t('License') }}</DescriptionListTerm>
          <DescriptionListDetails>
            <License :license="dataset.license" />
          </DescriptionListDetails>
        </div>
      </DescriptionList>
    </div>
    <div class="space-y-1 py-6">
      <h3 class="uppercase text-gray-plain text-sm font-bold">
        {{ $t('Temporalité') }}
      </h3>
      <DescriptionList>
        <div>
          <DescriptionListTerm>{{ $t('Création') }}</DescriptionListTerm>
          <DescriptionListDetails>{{ formatDate(dataset.created_at) }}</DescriptionListDetails>
        </div>
        <div v-if="dataset.frequency">
          <DescriptionListTerm>{{ $t('Fréquence') }}</DescriptionListTerm>
          <DescriptionListDetails>{{ dataset.frequency.label }}</DescriptionListDetails>
        </div>
        <div v-if="dataset.temporal_coverage">
          <DescriptionListTerm>{{ $t('Couverture temporelle') }}</DescriptionListTerm>
          <DescriptionListDetails>
            <DateRangeDetails :range="dataset.temporal_coverage" />
          </DescriptionListDetails>
        </div>
        <div>
          <DescriptionListTerm>{{ $t('Dernière mise à jour') }}</DescriptionListTerm>
          <DescriptionListDetails>{{ formatDate(dataset.last_update) }}</DescriptionListDetails>
        </div>
      </DescriptionList>
    </div>
    <div
      v-if="dataset.spatial"
      class="space-y-1 py-6"
    >
      <h3 class="uppercase text-gray-plain text-sm font-bold">
        {{ $t('Couverture spatiale') }}
      </h3>
      <DescriptionList>
        <div v-if="dataset.spatial.zones && dataset.spatial.zones.length">
          <DescriptionListTerm>{{ $t('Zones') }}</DescriptionListTerm>
          <DescriptionListDetails>{{ humanJoin(dataset.spatial.zones.map(z => z.name)) }}</DescriptionListDetails>
        </div>
        <div v-if="dataset.spatial.geom">
          <DescriptionListTerm>{{ $t('Couverture géographique') }}</DescriptionListTerm>
          <DescriptionListDetails>
            <LeafletMapClient :geojson="dataset.spatial.geom" />
          </DescriptionListDetails>
        </div>
        <div v-if="dataset.spatial.granularity">
          <DescriptionListTerm>{{ $t('Granularité de la couverture territoriale') }}</DescriptionListTerm>
          <DescriptionListDetails>{{ dataset.spatial.granularity.name }}</DescriptionListDetails>
        </div>
      </DescriptionList>
    </div>
    <div
      v-if="schemas && schemas.length"
      class="space-y-1 py-6"
    >
      <h3 class="uppercase text-gray-plain text-sm font-bold">
        {{ $t('Schéma de données') }}
      </h3>
      <div class="space-y-4">
        <div
          v-for="schema, index in schemas"
          :key="index"
          class="flex flex-col md:flex-row gap-2 justify-between items-center"
        >
          <p class=" text-sm mb-0">
            {{ $t('Les fichiers du jeu de données suivent le schéma :') }}
            <Tag
              type="secondary"
              :icon="RiCheckboxCircleLine"
            >
              {{ schema.name || schema.url }}
            </Tag>
          </p>
          <!-- I think it's always true but not sure with TypeScript types… -->
          <div v-if="schema.url || schema.name">
            <BrandedButton
              color="secondary"
              :icon="RiBook2Line"
              :href="schema.url ? schema.url : `${config.public.schemasSite.url}${schema.name}`"
            >
              {{ $t('Voir la documentation du schéma') }}
            </BrandedButton>
          </div>
        </div>
        <p class="text-sm">
          <i18n-t keypath="Les schémas de données permettent de décrire des modèles de données, découvrez comment les schémas améliorent la qualité des données et quels sont les cas d'usages possibles sur {link}">
            <template #link>
              <NuxtLink
                :to="config.public.schemasSite.url"
                external
              >{{ config.public.schemasSite.name }}</NuxtLink>
            </template>
          </i18n-t>
        </p>
      </div>
    </div>
    <div class="space-y-1 py-6">
      <div class="flex items-center space-x-2 mb-1">
        <h3 class="mb-0 uppercase text-gray-plain text-sm font-bold ">
          {{ $t('Intégrer sur votre site') }}
        </h3>
        <CopyButton
          :hide-label="true"
          :label="$t('Copier le code embarqué')"
          :copied-label="$t('Code embarqué copié !')"
          :text="getDatasetOEmbedHtml('dataset', dataset.id)"
        />
      </div>
      <textarea
        ref="textAreaRef"
        class="bg-gray-lower text-gray-medium rounded font-mono text-sm px-1 py-[2px] w-full border resize-none"
        :value="getDatasetOEmbedHtml('dataset', dataset.id)"
        readonly="true"
        @click="(e) => (e.target as HTMLTextAreaElement).select()"
      />
    </div>
    <div>
      <ExtraAccordion
        v-if="dataset.extras && Object.keys(dataset.extras).length"
        class="pt-6"
        :button-text="$t('Voir les extras')"
        :title-text="$t('Extras')"
        :extra="dataset.extras"
        title-level="h3"
      />
      <ExtraAccordion
        v-if="dataset.harvest"
        :button-text="$t('Voir les extras du moissonnage')"
        :title-text="$t('Moissonnage')"
        :extra="dataset.harvest"
        title-level="h3"
      >
        <template #buttons>
          <BrandedButton
            v-if="isMeAdmin() && dataset.harvest.source_id"
            size="xs"
            color="secondary"
            :icon="RiServerLine"
            :href="`/admin/harvesters/${dataset.harvest.source_id}/`"
          >
            {{ $t('Voir la source du moissonnage') }}
          </BrandedButton>
        </template>
      </ExtraAccordion>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, CopyButton, useFormatDate, type DatasetV2WithFullObject, type Schema } from '@datagouv/components-next'
import { RiBook2Line, RiCheckboxCircleLine, RiServerLine } from '@remixicon/vue'
import LeafletMapClient from '~/components/LeafletMap.client.vue'
import ExtraAccordion from '~/datagouv-components/src/components/ExtraAccordion.vue'
import getDatasetOEmbedHtml from '~/datagouv-components/src/functions/datasets'

const props = defineProps<{ dataset: DatasetV2WithFullObject }>()

useSeoMeta({ robots: 'noindex' })

const config = useRuntimeConfig()
const { formatDate } = useFormatDate()

const { data: schemas } = await useAPI<Array<Schema>>(`/api/2/datasets/${props.dataset.id}/schemas/`)
</script>
