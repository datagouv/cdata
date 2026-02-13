<template>
  <div class="space-y-12">
    <!-- Aperçu rapide des couleurs -->
    <section>
      <h2 class="text-xl font-bold mb-4">
        Aperçu des couleurs
      </h2>
      <div class="flex flex-wrap gap-4 items-start">
        <div
          v-for="color in colors"
          :key="color"
          class="flex flex-col gap-2"
        >
          <span class="text-xs text-gray-500">{{ color }}</span>
          <BrandedButton :color>
            Button
          </BrandedButton>
          <BrandedButton
            :color
            disabled
          >
            Disabled
          </BrandedButton>
        </div>
      </div>
    </section>

    <!-- Toutes les variantes -->
    <section>
      <h2 class="text-xl font-bold mb-4">
        Toutes les variantes
      </h2>
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
            v-for="color in colors"
            :key="color"
            class="space-y-5"
          >
            <div>{{ as }} {{ color }} <span v-if="disabled">disabled</span> <span v-if="loading">loading</span></div>
            <div
              v-for="({ icon, text }, innerIndex) in [
                { icon: undefined, text: 'Explorer les données' },
                { icon: RiLightbulbFlashLine, text: 'Explorer les données' },
                { icon: RiLightbulbFlashLine, text: undefined },
              ]"
              :key="innerIndex"
              class="space-y-2 flex flex-col items-start"
            >
              <div
                v-for="size in (['lg', 'sm', 'xs', '2xs'] as const)"
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
      </div>
    </section>

    <div class="space-y-4">
      <BrandedButton
        class="block"
        href="http://dev.local:3000/datasets"
      >
        To http://dev.local:3000/datasets
      </BrandedButton>
      <BrandedButton
        class="block"
        href="http://dev.local:3000/datasets"
        external
      >
        To http://dev.local:3000/datasets as external
      </BrandedButton>
      <CdataLink
        class="block"
        href="http://dev.local:3000/datasets"
      >
        To http://dev.local:3000/datasets
      </CdataLink>
      <CdataLink
        class="block"
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

const colors = ['primary', 'secondary', 'tertiary', 'warning', 'danger', 'brown-illustration', 'green-illustration', 'white-flat'] as const
</script>
