<template>
  <div class="space-y-8 p-8">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">
        Couleurs
      </h1>
      <p class="mt-2 text-gray-600">
        Palette de couleurs utilisée dans le design system data.gouv.fr.
      </p>
    </div>

    <DesignDocSection
      title="Couleurs principales"
      description="Couleurs de la marque data.gouv.fr."
      :in-lib="true"
    >
      <template #preview>
        <ComponentPreview :show-controls="false">
          <div class="space-y-6">
            <div>
              <h4 class="mb-3 text-sm font-medium text-gray-700">
                Datagouv (Primary)
              </h4>
              <div class="flex gap-2">
                <div class="flex flex-col items-center">
                  <div class="size-16 rounded-lg bg-datagouv" />
                  <span class="mt-1 text-xs text-gray-500">datagouv</span>
                </div>
                <div class="flex flex-col items-center">
                  <div class="size-16 rounded-lg bg-datagouv-lightest" />
                  <span class="mt-1 text-xs text-gray-500">lightest</span>
                </div>
              </div>
            </div>

            <div>
              <h4 class="mb-3 text-sm font-medium text-gray-700">
                Danger
              </h4>
              <div class="flex gap-2">
                <div class="flex flex-col items-center">
                  <div class="size-16 rounded-lg bg-danger-dark" />
                  <span class="mt-1 text-xs text-gray-500">dark</span>
                </div>
                <div class="flex flex-col items-center">
                  <div class="size-16 rounded-lg bg-danger-lightest" />
                  <span class="mt-1 text-xs text-gray-500">lightest</span>
                </div>
              </div>
            </div>

            <div>
              <h4 class="mb-3 text-sm font-medium text-gray-700">
                Warning
              </h4>
              <div class="flex gap-2">
                <div class="flex flex-col items-center">
                  <div class="size-16 rounded-lg bg-warning-dark" />
                  <span class="mt-1 text-xs text-gray-500">dark</span>
                </div>
                <div class="flex flex-col items-center">
                  <div class="size-16 rounded-lg bg-warning-lightest" />
                  <span class="mt-1 text-xs text-gray-500">lightest</span>
                </div>
              </div>
            </div>

            <div>
              <h4 class="mb-3 text-sm font-medium text-gray-700">
                Success
              </h4>
              <div class="flex gap-2">
                <div class="flex flex-col items-center">
                  <div class="size-16 rounded-lg bg-success-dark" />
                  <span class="mt-1 text-xs text-gray-500">dark</span>
                </div>
                <div class="flex flex-col items-center">
                  <div class="size-16 rounded-lg bg-success-lightest" />
                  <span class="mt-1 text-xs text-gray-500">lightest</span>
                </div>
              </div>
            </div>
          </div>
        </ComponentPreview>
      </template>

      <template #code>
        <CodeExample :code="colorsCode" />
      </template>
    </DesignDocSection>

    <DesignDocSection
      title="Classes Tailwind"
      description="Classes CSS disponibles pour les couleurs."
      :in-lib="true"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-gray-900">
                Couleur
              </th>
              <th class="px-4 py-3 text-left font-medium text-gray-900">
                Background
              </th>
              <th class="px-4 py-3 text-left font-medium text-gray-900">
                Text
              </th>
              <th class="px-4 py-3 text-left font-medium text-gray-900">
                Border
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr
              v-for="color in colorClasses"
              :key="color.name"
            >
              <td class="px-4 py-3 font-medium">
                {{ color.name }}
              </td>
              <td class="px-4 py-3">
                <code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{{ color.bg }}</code>
              </td>
              <td class="px-4 py-3">
                <code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{{ color.text }}</code>
              </td>
              <td class="px-4 py-3">
                <code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{{ color.border }}</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </DesignDocSection>
  </div>
</template>

<script setup lang="ts">
import CodeExample from '~/design-system/CodeExample.vue'
import ComponentPreview from '~/design-system/ComponentPreview.vue'
import DesignDocSection from '~/design-system/DesignDocSection.vue'

const colorClasses = [
  { name: 'Datagouv', bg: 'bg-datagouv', text: 'text-datagouv', border: 'border-datagouv' },
  { name: 'Datagouv Lightest', bg: 'bg-datagouv-lightest', text: 'text-datagouv-lightest', border: 'border-datagouv-lightest' },
  { name: 'Danger Dark', bg: 'bg-danger-dark', text: 'text-danger-dark', border: 'border-danger-dark' },
  { name: 'Danger Lightest', bg: 'bg-danger-lightest', text: 'text-danger-lightest', border: 'border-danger-lightest' },
  { name: 'Warning Dark', bg: 'bg-warning-dark', text: 'text-warning-dark', border: 'border-warning-dark' },
  { name: 'Warning Lightest', bg: 'bg-warning-lightest', text: 'text-warning-lightest', border: 'border-warning-lightest' },
  { name: 'Success Dark', bg: 'bg-success-dark', text: 'text-success-dark', border: 'border-success-dark' },
  { name: 'Success Lightest', bg: 'bg-success-lightest', text: 'text-success-lightest', border: 'border-success-lightest' },
]

const colorsCode = `
<template>
  <!-- Background -->
  <div class="bg-datagouv">Primary background</div>
  <div class="bg-datagouv-lightest">Light background</div>

  <!-- Text -->
  <p class="text-datagouv">Primary text</p>
  <p class="text-danger-dark">Danger text</p>

  <!-- Border -->
  <div class="border border-datagouv">Primary border</div>
</template>
`
</script>
