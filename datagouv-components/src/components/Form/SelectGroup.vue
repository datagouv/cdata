<template>
  <div
    class="fr-select-group"
    :class="selectGroupClass"
  >
    <label
      v-if="!hideLabel"
      class="fr-label"
      :for="id"
    >
      {{ label }}
      <span
        v-if="required"
        class="text-new-primary"
      >*</span>
      <span
        v-if="hintText"
        class="fr-hint-text"
      >{{ hintText }}</span>
    </label>
    <select
      :id="id"
      v-model="model"
      class="fr-select group-data-[input-color=blue]/form:!shadow-input-blue"
      :class="{ 'fr-select--error': hasError, 'fr-select--valid': isValid }"
      :aria-describedby="ariaDescribedBy"
      :aria-label="hideLabel ? label : undefined"
      :required="required"
      :disabled="disabled"
    >
      <option
        v-if="! hideNullOption"
        :value="null"
        disabled
        hidden
      >
        {{ t('Sélectionner une option') }}
      </option>
      <option
        v-for="option in options"
        :key="String(option.value ?? option.label)"
        :value="option.value"
        :disabled="option.disabled"
        :hidden="option.hidden"
      >
        {{ option.label }}
      </option>
    </select>
    <p
      v-if="isValid"
      :id="validTextId"
      class="fr-valid-text"
    >
      {{ validText }}
    </p>
    <p
      v-else-if="hasError"
      :id="errorTextId"
      class="fr-error-text"
    >
      {{ errorText }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { useTranslation } from '../../composables/useTranslation'

export type SelectOption = {
  label: string
  value?: string | boolean | null | undefined
  disabled?: boolean
  hidden?: boolean
  selected?: boolean
}

export type SelectGroupProps = {
  disabled?: boolean
  errorText?: string | null
  hasError?: boolean
  hintText?: string
  isValid?: boolean
  label: string
  hideLabel?: boolean
  modelValue?: string | boolean | null
  options: Array<SelectOption>
  required?: boolean
  validText?: string
  hideNullOption?: boolean
}

const model = defineModel<string | boolean | null>()

const props = withDefaults(defineProps<SelectGroupProps>(), {
  disabled: false,
  errorText: '',
  hasError: false,
  hintText: '',
  isValid: false,
  modelValue: undefined,
  required: false,
  validText: '',
  hideLabel: false,
  hideNullOption: false,
})

const { t } = useTranslation()

const id = useId()

const errorTextId = computed(() => id + '-desc-error')
const validTextId = computed(() => id + '-desc-valid')
const ariaDescribedBy = computed(() => {
  let describedBy = ''
  if (props.isValid) {
    describedBy += ' ' + validTextId.value
  }
  else if (props.hasError) {
    describedBy += ' ' + errorTextId.value
  }
  return describedBy
})

const selectGroupClass = computed(() => {
  return {
    'fr-select-group--disabled': props.disabled,
    'fr-select-group--error': props.hasError,
    'fr-select-group--valid': props.isValid,
  }
})
</script>
