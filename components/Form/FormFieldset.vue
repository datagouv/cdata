<template>
  <fieldset
    class="fr-fieldset"
    :class="{
      'mx-0 px-0': noMarginsAndPadding,
    }"
    :aria-labelledby="legendId"
  >
    <legend
      :id="legendId"
      class="fr-fieldset__legend"
      :class="{
        'px-0': noMarginsAndPadding,
      }"
    >
      <h2 class="text-sm font-bold uppercase mb-3">
        {{ legend }}
      </h2>
    </legend>

    <slot />
  </fieldset>
</template>

<script setup lang="ts">
const legendId = useId()

defineProps<{
  legend: string
  noMarginsAndPadding?: boolean
}>()
</script>
