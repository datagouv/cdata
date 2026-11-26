<template>
  <section
    :id
    class="scroll-mt-4"
  >
    <h2 class="text-xl font-bold mb-1">
      <a
        :href="`#${id}`"
        class="bg-none text-inherit no-underline hover:underline"
      >{{ title }}</a>
    </h2>
    <p
      v-if="description"
      class="text-sm text-gray-medium mb-4 max-w-3xl"
    >
      {{ description }}
    </p>
    <div class="border border-gray-default">
      <div
        class="p-6 overflow-x-auto"
        :class="previewClass"
      >
        <slot />
      </div>
      <details
        v-if="code"
        class="border-t border-gray-default"
      >
        <summary class="cursor-pointer px-4 py-2 text-sm text-gray-medium select-none">
          Voir le code
        </summary>
        <pre class="m-0 px-4 pb-4 text-xs overflow-x-auto"><code>{{ code }}</code></pre>
      </details>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  id: string
  title: string
  description?: string
  code?: string
  previewClass?: string
}>()
</script>
