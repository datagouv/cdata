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

      <div v-if="dataservice.contact_points.length">
        <DescriptionListTerm>
          {{ $t('Contact') }}
        </DescriptionListTerm>
        <dd class="m-0 space-y-1 p-0 text-sm/[22px] text-gray-title">
          <ContactPoint
            v-for="contact in dataservice.contact_points"
            :key="contact.id"
            :contact
          />
        </dd>
      </div>

      <AccessTypePanel :object="dataservice" />

      <div v-if="dataservice.base_api_url">
        <DescriptionListTerm>
          {{ $t(`URL de base de l'API`) }}
        </DescriptionListTerm>
        <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
          <TechnicalValue
            :value="dataservice.base_api_url"
            :href="dataservice.base_api_url"
            :label="$t(`Copier l'URL de base de l'API`)"
            :copied-label="$t('URL copiée !')"
          />
        </dd>
      </div>

      <div v-if="dataservice.rate_limiting || dataservice.rate_limiting_url">
        <DescriptionListTerm>
          {{ $t(`Limite d'appels`) }}
        </DescriptionListTerm>
        <dd class="m-0 space-y-1 p-0 text-sm/[22px] text-gray-title">
          <span v-if="dataservice.rate_limiting">{{ dataservice.rate_limiting }}</span>
          <TechnicalValue
            v-if="dataservice.rate_limiting_url"
            :value="dataservice.rate_limiting_url"
            :href="dataservice.rate_limiting_url"
            :label="$t(`Copier l'URL des limites d'appels`)"
            :copied-label="$t('URL copiée !')"
          />
        </dd>
      </div>

      <div>
        <DescriptionListTerm>
          {{ $t('Taux de disponibilité') }}
        </DescriptionListTerm>
        <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
          {{ dataservice.availability !== null ? `${dataservice.availability} %` : $t('Non communiqué') }}
        </dd>
      </div>

      <div v-if="dataservice.business_documentation_url">
        <DescriptionListTerm>
          {{ $t('Documentation métier') }}
        </DescriptionListTerm>
        <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
          <CdataLink
            :href="dataservice.business_documentation_url"
            external
            target="_blank"
            rel="ugc nofollow noopener"
            class="bg-none text-gray-title visited:text-gray-title underline decoration-1 underline-offset-3 hover:text-new-primary focus-visible:text-new-primary"
          >
            {{ $t('Consulter la documentation métier') }}
          </CdataLink>
        </dd>
      </div>

      <div v-if="dataservice.technical_documentation_url">
        <DescriptionListTerm>
          {{ $t('Documentation technique') }}
        </DescriptionListTerm>
        <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
          <CdataLink
            :href="dataservice.technical_documentation_url"
            external
            target="_blank"
            rel="ugc nofollow noopener"
            class="bg-none text-gray-title visited:text-gray-title underline decoration-1 underline-offset-3 hover:text-new-primary focus-visible:text-new-primary"
          >
            {{ $t('Consulter la documentation technique') }}
          </CdataLink>
        </dd>
      </div>

      <div v-if="dataservice.machine_documentation_url">
        <DescriptionListTerm>
          {{ $t('Documentation machine') }}
        </DescriptionListTerm>
        <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
          <CdataLink
            :href="dataservice.machine_documentation_url"
            external
            target="_blank"
            rel="ugc nofollow noopener"
            class="bg-none text-gray-title visited:text-gray-title underline decoration-1 underline-offset-3 hover:text-new-primary focus-visible:text-new-primary"
          >
            {{ $t('Swagger / OpenAPI') }}
          </CdataLink>
        </dd>
      </div>
    </dl>

    <DataserviceQuality
      v-if="dataservice.quality"
      :quality="dataservice.quality"
      hide-warnings
    />
  </aside>
</template>

<script setup lang="ts">
import { AvatarWithName, DataserviceQuality, TechnicalValue, type Dataservice } from '@datagouv/components-next'
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
