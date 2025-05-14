<template>
  <div class="divide-y">
    <div class="space-y-1 py-6">
      <div class="uppercase text-gray-plain text-sm font-bold">
        {{ $t('Informations') }}
      </div>
      <DescriptionList>
        <div v-if="dataset.tags && dataset.tags.length">
          <DescriptionListTerm>{{ $t('Mots-clés') }}</DescriptionListTerm>
          <DescriptionListDetails>{{ humanJoin(dataset.tags) }}</DescriptionListDetails>
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
      <div class="uppercase text-gray-plain text-sm font-bold">
        {{ $t('Temporalité') }}
      </div>
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
          <DescriptionListDetails>{{ dataset.temporal_coverage }}</DescriptionListDetails>
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
      <div class="uppercase text-gray-plain text-sm font-bold">
        {{ $t('Couverture spatiale') }}
      </div>
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
      <div class="uppercase text-gray-plain text-sm font-bold">
        {{ $t('Schéma de données') }}
      </div>
      <div>
        <div
          v-for="schema, index in schemas"
          :key="index"
        >
          <div>
            <p>
              {{ $t('Les fichiers du jeu de données suivent le schéma :') }}
              <Tag
                type="secondary"
                :icon="RiCheckboxCircleLine"
              >
                {{ schema.name || schema.url }}
              </Tag>
            </p>
            <p>
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
          <div v-if="schema.url">
            <BrandedButton
              color="secondary"
              :icon="RiBook2Line"
            >
              {{ $t('Voir la documentation de schéma') }}
            </BrandedButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, CopyButton, type DatasetV2WithFullObject, type Schema } from '@datagouv/components-next'
import { RiBook2Line, RiCheckboxCircleLine } from '@remixicon/vue'
import LeafletMapClient from '~/components/LeafletMap.client.vue'

const props = defineProps<{ dataset: DatasetV2WithFullObject }>()

const config = useRuntimeConfig()

const { data: schemas } = await useAPI<Array<Schema>>(`/api/2/datasets/${props.dataset.id}/schemas/`)
</script>
