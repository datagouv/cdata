<template>
  <aside
    class="w-full max-w-96 space-y-6"
    :aria-label="ariaLabel"
  >
    <template v-if="dataset">
      <dl class="m-0 space-y-4 p-0">
        <div>
          <dt class="mb-0.5 text-sm/5 font-normal text-gray-secondary">
            {{ dataset.harvest ? $t('Diffuseur') : $t('Producteur') }}
          </dt>
          <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
            <OrganizationOwner
              v-if="dataset.organization"
              :organization="dataset.organization"
              as="h3"
              name-size="sm"
              name-color="text-gray-title"
            />
            <span v-else>{{ ownerName(dataset) }}</span>
          </dd>
        </div>
        <div>
          <dt class="mb-0.5 text-sm/5 font-normal text-gray-secondary">
            {{ $t('Attributions') }}
          </dt>
          <dd class="m-0 space-y-1 p-0 text-sm/[22px] text-gray-title">
            <template v-if="dataset.contact_points?.length">
              <ContactPoint
                v-for="contact in dataset.contact_points"
                :key="contact.id"
                :contact
              />
            </template>
            <MetadataEmptyValue v-else />
          </dd>
        </div>
        <div>
          <dt class="mb-0.5 text-sm/5 font-normal text-gray-secondary">
            {{ $t('Licence') }}
          </dt>
          <dd class="m-0 p-0">
            <template v-if="dataset.license">
              <TechnicalValue
                :value="dataset.license.title"
                :href="dataset.license.url"
                :copy-text="dataset.license.url || dataset.license.title"
                :label="$t('Copier la licence')"
                :copied-label="$t('Licence copiée !')"
              />
            </template>
            <MetadataEmptyValue v-else />
          </dd>
        </div>
        <div>
          <dt class="mb-0.5 text-sm/5 font-normal text-gray-secondary">
            {{ $t('Dernière mise à jour') }}
          </dt>
          <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
            <FormattedDate :date="dataset.last_update" />
          </dd>
        </div>
        <AccessTypePanel
          v-if="dataset.access_type !== 'open'"
          :object="dataset"
        />
      </dl>
      <DatasetQuality
        v-if="dataset.quality"
        :quality="dataset.quality"
      />
      <SimpleBanner
        v-if="dataset.harvest && 'remote_url' in dataset.harvest"
        type="gray"
        :icon="RiExternalLinkLine"
      >
        {{ $t("Ce jeu de données provient d'un portail externe.") }}
        <CdataLink
          :to="dataset.harvest.remote_url as string"
          external
          target="_blank"
          rel="noopener noreferrer"
          class="bg-none text-gray-title visited:text-gray-title underline decoration-1 underline-offset-3 hover:text-new-primary focus-visible:text-new-primary"
        >
          {{ $t('Voir la source originale.') }}
        </CdataLink>
      </SimpleBanner>
    </template>

    <template v-else-if="dataservice">
      <dl class="m-0 space-y-4 p-0">
        <div>
          <dt class="mb-0.5 text-sm/5 font-normal text-gray-secondary">
            {{ $t('Producteur') }}
          </dt>
          <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
            <OrganizationOwner
              v-if="dataservice.organization"
              :organization="dataservice.organization"
              as="h3"
              name-size="sm"
              name-color="text-gray-title"
            />
            <span v-else>{{ ownerName(dataservice) }}</span>
          </dd>
        </div>
        <div>
          <dt class="mb-0.5 text-sm/5 font-normal text-gray-secondary">
            {{ $t('Contact') }}
          </dt>
          <dd class="m-0 space-y-1 p-0 text-sm/[22px] text-gray-title">
            <template v-if="dataservice.contact_points?.length">
              <ContactPoint
                v-for="contact in dataservice.contact_points"
                :key="contact.id"
                :contact
              />
            </template>
            <MetadataEmptyValue v-else />
          </dd>
        </div>
        <AccessTypePanel :object="dataservice" />
        <div>
          <dt class="mb-0.5 text-sm/5 font-normal text-gray-secondary">
            {{ $t(`URL de base de l'API`) }}
          </dt>
          <dd class="m-0 p-0">
            <template v-if="dataservice.base_api_url">
              <TechnicalValue
                :value="dataservice.base_api_url"
                :href="dataservice.base_api_url"
                :label="$t(`Copier l'URL de base de l'API`)"
                :copied-label="$t('URL copiée !')"
              />
            </template>
            <MetadataEmptyValue v-else />
          </dd>
        </div>
        <div>
          <dt class="mb-0.5 text-sm/5 font-normal text-gray-secondary">
            {{ $t(`Limite d'appels`) }}
          </dt>
          <dd class="m-0 space-y-1 p-0 text-sm/[22px] text-gray-title">
            <template v-if="dataservice.rate_limiting || dataservice.rate_limiting_url">
              <span v-if="dataservice.rate_limiting">{{ dataservice.rate_limiting }}</span>
              <TechnicalValue
                v-if="dataservice.rate_limiting_url"
                :value="dataservice.rate_limiting_url"
                :href="dataservice.rate_limiting_url"
                :label="$t(`Copier l'URL des limites d'appels`)"
                :copied-label="$t('URL copiée !')"
              />
            </template>
            <MetadataEmptyValue v-else />
          </dd>
        </div>
        <div>
          <dt class="mb-0.5 text-sm/5 font-normal text-gray-secondary">
            {{ $t('Taux de disponibilité') }}
          </dt>
          <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
            {{ dataservice.availability !== null ? `${dataservice.availability} %` : $t('Non communiqué') }}
          </dd>
        </div>
        <div>
          <dt class="mb-0.5 text-sm/5 font-normal text-gray-secondary">
            {{ $t('Documentation métier') }}
          </dt>
          <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
            <template v-if="dataservice.business_documentation_url">
              <CdataLink
                :href="dataservice.business_documentation_url"
                external
                target="_blank"
                rel="noopener noreferrer"
                class="bg-none text-gray-title visited:text-gray-title underline decoration-1 underline-offset-3 hover:text-new-primary focus-visible:text-new-primary"
              >
                {{ $t('Consulter la documentation métier') }}
              </CdataLink>
            </template>
            <MetadataEmptyValue v-else />
          </dd>
        </div>
        <div>
          <dt class="mb-0.5 text-sm/5 font-normal text-gray-secondary">
            {{ $t('Documentation technique') }}
          </dt>
          <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
            <template v-if="dataservice.technical_documentation_url">
              <CdataLink
                :href="dataservice.technical_documentation_url"
                external
                target="_blank"
                rel="noopener noreferrer"
                class="bg-none text-gray-title visited:text-gray-title underline decoration-1 underline-offset-3 hover:text-new-primary focus-visible:text-new-primary"
              >
                {{ $t('Consulter la documentation technique') }}
              </CdataLink>
            </template>
            <MetadataEmptyValue v-else />
          </dd>
        </div>
        <div>
          <dt class="mb-0.5 text-sm/5 font-normal text-gray-secondary">
            {{ $t('Documentation machine') }}
          </dt>
          <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
            <template v-if="dataservice.machine_documentation_url">
              <CdataLink
                :href="dataservice.machine_documentation_url"
                external
                target="_blank"
                rel="noopener noreferrer"
                class="bg-none text-gray-title visited:text-gray-title underline decoration-1 underline-offset-3 hover:text-new-primary focus-visible:text-new-primary"
              >
                {{ $t('Swagger / OpenAPI') }}
              </CdataLink>
            </template>
            <MetadataEmptyValue v-else />
          </dd>
        </div>
      </dl>
      <DataserviceQuality
        v-if="dataservice.quality"
        :quality="dataservice.quality"
      />
    </template>

    <template v-else-if="reuse">
      <dl class="m-0 space-y-4 p-0">
        <div>
          <dt class="mb-0.5 text-sm/5 font-normal text-gray-secondary">
            {{ $t('Thématique') }}
          </dt>
          <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
            {{ reuseTopic || reuse.topic }}
          </dd>
        </div>
        <div>
          <dt class="mb-0.5 text-sm/5 font-normal text-gray-secondary">
            {{ $t('Type') }}
          </dt>
          <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
            {{ reuseType || reuse.type }}
          </dd>
        </div>
        <div>
          <dt class="mb-0.5 text-sm/5 font-normal text-gray-secondary">
            {{ $t('Mots clés') }}
          </dt>
          <dd class="m-0 flex flex-wrap gap-2 p-0 text-sm/[22px] text-gray-title">
            <Tag
              v-for="tag in reuse.tags"
              :key="tag"
            >
              {{ tag }}
            </Tag>
            <span v-if="!reuse.tags?.length">{{ $t('Aucun mot clé') }}</span>
          </dd>
        </div>
        <div>
          <dt class="mb-0.5 text-sm/5 font-normal text-gray-secondary">
            {{ $t('Dernière mise à jour') }}
          </dt>
          <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
            <FormattedDate :date="reuse.last_modified" />
          </dd>
        </div>
        <div>
          <dt class="mb-0.5 text-sm/5 font-normal text-gray-secondary">
            {{ $t('Date de création') }}
          </dt>
          <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
            <FormattedDate :date="reuse.created_at" />
          </dd>
        </div>
      </dl>
    </template>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DataserviceQuality, DatasetQuality, MetadataEmptyValue, FormattedDate, SimpleBanner, Tag, TechnicalValue, type Dataservice, type DatasetV2WithFullObject, type Reuse } from '@datagouv/components-next'
import { RiExternalLinkLine } from '@remixicon/vue'
import AccessTypePanel from '~/components/AccessTypes/AccessTypePanel.vue'
import CdataLink from '~/components/CdataLink.vue'
import ContactPoint from '~/components/ContactPoint.vue'
import OrganizationOwner from '~/components/OrganizationOwner.vue'

const props = defineProps<{
  dataset?: DatasetV2WithFullObject | null
  dataservice?: Dataservice | null
  reuse?: Reuse | null
  reuseTopic?: string
  reuseType?: string
}>()

const ariaLabel = computed(() => props.dataset
  ? 'Métadonnées latérales du jeu de données'
  : props.dataservice
    ? 'Métadonnées latérales de l’API'
    : 'Métadonnées latérales de la réutilisation')

function ownerName(object: DatasetV2WithFullObject | Dataservice): string {
  return object.owner ? `${object.owner.first_name} ${object.owner.last_name}` : '—'
}
</script>
