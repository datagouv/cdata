<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200 text-sm">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-3 text-left font-medium text-gray-900">
            Prop
          </th>
          <th class="px-4 py-3 text-left font-medium text-gray-900">
            Type
          </th>
          <th class="px-4 py-3 text-left font-medium text-gray-900">
            Défaut
          </th>
          <th class="px-4 py-3 text-left font-medium text-gray-900">
            Description
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 bg-white">
        <tr
          v-for="prop in props.props"
          :key="prop.name"
        >
          <td class="whitespace-nowrap px-4 py-3">
            <code class="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-datagouv">{{ prop.name }}</code>
            <span
              v-if="prop.required"
              class="ml-1 text-red-500"
            >*</span>
          </td>
          <td class="whitespace-nowrap px-4 py-3">
            <code class="text-xs font-mono text-gray-600">{{ prop.type }}</code>
          </td>
          <td class="whitespace-nowrap px-4 py-3">
            <code
              v-if="prop.default !== undefined"
              class="text-xs font-mono text-gray-600"
            >{{ prop.default }}</code>
            <span
              v-else
              class="text-gray-400"
            >—</span>
          </td>
          <td class="px-4 py-3 text-gray-600">
            {{ prop.description }}
            <div
              v-if="prop.options && prop.options.length"
              class="mt-1 flex flex-wrap gap-1"
            >
              <code
                v-for="option in prop.options"
                :key="option"
                class="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-600"
              >{{ option }}</code>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
export interface PropDefinition {
  name: string
  type: string
  default?: string
  required?: boolean
  description: string
  options?: string[]
}

const props = defineProps<{
  props: PropDefinition[]
}>()
</script>
