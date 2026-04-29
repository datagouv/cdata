<template>
  <div>
    <Breadcrumb>
      <BreadcrumbItem to="/design">
        {{ $t('Système de design') }}
      </BreadcrumbItem>
      <BreadcrumbItem to="/design/listbox">
        {{ $t('Listbox') }}
      </BreadcrumbItem>
    </Breadcrumb>
    <h1 class="mb-3">
      Listbox
    </h1>

    <div class="space-y-8 py-8">
      <section>
        <h2 class="!mb-3">
          Basic usage
        </h2>
        <p class="mb-4 text-gray-600">
          Simple listbox with string options.
        </p>
        <div class="w-80">
          <Listbox
            v-model="selectedCondition"
            :options="conditions"
            :display-value="(option: string | null) => option || ''"
          />
        </div>
      </section>

      <section>
        <h2 class="!mb-3">
          With object options
        </h2>
        <p class="mb-4 text-gray-600">
          Listbox with object options using custom display value.
        </p>
        <div class="w-80">
          <Listbox
            v-model="selectedFruit"
            :options="fruits"
            :display-value="(option: Fruit | null) => option?.label || ''"
          />
        </div>
      </section>

      <section>
        <h2 class="!mb-3">
          With custom option slot
        </h2>
        <p class="mb-4 text-gray-600">
          Listbox with custom option rendering using the #option slot.
        </p>
        <div class="w-80">
          <Listbox
            v-model="selectedStatus"
            :options="statuses"
            :display-value="(option: Status | null) => option?.label || ''"
          >
            <template #option="{ option, active }">
              <span
                class="size-2 rounded-full"
                :class="{
                  'bg-gray-400': option.id === 'draft',
                  'bg-yellow-400': option.id === 'review',
                  'bg-green-500': option.id === 'published',
                }"
              />
              {{ option.label }}
              <span
                v-if="active"
                class="text-xs text-gray-500"
              >(active)</span>
            </template>
          </Listbox>
        </div>
      </section>

      <section>
        <h2 class="!mb-3">
          With button and option slots
        </h2>
        <p class="mb-4 text-gray-600">
          Listbox using both #button and #option slots for full customization.
        </p>
        <div class="w-80">
          <Listbox
            v-model="selectedPriority"
            :options="priorities"
            :display-value="(option: Priority | null) => option?.label || ''"
          >
            <template #button>
              <span class="flex items-center gap-2">
                <span
                  class="size-3 rounded-full"
                  :class="{
                    'bg-red-500': selectedPriority?.id === 'high',
                    'bg-yellow-500': selectedPriority?.id === 'medium',
                    'bg-green-500': selectedPriority?.id === 'low',
                  }"
                />
                {{ selectedPriority?.label || 'Select priority' }}
              </span>
            </template>
            <template #option="{ option, active }">
              <span
                class="size-3 rounded-full"
                :class="{
                  'bg-red-500': option.id === 'high',
                  'bg-yellow-500': option.id === 'medium',
                  'bg-green-500': option.id === 'low',
                }"
              />
              {{ option.label }}
              <span
                v-if="active"
                class="ml-auto text-xs text-gray-500"
              >(active)</span>
            </template>
          </Listbox>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Listbox } from '@datagouv/components-next'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'

interface Fruit {
  id: string
  label: string
}

interface Status {
  id: string
  label: string
}

interface Priority {
  id: string
  label: string
}

const conditions = ['equal', 'greater', 'less', 'contains', 'starts_with']

const selectedCondition = ref<string | null>('equal')

const fruits: Fruit[] = [
  { id: 'apple', label: '🍎 Apple' },
  { id: 'banana', label: '🍌 Banana' },
  { id: 'orange', label: '🍊 Orange' },
  { id: 'grape', label: '🍇 Grape' },
  { id: 'strawberry', label: '🍓 Strawberry' },
]

const selectedFruit = ref<Fruit | null>(fruits[0])

const statuses: Status[] = [
  { id: 'draft', label: 'Draft' },
  { id: 'review', label: 'In Review' },
  { id: 'published', label: 'Published' },
]

const selectedStatus = ref<Status | null>(statuses[0])

const priorities: Priority[] = [
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
]

const selectedPriority = ref<Priority | null>(priorities[0])
</script>
