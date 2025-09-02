<template>
  <div class="fr-stepper fr-mb-3w">
    <h2 class="fr-stepper__title fr-mb-3v">
      {{ currentStepName }}
      <span class="fr-stepper__state text-default-grey">{{ $t("Étape {n} sur {count}", { n: currentStep, count: steps.length }) }}</span>
    </h2>
    <div
      class="fr-stepper__steps"
      :data-fr-current-step="currentStep"
      :data-fr-steps="steps.length"
    />
    <p
      v-if="nextStep"
      class="fr-stepper__details"
    >
      <span class="fr-text--bold">{{ $t("Étape suivante :") }}</span> {{ nextStep }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type Step = string
const props = defineProps<{
  steps: Array<Step>
  currentStep: number
}>()
const currentStepName = computed(() => props.steps[props.currentStep - 1])
const nextStep = computed(() => {
  if (props.currentStep + 1 > props.steps.length) return null
  return props.steps[props.currentStep - 1 + 1]
})
</script>
