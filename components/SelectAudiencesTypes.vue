<template>
  <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-4 items-end">
    <SelectGroup
      v-for="accessAudienceType in accessAudienceTypes"
      :key="accessAudienceType"
      v-model="accessAudiences[accessAudienceType]"
      class="mb-0"
      :label="getAccessAudienceType(accessAudienceType)"
      :options="accessAudienceConditionOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { SelectGroup, type AccessAudienceCondition, type AccessAudienceType } from '@datagouv/components-next'
import { computed } from 'vue'

const accessAudiences = defineModel<Record<AccessAudienceType, AccessAudienceCondition>>({ required: true })

const { getAccessAudienceCondition, getAccessAudienceType } = useAccessAudience()

const accessAudienceConditions: Array<AccessAudienceCondition> = ['yes', 'no', 'under_condition']

const accessAudienceTypes: Array<AccessAudienceType> = ['local_authority_and_administration', 'company_and_association', 'private']
const accessAudienceConditionOptions = computed(() => accessAudienceConditions.map(condition => ({
  value: condition,
  label: getAccessAudienceCondition(condition).label,
})))
</script>
