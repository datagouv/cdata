<template>
  <span class="proposal-technical-copy">
    <span class="proposal-technical-line">
      <AppLink
        v-if="href"
        :to="href"
        target="_blank"
        rel="noopener noreferrer"
        class="proposal-doi-link"
        :title="value"
      >
        <code><span class="proposal-middle-truncate">{{ value }}</span></code>
      </AppLink>
      <CopyButton
        v-if="href"
        :text="copyText ?? value"
        :label
        :copied-label
        variant="icon"
        size="sm"
        :tooltip="false"
      />
      <CopyButton
        v-else
        :text="copyText ?? value"
        :label
        :copied-label
        variant="inline"
      >
        <code :title="value"><span class="proposal-middle-truncate">{{ value }}</span></code>
      </CopyButton>
    </span>
  </span>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'
import AppLink from './AppLink.vue'
import CopyButton from './CopyButton.vue'

defineProps<{
  value: string
  copyText?: string
  href?: string | RouteLocationRaw | null
  label: string
  copiedLabel: string
}>()
</script>

<style scoped>
.proposal-technical-copy { min-width:0; }
.proposal-technical-line { display:flex; align-items:center; width:fit-content; max-width:100%; min-width:0; white-space:nowrap; }
.proposal-technical-line > :not(.proposal-copy) { flex:0 1 auto; min-width:0; }
.proposal-technical-line > a { display:inline-flex; align-items:center; min-width:0; max-width:100%; color:var(--color-gray-title); font:400 13px/18px 'Geist Mono',monospace; text-decoration:underline; text-decoration-thickness:1px; text-underline-offset:3px; background-image:none; white-space:nowrap; --underline-img:none; }
.proposal-technical-line > a:visited { color:var(--color-gray-title); }
.proposal-technical-line > a:hover,.proposal-technical-line > a:active { color:var(--color-new-primary); }
.proposal-technical-line > a:focus-visible { color:var(--color-new-primary); outline:2px solid var(--color-new-focus); outline-offset:2px; }
.proposal-technical-line code { display:inline-flex; flex:0 1 auto; min-width:0; max-width:100%; padding:0; border:0; border-radius:0; background:transparent; color:inherit; font:inherit; }
.proposal-middle-truncate { display:block; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.proposal-technical-line :deep(.proposal-copy) { margin-left:4px; }
.proposal-technical-line > :deep(.proposal-copy:first-child) { width:100%; margin-left:0; }
.proposal-technical-line > :deep(.proposal-copy:first-child .proposal-copy-button) { width:100%; }
@media(hover:hover) {
  .proposal-technical-copy :deep(.proposal-copy-button) { opacity:0; transition:opacity 150ms ease-in-out,background-color 150ms ease-in-out,color 150ms ease-in-out; }
  .proposal-technical-copy:hover :deep(.proposal-copy-button),.proposal-technical-copy:focus-within :deep(.proposal-copy-button),.proposal-technical-copy :deep(.proposal-copy-button[data-copied="true"]),.proposal-technical-copy :deep(.proposal-copy-button[data-inline-value="true"]) { opacity:1; }
}
@media(prefers-reduced-motion:reduce) { .proposal-technical-copy :deep(.proposal-copy-button) { transition:none; } }
</style>
