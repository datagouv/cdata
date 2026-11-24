<template>
  <div class="space-y-1 text-sm/5 text-gray-title">
    <dt
      class="text-sm/5 font-normal text-gray-secondary"
      :class="{ 'sr-only': hideAccessLabel }"
    >
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
    </dd>
    <template v-if="object.access_type === 'restricted'">
      <dt class="mt-2.5 text-sm/5 font-normal text-gray-secondary">
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
            :key="`${audience.role}-${audience.condition}`"
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
    <div
      v-if="object.authorization_request_url"
      class="mt-2.5"
    >
      <BrandedButton
        color="primary"
        size="sm"
        :href="object.authorization_request_url"
        new-tab
      >
        {{ $t("Demander un accès") }}
      </BrandedButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, type AccessAudience, type AccessAudienceType, type WithAccessType, AccessTypeBadge } from '@datagouv/components-next'

const props = withDefaults(defineProps<{
  object: WithAccessType
  hideAccessLabel?: boolean
}>(), {
  hideAccessLabel: false,
})

const accessAudiences = computed(() => (['local_authority_and_administration', 'company_and_association', 'private'] as Array<AccessAudienceType>)
  .map(type => props.object.access_audiences.find(a => a.role === type))
  .filter(Boolean) as Array<AccessAudience>)
</script>
