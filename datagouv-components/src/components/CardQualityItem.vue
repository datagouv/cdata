<template>
  <li class="dg-quality-item">
    <p
      class="dg-status-line"
      :data-status="passed ? 'success' : 'warning'"
    >
      <component
        :is="passed ? RiCheckLine : RiAlertLine"
        data-icon-align="start"
        data-icon-size="base"
        focusable="false"
        class="dg-ds-icon"
        aria-hidden="true"
      />
      <span>{{ passed ? messagePassed : messageFailed }}</span>
    </p>
  </li>
</template>

<script setup lang="ts">
import '../../assets/cards.css'
import { RiCheckLine, RiAlertLine } from '@remixicon/vue'

defineProps<{ passed?: boolean | null, messagePassed: string, messageFailed: string }>()
</script>
