<template>
  <fieldset
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
      class="fr-fieldset__element"
      :class="{ 'fr-fieldset__element--inline': !stacked }"
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
          <span
            v-if="option.description"
            class="fr-hint-text"
          >
            {{ option.description }}
          </span>
        </label>
      </div>
    </div>
  </fieldset>
</template>

<script setup lang="ts" generic="T">
withDefaults(defineProps<{
  label: string
  options: Array<{ value: T, label: string, description?: string }>
  // One option per row, instead of all of them on a single line. Needed as soon as
  // the options carry a description.
  stacked?: boolean
}>(), {
  stacked: false,
})
const model = defineModel<T>()

const legendId = useId()
const inputPrefixId = useId()
</script>
