<template>
  <div>
    <div
      v-for="(icon, index) in [undefined, RiInformationLine]"
      :key="index"
    >
      <div
        v-for="size in (['xs', 'sm'] as const)"
        :key="size"
      >
        <AdminBadge
          v-for="type in (['primary', 'secondary', 'warning', 'danger', 'success', 'default', 'pink'] as const)"
          :key="type"
          class="mb-4 mr-4"
          :size
          :type
          :icon
        >
          Hello
        </AdminBadge>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RiInformationLine } from '@remixicon/vue'
import AdminBadge from '~/components/AdminBadge/AdminBadge.vue'
</script>
