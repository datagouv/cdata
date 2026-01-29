<template>
  <section class="rounded-xl border border-gray-200 bg-white">
    <header class="border-b border-gray-200 p-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div class="flex items-baseline gap-3">
            <h2 class="text-xl font-semibold leading-tight text-gray-900">
              {{ title }}
            </h2>
            <SourceBadge :in-lib="inLib" />
          </div>
          <p
            v-if="description"
            class="mt-2 text-gray-600"
          >
            {{ description }}
          </p>
        </div>
        <div
          v-if="$slots.actions"
          class="flex items-center gap-2"
        >
          <slot name="actions" />
        </div>
      </div>
    </header>

    <div
      v-if="$slots.preview"
      class="border-b border-gray-200 p-6"
    >
      <h3 class="mb-4 text-sm font-medium text-gray-700">
        Aperçu
      </h3>
      <slot name="preview" />
    </div>

    <div
      v-if="$slots.props"
      class="border-b border-gray-200 p-6"
    >
      <h3 class="mb-4 text-sm font-medium text-gray-700">
        Props
      </h3>
      <slot name="props" />
    </div>

    <div
      v-if="$slots.code"
      class="border-b border-gray-200 p-6"
    >
      <h3 class="mb-4 text-sm font-medium text-gray-700">
        Exemple d'utilisation
      </h3>
      <slot name="code" />
    </div>

    <div
      v-if="$slots.variants"
      class="p-6"
    >
      <h3 class="mb-4 text-sm font-medium text-gray-700">
        Variantes
      </h3>
      <slot name="variants" />
    </div>

    <div
      v-if="$slots.default"
      class="p-6"
    >
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import SourceBadge from './SourceBadge.vue'

defineProps<{
  title: string
  description?: string
  inLib?: boolean
}>()
</script>
