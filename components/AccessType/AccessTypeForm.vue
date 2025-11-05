<template>
  <div class="space-y-3">
    <RadioButtons
      v-model="form.access_type"
      class="!mb-0"
      :label="$t(`Type d'accès`)"
      :options="disallowOpenWithAccount ? [
        { value: 'open', label: $t('Ouvert') },
        { value: 'restricted', label: $t('Restreint') },
      ] : [
        { value: 'open', label: $t('Ouvert') },
        { value: 'open_with_account', label: $t('Ouvert avec compte') },
        { value: 'restricted', label: $t('Restreint') },
      ]"
    />
    <SimpleBanner
      v-if="getFirstWarning('access_type')"
      class="mt-2"
      type="warning"
    >
      {{ getFirstWarning("access_type") }}
    </SimpleBanner>
    <template v-if="form.access_type === 'restricted'">
      <SelectAudiencesTypes
        v-model="form.access_audiences"
      />
      <SelectGroup
        v-model="form.access_type_reason_category"
        :label="$t('Raison de la restriction')"
        :options="categoriesWithOthers"
      />
      <InputGroup
        v-if="form.access_type_reason_category === 'other'"
        v-model="form.access_type_reason"
        :label="$t('Veuillez préciser la raison')"
        :has-error="!!getFirstError('access_type_reason')"
        :has-warning="!!getFirstWarning('access_type_reason')"
        :error-text="getFirstError('access_type_reason')"
      />
      <SimpleBanner
        v-if="getFirstWarning('access_type_reason')"
        type="warning"
      >
        {{ getFirstWarning("access_type_reason") }}
      </SimpleBanner>
    </template>
  </div>
</template>

<script setup lang="ts">
import { SimpleBanner, type AccessTypeForm } from '@datagouv/components-next'
import SelectGroup from '../Form/SelectGroup/SelectGroup.vue'

defineProps<{
  getFirstWarning: (key: string) => string | null
  getFirstError: (key: string) => string | null
  disallowOpenWithAccount?: boolean
}>()

const form = defineModel<AccessTypeForm>({ required: true })
const { t } = useTranslation()

const { data: categories } = await useAPI<Array<{ value: string, label: string }>>('/api/1/access_type/reason_categories')

const categoriesWithOthers = computed(() => {
  return [...(categories.value || []), { value: 'other', label: t('Autre') }]
})

watch(() => form.value.access_type_reason_category, (newValue, oldValue) => {
  if (oldValue === 'other' && newValue !== 'other') {
    form.value.access_type_reason = ''
  }
})
</script>
