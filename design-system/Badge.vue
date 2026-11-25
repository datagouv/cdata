<template>
  <div>
    <div
      v-for="(icon, index) in [undefined, RiInformationLine]"
      :key="index"
    >
      <div
        v-for="size in sizes"
        :key="size"
      >
        <Badge
          v-for="tone in tones"
          :key="tone"
          class="mb-4 mr-4"
          :size
          :tone
          :icon
        >
          Hello
        </Badge>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge, type BadgeTone } from '@datagouv/components-next'
import { RiInformationLine } from '@remixicon/vue'

const sizes = ['xs', 'sm'] as const
const tones: Array<BadgeTone> = ['neutral', 'primary', 'success', 'warning', 'yellow', 'danger', 'pink', 'teal']
</script>
