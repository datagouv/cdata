<template>
  <fieldset
    class="fr-fieldset"
    :class="{
      'mx-0 px-0': noMarginsAndPadding,
    }"
    :aria-labelledby="legendId"
  >
    <div class="mb-3 w-full flex items-center space-x-2">
      <legend
        :id="legendId"
        class="fr-fieldset__legend w-auto"
        :class="{
          'px-0': noMarginsAndPadding,
        }"
      >
        <h2 class="text-sm font-bold uppercase mb-0">
          {{ legend }}
        </h2>
      </legend>

      <slot name="legendAside" />
    </div>

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
