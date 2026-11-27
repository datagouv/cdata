<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '../composables/useTranslation'
import CopyButton from './CopyButton.vue'

const props = withDefaults(defineProps<{
  code: string
  language?: string
  label?: string
  copiedLabel?: string
}>(), {
  language: 'CODE',
  label: '',
  copiedLabel: '',
})

const { t } = useTranslation()
const visibleCopyLabel = computed(() => props.label || t('Copier'))
const visibleCopiedLabel = computed(() => props.copiedLabel || t('Copié'))
</script>

<template>
  <div class="proposal-code-block">
    <div class="proposal-code-block-toolbar">
      <span class="proposal-code-block-language">{{ language }}</span>
      <CopyButton
        class="proposal-code-block-copy"
        variant="icon"
        :tooltip="false"
        :label="visibleCopyLabel"
        :copied-label="visibleCopiedLabel"
        :text="code"
      />
    </div>
    <pre
      class="proposal-code-block-pre"
      tabindex="0"
    ><code>{{ code }}</code></pre>
  </div>
</template>

<style scoped>
.proposal-code-block { width:100%; min-width:0; overflow:hidden; border:1px solid var(--color-gray-default); border-radius:2px; background:white; }
.proposal-code-block-toolbar { display:flex; align-items:center; justify-content:space-between; min-height:32px; padding-inline:10px 2px; border-bottom:1px solid var(--color-gray-default); }
.proposal-code-block-language { color:var(--color-gray-secondary); font:400 12px/18px 'Geist Mono',monospace; text-transform:uppercase; }
.proposal-code-block-pre { box-sizing:border-box; max-height:176px; margin:0; padding:10px 12px; overflow:auto; background:transparent; color:var(--color-gray-secondary); font:400 12px/20px 'Geist Mono',monospace; white-space:pre; }
.proposal-code-block-pre code { color:inherit; font:inherit; }
.proposal-code-block-pre:focus-visible { outline:2px solid var(--color-new-focus); outline-offset:-2px; }
.proposal-code-block :deep(.proposal-copy-button) { min-height:32px; padding:6px 8px; border-radius:2px; color:var(--color-gray-secondary); font:400 12px/18px Marianne,Arial,sans-serif; }
.proposal-code-block :deep(.proposal-copy-button svg) { width:16px; height:16px; }
</style>
