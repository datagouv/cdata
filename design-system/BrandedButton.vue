<template>
  <div class="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
    <div
      v-for="({ disabled, loading, as }, index) in [
        { disabled: false, loading: false, as: 'button' },
        { disabled: true, loading: false, as: 'button' },
        { disabled: false, loading: true, as: 'button' },
        { disabled: false, loading: false, as: 'a' },
        { disabled: true, loading: false, as: 'a' },
        { disabled: false, loading: true, as: 'a' },
      ]"
      :key="index"
      class="space-y-5"
    >
      <div
        v-for="color in ['primary', 'primary-soft', 'primary-softer', 'secondary', 'secondary-softer', 'warning', 'danger']"
        :key="color"
        class="space-y-5"
      >
        <div>{{ as }} {{ color }} <span v-if="disabled">disabled</span> <span v-if="loading">loading</span></div>
        <div
          v-for="({ icon, text }, innerIndex) in [
            { icon: null, text: 'Explorer les données' },
            { icon: RiLightbulbFlashLine, text: 'Explorer les données' },
            { icon: RiLightbulbFlashLine, text: null },
          ]"
          :key="innerIndex"
          class="space-y-2 flex flex-col items-start"
        >
          <div
            v-for="size in ['lg', 'sm', 'xs', '2xs']"
            :key="size"
          >
            <BrandedButton
              :color
              :size
              :icon
              :loading
              :disabled
              :as
              :href="as === 'a' ? 'https://data.gouv.fr' : undefined"
            >
              {{ text }}
            </BrandedButton>
          </div>
        </div>
      </div>
    </div>

    <div>
      <BrandedButton
        href="http://dev.local:3000/datasets"
      >
        To http://dev.local:3000/datasets
      </BrandedButton>
      <BrandedButton
        href="http://dev.local:3000/datasets"
        external
      >
        To http://dev.local:3000/datasets as external
      </BrandedButton>
    </div>
    <div>
      <CdataLink
        href="http://dev.local:3000/datasets"
      >
        To http://dev.local:3000/datasets
      </CdataLink>
      <CdataLink
        href="http://dev.local:3000/datasets"
        external
      >
        To http://dev.local:3000/datasets as external
      </CdataLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { RiLightbulbFlashLine } from '@remixicon/vue'
import CdataLink from '~/components/CdataLink.vue'
</script>
