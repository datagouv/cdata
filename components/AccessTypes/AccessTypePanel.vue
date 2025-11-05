<template>
  <div class="space-y-1">
    <dt class="text-gray-plain font-bold">
      {{ $t('Accès') }}
    </dt>
    <dd class="p-0">
      <AccessTypeBadge
        v-if="object.access_type"
        :access-type="object.access_type"
      />
      <template v-else>
        {{ $t('Non spécifié') }}
      </template>
      <div
        v-if="object.authorization_request_url"
        class="mt-2.5"
      >
        <a
          :href="object.authorization_request_url"
          rel="ugc nofollow noopener"
          target="_blank"
          class="fr-text--sm fr-link"
        >
          {{ $t("Faire une demande d'habilitation") }}
        </a>
      </div>
    </dd>
    <template v-if="object.access_type === 'restricted'">
      <dt class="text-gray-plain font-bold mt-2.5">
        {{ $t('Publics éligibles') }}
      </dt>
      <dd
        class="p-0"
      >
        <ul
          v-if="accessAudiences.length"
          class="list-none p-0 space-y-1 m-0"
        >
          <template
            v-for="audience in accessAudiences"
            :key="audience"
          >
            <DataservicesAccessAudienceCondition
              :condition="audience.condition"
              :audience="audience.role"
            />
          </template>
        </ul>
        <template v-else>
          {{ $t('Non spécifiés') }}
        </template>
      </dd>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { AccessAudience, AccessAudienceType, WithAccessType } from '@datagouv/components-next'
import AccessTypeBadge from './AccessTypeBadge.vue'

const props = defineProps<{
  object: WithAccessType
}>()

const accessAudiences = computed(() => (['local_authority_and_administration', 'company_and_association', 'private'] as Array<AccessAudienceType>)
  .map(type => props.object.access_audiences.find(a => a.role === type))
  .filter(Boolean) as Array<AccessAudience>)
</script>
