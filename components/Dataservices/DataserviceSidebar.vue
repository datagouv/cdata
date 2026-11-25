<template>
  <aside
    class="flex w-full min-w-0 flex-col gap-6 pl-0"
  >
    <dl class="m-0 space-y-4 p-0">
      <div>
        <DescriptionListTerm>
          {{ $t('Producteur') }}
        </DescriptionListTerm>
        <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
          <OrganizationOwner
            v-if="dataservice.organization"
            :organization="dataservice.organization"
            as="h2"
            name-size="sm"
            name-color="text-gray-title"
          />
          <AvatarWithName
            v-if="dataservice.owner"
            :size="32"
            :user="dataservice.owner"
            class="space-x-2"
          />
        </dd>
      </div>

      <div>
        <DescriptionListTerm>
          {{ $t('Contact') }}
        </DescriptionListTerm>
        <dd class="m-0 space-y-1 p-0 text-sm/[22px] text-gray-title">
          <ContactPoint
            v-for="contact in dataservice.contact_points"
            :key="contact.id"
            :contact
          />
          <MetadataEmptyValue v-if="!dataservice.contact_points.length" />
        </dd>
      </div>

      <AccessTypePanel :object="dataservice" />

      <div>
        <DescriptionListTerm>
          {{ $t(`URL de base de l'API`) }}
        </DescriptionListTerm>
        <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
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
        <DescriptionListTerm>
          {{ $t(`Limite d'appels`) }}
        </DescriptionListTerm>
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
        <DescriptionListTerm>
          {{ $t('Taux de disponibilité') }}
        </DescriptionListTerm>
        <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
          <template v-if="dataservice.availability !== null">
            {{ `${dataservice.availability} %` }}
          </template>
          <MetadataEmptyValue v-else />
        </dd>
      </div>

      <div>
        <DescriptionListTerm>
          {{ $t('Documentation métier') }}
        </DescriptionListTerm>
        <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
          <template v-if="dataservice.business_documentation_url">
            <CdataLink
              :href="dataservice.business_documentation_url"
              external
              target="_blank"
              rel="ugc nofollow noopener"
              class="bg-none text-gray-title visited:text-gray-title underline decoration-1 underline-offset-3 hover:text-new-primary focus-visible:text-new-primary"
            >
              {{ $t('Consulter la documentation métier') }}
            </CdataLink>
          </template>
          <MetadataEmptyValue v-else />
        </dd>
      </div>

      <div>
        <DescriptionListTerm>
          {{ $t('Documentation technique') }}
        </DescriptionListTerm>
        <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
          <template v-if="dataservice.technical_documentation_url">
            <CdataLink
              :href="dataservice.technical_documentation_url"
              external
              target="_blank"
              rel="ugc nofollow noopener"
              class="bg-none text-gray-title visited:text-gray-title underline decoration-1 underline-offset-3 hover:text-new-primary focus-visible:text-new-primary"
            >
              {{ $t('Consulter la documentation technique') }}
            </CdataLink>
          </template>
          <MetadataEmptyValue v-else />
        </dd>
      </div>

      <div>
        <DescriptionListTerm>
          {{ $t('Documentation machine') }}
        </DescriptionListTerm>
        <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
          <template v-if="dataservice.machine_documentation_url">
            <CdataLink
              :href="dataservice.machine_documentation_url"
              external
              target="_blank"
              rel="ugc nofollow noopener"
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
  </aside>
</template>

<script setup lang="ts">
import { AvatarWithName, DataserviceQuality, MetadataEmptyValue, TechnicalValue, type Dataservice } from '@datagouv/components-next'
import AccessTypePanel from '~/components/AccessTypes/AccessTypePanel.vue'
import CdataLink from '~/components/CdataLink.vue'
import ContactPoint from '~/components/ContactPoint.vue'
import DescriptionListTerm from '~/components/DescriptionList/DescriptionListTerm.vue'
import OrganizationOwner from '~/components/OrganizationOwner.vue'

// Side metadata of a dataservice page. Also shown on /design/metadata: the design page and
// the dataservice pages render this same component, so they cannot drift apart.
defineProps<{
  dataservice: Dataservice
}>()
</script>
