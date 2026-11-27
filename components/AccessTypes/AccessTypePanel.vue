<template>
  <!-- Two items of the parent description list, not a block of their own: they get the same
       spacing as the other metadata. The access request button is placed by the parent, at the
       end of the side metadata (see AccessRequestButton). -->
  <div>
    <DescriptionListTerm :class="{ 'sr-only': hideAccessLabel }">
      {{ $t('Accès') }}
    </DescriptionListTerm>
    <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
      <AccessTypeBadge
        v-if="object.access_type"
        :access-type="object.access_type"
      />
      <template v-else>
        {{ $t('Non spécifié') }}
      </template>
    </dd>
  </div>
  <div v-if="object.access_type === 'restricted'">
    <DescriptionListTerm>
      {{ $t('Publics éligibles') }}
    </DescriptionListTerm>
    <dd class="m-0 p-0 text-sm/[22px] text-gray-title">
      <ul
        v-if="accessAudiences.length"
        class="m-0 list-none space-y-1 p-0"
      >
        <DataservicesAccessAudienceCondition
          v-for="audience in accessAudiences"
          :key="`${audience.role}-${audience.condition}`"
          :condition="audience.condition"
          :audience="audience.role"
        />
      </ul>
      <template v-else>
        {{ $t('Non spécifiés') }}
      </template>
    </dd>
  </div>
</template>

<script setup lang="ts">
import { AccessTypeBadge, type AccessAudience, type AccessAudienceType, type WithAccessType } from '@datagouv/components-next'
import DescriptionListTerm from '~/components/DescriptionList/DescriptionListTerm.vue'

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
