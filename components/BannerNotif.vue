<template>
  <div class="relative bg-white shadow rounded-sm p-5 mt-3">
    <AdminBadge
      class="absolute top-0 left-2.5 -translate-y-1/2"
      size="sm"
      :type
      :icon
    >
      {{ badge }}
    </AdminBadge>

    <div class="flex flex-wrap justify-between space-x-5">
      <div class="space-y-1">
        <div class="flex flex-wrap items-start space-x-1">
          <slot name="avatar" />
          <div>
            <div class="text-gray-title text-sm/6">
              <slot name="title" />
            </div>
            <div class="!text-sm/6">
              <slot name="subtitle" />
            </div>
          </div>
        </div>
        <div class="flex items-stretch space-x-1">
          <div class="w-6 flex items-center justify-center">
            <div class="h-full w-1 bg-gray-default" />
          </div>
          <div class="text-xs/5">
            <slot name="body" />
          </div>
        </div>
        <div class="text-sm/6 text-gray-medium">
          <FormattedDate
            :date
            :options="{ dateStyle: 'long', timeStyle: 'short' }"
          />
        </div>
      </div>
      <div class="flex flex-col space-y-2.5 items-end">
        <slot name="buttons" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FormattedDate } from '@datagouv/components-next'
import type { Component } from 'vue'
import AdminBadge from './AdminBadge/AdminBadge.vue'

defineProps<{
  type: 'warning' | 'primary'
  icon: Component
  badge: string
  date: Date
}>()
</script>
