<script setup lang="ts">
import { RiCheckLine, RiFileCopyLine } from '@remixicon/vue'
import { onBeforeUnmount, ref } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  text: string
  label: string
  copiedLabel: string
  hideLabel?: boolean
  iconOnly?: boolean
  compact?: boolean
  reverse?: boolean
  showTooltip?: boolean
}>(), {
  hideLabel: false,
  iconOnly: false,
  compact: false,
  reverse: false,
  showTooltip: true,
})

const copied = ref(false)
const COPY_FEEDBACK_DURATION = 1500
let timeout: ReturnType<typeof setTimeout> | undefined

onBeforeUnmount(() => clearTimeout(timeout))

async function copy() {
  try {
    await navigator.clipboard.writeText(props.text)
    copied.value = true
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      copied.value = false
    }, COPY_FEEDBACK_DURATION)
  }
  catch {
    copied.value = false
  }
}
</script>

<template>
  <span class="proposal-copy">
    <button
      v-bind="$attrs"
      type="button"
      class="proposal-copy-button"
      :data-icon-action="compact ? false : (hideLabel || iconOnly)"
      :data-compact="compact"
      :data-boxed="hideLabel"
      :data-inline-value="Boolean($slots.default)"
      :data-reverse="reverse"
      :data-copied="copied"
      :aria-label="copied ? copiedLabel : label"
      @click="copy"
    >
      <span
        v-if="$slots.default"
        class="proposal-copy-content"
      ><slot /></span>
      <span
        class="t-icon-swap"
        :data-state="copied ? 'b' : 'a'"
        aria-hidden="true"
      >
        <RiFileCopyLine
          data-icon="a"
          data-icon-size="base"
          focusable="false"
          class="t-icon lab-ds-icon"
          aria-hidden="true"
        />
        <RiCheckLine
          data-icon="b"
          data-icon-size="base"
          focusable="false"
          class="t-icon lab-ds-icon"
          aria-hidden="true"
        />
      </span>
      <span
        class="proposal-copy-label"
        :data-floating="showTooltip && (hideLabel || iconOnly)"
        :data-tooltip="showTooltip"
      >{{ copied ? copiedLabel : label }}</span>
    </button>
    <span
      class="sr-only"
      role="status"
    >{{ copied ? copiedLabel : '' }}</span>
  </span>
</template>

<style scoped>
.proposal-copy { position:relative; display:inline-flex; vertical-align:middle; flex:none; }
.proposal-copy-button { display:inline-flex; align-items:center; justify-content:center; gap:6px; min-height:32px; margin:0; padding:6px 8px; border:1px solid transparent; border-radius:4px; color:var(--color-gray-secondary); background:transparent; font:500 14px/20px Marianne,Arial,sans-serif; cursor:pointer; text-align:left; }
.proposal-copy-button[data-boxed="true"] { border-color:var(--color-gray-default); background:white; }
.proposal-copy-button[data-reverse="true"] { flex-direction:row-reverse; }
.proposal-copy-button:not(:disabled):hover { background:var(--color-gray-some); color:var(--color-gray-title); }
.proposal-copy-button:focus-visible { outline:2px solid var(--color-new-focus); outline-offset:2px; }
.proposal-copy-button:disabled { cursor:default; opacity:.56; }
.proposal-copy-button[data-copied="true"] { color:var(--color-new-success); }
.proposal-copy-button svg { width:16px; height:16px; flex:none; }
.proposal-copy-label { visibility:hidden; }
.proposal-copy-button:hover .proposal-copy-label[data-tooltip="true"],.proposal-copy-button:focus-visible .proposal-copy-label[data-tooltip="true"],.proposal-copy-button[data-copied="true"] .proposal-copy-label[data-tooltip="true"] { visibility:visible; }
.proposal-copy-label[data-tooltip="false"] { display:none; }
.proposal-copy-label[data-floating="true"] { position:absolute; z-index:10; top:100%; right:0; width:max-content; max-width:min(22rem,calc(100vw - 2rem)); margin-top:8px; padding:12px; background:white; border:1px solid var(--color-gray-default); border-radius:4px; box-shadow:0 4px 12px rgb(0 0 0 / 12%); color:var(--color-gray-title); font:400 14px/20px Marianne,Arial,sans-serif; overflow-wrap:anywhere; }
.proposal-copy:has(.proposal-copy-button[data-inline-value="true"]) { max-width:100%; min-width:0; }
.proposal-copy-button[data-inline-value="true"] { max-width:100%; min-width:0; min-height:18px; padding:0; border:0; color:var(--color-gray-title); font:400 13px/18px 'Geist Mono',monospace; text-align:left; }
.proposal-copy-button[data-inline-value="true"]:hover,.proposal-copy-button[data-inline-value="true"]:active { color:var(--color-new-primary); background:transparent; }
.proposal-copy-content { display:block; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.t-icon-swap { position:relative; display:inline-grid; }
.t-icon-swap .t-icon { grid-area:1 / 1; transition:opacity 150ms ease-in-out,filter 150ms ease-in-out,transform 150ms ease-in-out; will-change:opacity,filter,transform; }
.t-icon-swap[data-state="a"] .t-icon[data-icon="a"],.t-icon-swap[data-state="b"] .t-icon[data-icon="b"] { opacity:1; filter:blur(0); transform:scale(1); }
.t-icon-swap[data-state="a"] .t-icon[data-icon="b"],.t-icon-swap[data-state="b"] .t-icon[data-icon="a"] { opacity:0; filter:blur(2px); transform:scale(.25); }
.proposal-copy-button[data-inline-value="true"] .t-icon-swap { flex:none; width:16px; height:16px; line-height:0; opacity:0; transform:translateY(-1px); transition:opacity 150ms ease-in-out; }
.proposal-copy-button[data-inline-value="true"]:hover .t-icon-swap,.proposal-copy-button[data-inline-value="true"]:focus-visible .t-icon-swap,.proposal-copy-button[data-inline-value="true"][data-copied="true"] .t-icon-swap { opacity:1; }
.proposal-copy-button[data-compact="true"] { min-width:16px; min-height:18px; padding:0; }
@media(prefers-reduced-motion:reduce) { .t-icon-swap .t-icon { transition:none; } }
</style>
