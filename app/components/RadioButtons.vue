<template>
  <fieldset
    id="radio-inline"
    class="fr-fieldset"
    :aria-labelledby="`${legendId}`"
  >
    <legend
      :id="legendId"
      class="fr-fieldset__legend--regular fr-fieldset__legend"
    >
      {{ label }}
    </legend>
    <div
      v-for="(option, index) in options"
      :key="option.label"
      class="fr-fieldset__element fr-fieldset__element--inline"
    >
      <div class="fr-radio-group">
        <input
          :id="`${inputPrefixId}-${index}`"
          v-model="model"
          type="radio"
          :value="option.value"
        >
        <label
          class="fr-label"
          :for="`${inputPrefixId}-${index}`"
        >
          {{ option.label }}
        </label>
      </div>
    </div>
  </fieldset>
</template>

<script setup lang="ts" generic="T">
defineProps<{
  label: string
  options: Array<{ value: T, label: string }>
}>()
const model = defineModel<T>()

const legendId = useId()
const inputPrefixId = useId()
</script>
