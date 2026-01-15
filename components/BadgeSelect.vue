<template>
  <SearchableSelect
    v-if="isMeAdmin() && badgeOptions.length"
    v-model="model"
    :label="$t('Badges')"
    :placeholder="$t('Associer des badges…')"
    class="mb-6"
    data-testid="badge-select"
    :options="badgeOptions"
    :get-option-id="(badge) => badgesLabels?.[badge.kind] ?? badge.kind"
    :display-value="(badges) => badges ? humanJoin(badges.map(b => badgesLabels?.[b.kind] ?? b.kind)) : ''"
    :multiple="true"
  />
</template>

<script setup lang="ts">
import type { Badge } from '@datagouv/components-next'

const props = defineProps<{
  entityType: 'organizations' | 'datasets' | 'reuses'
}>()

const model = defineModel<Array<Badge>>({ required: true })

const { data: badgesLabels } = await useAPI<Record<string, string>>(
  `/api/1/${props.entityType}/badges/`,
)

const badgeOptions = computed(() =>
  Object.keys(badgesLabels.value ?? {}).map(kind => ({ kind })),
)
</script>
