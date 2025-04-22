<template>
  <div>
    <h2 class="!text-sm !mb-2.5">
      {{ $t('Organization description') }}
    </h2>
    <div class="flex flex-wrap">
      <MarkdownViewer
        class="w-full md:w-9/12"
        :content="reuse.description"
        :min-heading="3"
      />
      <div class="w-full md:w-3/12">
        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Reuse } from '@datagouv/components-next'

defineProps<{
  reuse: Reuse
}>()
</script>
