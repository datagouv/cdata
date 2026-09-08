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
      :class="{ 'fr-fieldset__element--inline': !hasDescriptions }"
    >
      <div
        class="fr-radio-group"
        :class="{ 'fr-radio-rich': hasDescriptions }"
      >
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
const props = defineProps<{
  label: string
  options: Array<{ value: T, label: string, description?: string }>
}>()
const model = defineModel<T>()

// Descriptions need the room a single line of inline options doesn't have, and
// the bordered `fr-radio-rich` card to separate one option from the next.
const hasDescriptions = computed(() => props.options.some(option => option.description))

const legendId = useId()
const inputPrefixId = useId()
</script>
