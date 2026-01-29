<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Logos
      </h1>
      <p class="mt-2 text-gray-600">
        Logos et éléments de marque data.gouv.fr.
      </p>
    </div>

    <DesignDocSection
      title="LogoImage"
      description="Logo complet data.gouv.fr en image."
      :in-lib="false"
    >
      <template #preview>
        <ComponentPreview>
          <div class="flex flex-wrap items-center gap-8">
            <div class="text-center">
              <LogoImage class="h-8" />
              <p class="mt-2 text-xs text-gray-500">
                h-8
              </p>
            </div>
            <div class="text-center">
              <LogoImage class="h-12" />
              <p class="mt-2 text-xs text-gray-500">
                h-12
              </p>
            </div>
            <div class="text-center">
              <LogoImage class="h-16" />
              <p class="mt-2 text-xs text-gray-500">
                h-16
              </p>
            </div>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="logoImageCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="LogoOnly"
      description="Icône du logo data.gouv.fr sans texte."
      :in-lib="false"
    >
      <template #preview>
        <ComponentPreview>
          <div class="flex flex-wrap items-center gap-8">
            <div class="text-center">
              <LogoOnly class="size-6" />
              <p class="mt-2 text-xs text-gray-500">
                size-6
              </p>
            </div>
            <div class="text-center">
              <LogoOnly class="size-8" />
              <p class="mt-2 text-xs text-gray-500">
                size-8
              </p>
            </div>
            <div class="text-center">
              <LogoOnly class="size-12" />
              <p class="mt-2 text-xs text-gray-500">
                size-12
              </p>
            </div>
            <div class="text-center">
              <LogoOnly class="size-16" />
              <p class="mt-2 text-xs text-gray-500">
                size-16
              </p>
            </div>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="logoOnlyCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="LogoAsText"
      description="Logo data.gouv.fr en format texte stylisé."
      :in-lib="false"
    >
      <template #preview>
        <ComponentPreview>
          <div class="flex flex-wrap items-center gap-8">
            <div class="text-center">
              <LogoAsText class="text-lg" />
              <p class="mt-2 text-xs text-gray-500">
                text-lg
              </p>
            </div>
            <div class="text-center">
              <LogoAsText class="text-2xl" />
              <p class="mt-2 text-xs text-gray-500">
                text-2xl
              </p>
            </div>
            <div class="text-center">
              <LogoAsText class="text-4xl" />
              <p class="mt-2 text-xs text-gray-500">
                text-4xl
              </p>
            </div>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="logoAsTextCode" />
      </template>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-useless-escape */
import LogoAsText from '~/components/LogoAsText.vue'
import LogoImage from '~/components/LogoImage.vue'
import LogoOnly from '~/components/LogoOnly.vue'
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'

const logoImageCode = `
<template>
  <LogoImage class="h-12" />
</template>

<script setup>
import LogoImage from '~/components/LogoImage.vue'
<\/script>
`

const logoOnlyCode = `
<template>
  <LogoOnly class="size-8" />
</template>

<script setup>
import LogoOnly from '~/components/LogoOnly.vue'
<\/script>
`

const logoAsTextCode = `
<template>
  <LogoAsText class="text-2xl" />
</template>

<script setup>
import LogoAsText from '~/components/LogoAsText.vue'
<\/script>
`
</script>
