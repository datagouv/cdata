<template>
  <section class="space-y-3">
    <h2>
      SegmentedControl
    </h2>
    <div class="flex flex-col gap-4 items-start">
      <SegmentedControl
        v-model="compact"
        :options="[
          { value: 'edit', label: 'Modifier', icon: RiEditLine },
          { value: 'preview', label: 'Prévisualiser', icon: RiEyeLine },
        ]"
      />
      <div class="w-80">
        <SegmentedControl
          v-model="grown"
          grow
          :options="[
            { value: 'color', label: 'Couleur', icon: RiPaletteLine },
            { value: 'upload', label: 'Importer', icon: RiImageLine },
          ]"
        />
      </div>
      <SegmentedControl
        v-model="underlined"
        underline
        :options="[
          { value: 'color', label: 'Couleur', icon: RiPaletteLine },
          { value: 'upload', label: 'Importer', icon: RiImageLine },
        ]"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { RiEyeLine, RiEditLine, RiImageLine, RiPaletteLine } from '@remixicon/vue'
import { SegmentedControl } from '@datagouv/components-next'

const compact = ref('edit')
const grown = ref('color')
const underlined = ref('color')
</script>
