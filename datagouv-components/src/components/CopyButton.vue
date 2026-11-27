<script setup lang="ts">
import { RiCheckLine, RiFileCopyLine } from '@remixicon/vue'
import { computed, onBeforeUnmount, ref, useSlots } from 'vue'
import { toast } from 'vue-sonner'
import { useTranslation } from '../composables/useTranslation'

defineOptions({ inheritAttrs: false })

/**
 * - `reveal` : icon whose label appears on hover and focus, its space kept (default, as on main).
 * - `label` : icon followed by its label, always visible.
 * - `icon` : icon alone, its label shown in a tooltip on hover and focus.
 * - `inline` : the value itself (default slot) is the button, the icon appears on hover and focus.
 */
export type CopyButtonVariant = 'reveal' | 'label' | 'icon' | 'inline'

const props = withDefaults(defineProps<{
  text: string
  label: string
  copiedLabel: string
  variant?: CopyButtonVariant
  // `sm`: no padding, for an icon placed inside a line of text.
  size?: 'md' | 'sm'
  // Only for the `icon` variant: set to false when the label is already visible nearby.
  tooltip?: boolean
  /** @deprecated use `variant="icon"`: icon in a bordered box. */
  hideLabel?: boolean
  /** @deprecated use `variant="icon"`. */
  iconOnly?: boolean
  // Label before the icon, for the `label` variant.
  reverse?: boolean
}>(), {
  variant: undefined,
  size: 'md',
  tooltip: true,
  hideLabel: false,
  iconOnly: false,
  reverse: false,
})

const slots = useSlots()
const { t } = useTranslation()

const resolvedVariant = computed<CopyButtonVariant>(() => {
  if (props.variant) return props.variant
  if (props.hideLabel || props.iconOnly) return 'icon'
  return slots.default ? 'inline' : 'reveal'
})

// `reveal` and `label` keep their label in the button text (hidden visually for `reveal`).
const hasTextLabel = computed(() => resolvedVariant.value === 'reveal' || resolvedVariant.value === 'label')

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
    toast.error(t('Impossible de copier dans le presse-papier'))
  }
}
</script>

<template>
  <span
    class="copy-button"
    :data-variant="resolvedVariant"
  >
    <button
      v-bind="$attrs"
      type="button"
      class="copy-button__action"
      :data-size="size"
      :data-bordered="hideLabel"
      :data-reverse="reverse"
      :data-copied="copied"
      :aria-label="hasTextLabel ? undefined : (copied ? copiedLabel : label)"
      @click="copy"
    >
      <span
        v-if="resolvedVariant === 'inline'"
        class="copy-button__value"
      ><slot /></span>
      <span
        class="copy-button__icons"
        :data-state="copied ? 'copied' : 'idle'"
        aria-hidden="true"
      >
        <RiFileCopyLine
          data-icon="idle"
          focusable="false"
        />
        <RiCheckLine
          data-icon="copied"
          focusable="false"
        />
      </span>
      <span
        v-if="hasTextLabel"
        class="copy-button__label"
      >{{ copied ? copiedLabel : label }}</span>
      <span
        v-else-if="resolvedVariant === 'icon' && tooltip"
        class="copy-button__tooltip"
        aria-hidden="true"
      >{{ copied ? copiedLabel : label }}</span>
    </button>
    <span
      class="sr-only"
      role="status"
    >{{ copied ? copiedLabel : '' }}</span>
  </span>
</template>

<style scoped>
.copy-button {
  position: relative;
  display: inline-flex;
  flex: none;
  vertical-align: middle;
}

.copy-button__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: calc(var(--spacing) * 1.5);
  min-height: calc(var(--spacing) * 8);
  margin: 0;
  padding: calc(var(--spacing) * 1.5) calc(var(--spacing) * 2);
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--color-gray-secondary);
  background: transparent;
  font-family: var(--font-marianne);
  font-size: var(--text-sm);
  line-height: var(--text-sm--line-height);
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}
.copy-button__action:not(:disabled):hover {
  background: var(--color-gray-some);
  color: var(--color-gray-title);
}
.copy-button__action:focus-visible {
  outline: 2px solid var(--color-new-focus);
  outline-offset: 2px;
}
.copy-button__action:disabled {
  cursor: default;
  opacity: .56;
}
.copy-button__action[data-copied="true"] {
  color: var(--color-new-success);
}
.copy-button__action[data-reverse="true"] {
  flex-direction: row-reverse;
}
.copy-button__action[data-size="sm"] {
  min-width: 16px;
  min-height: 18px;
  padding: 0;
}
.copy-button__action[data-bordered="true"] {
  border-color: var(--color-gray-default);
  background: white;
}
.copy-button__action svg {
  width: 16px;
  height: 16px;
  flex: none;
}

/* Icon swap between "copy" and "copied". */
.copy-button__icons {
  position: relative;
  display: inline-grid;
  line-height: 0;
}
.copy-button__icons svg {
  grid-area: 1 / 1;
  transition: opacity 150ms ease-in-out, filter 150ms ease-in-out, transform 150ms ease-in-out;
}
.copy-button__icons[data-state="idle"] [data-icon="copied"],
.copy-button__icons[data-state="copied"] [data-icon="idle"] {
  opacity: 0;
  filter: blur(2px);
  transform: scale(.25);
}

/* `reveal`: label shown on hover, focus and after copying; its space is kept so nothing moves. */
.copy-button[data-variant="reveal"] .copy-button__label {
  opacity: 0;
  transition: opacity 150ms ease-in-out;
}
.copy-button[data-variant="reveal"] .copy-button__action:hover .copy-button__label,
.copy-button[data-variant="reveal"] .copy-button__action:focus-visible .copy-button__label,
.copy-button[data-variant="reveal"] .copy-button__action[data-copied="true"] .copy-button__label {
  opacity: 1;
}

/* `icon`: tooltip under the button on hover, focus and after copying. */
.copy-button__tooltip {
  position: absolute;
  z-index: 10;
  top: 100%;
  right: 0;
  display: none;
  width: max-content;
  max-width: min(22rem, calc(100vw - 2rem));
  margin-top: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 3);
  border: 1px solid var(--color-gray-default);
  border-radius: 4px;
  background: white;
  box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
  color: var(--color-gray-title);
  font-weight: 400;
  overflow-wrap: anywhere;
}
.copy-button__action:hover .copy-button__tooltip,
.copy-button__action:focus-visible .copy-button__tooltip,
.copy-button__action[data-copied="true"] .copy-button__tooltip {
  display: block;
}

/* `inline`: the value is the button, the icon appears on hover and focus. */
.copy-button[data-variant="inline"] {
  max-width: 100%;
  min-width: 0;
}
.copy-button[data-variant="inline"] .copy-button__action {
  max-width: 100%;
  min-width: 0;
  min-height: 18px;
  padding: 0;
  border: 0;
  color: var(--color-gray-title);
  font-family: var(--font-mono);
  /* No token for the 13 px / 18 px size of technical values yet (see /design/metadata). */
  font-size: 13px;
  line-height: 18px;
  font-weight: 400;
}
.copy-button[data-variant="inline"] .copy-button__action:hover {
  color: var(--color-new-primary);
  background: transparent;
}
.copy-button__value {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.copy-button[data-variant="inline"] .copy-button__icons {
  opacity: 0;
  transition: opacity 150ms ease-in-out;
}
.copy-button[data-variant="inline"] .copy-button__action:hover .copy-button__icons,
.copy-button[data-variant="inline"] .copy-button__action:focus-visible .copy-button__icons,
.copy-button[data-variant="inline"] .copy-button__action[data-copied="true"] .copy-button__icons {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .copy-button__icons svg,
  .copy-button[data-variant="reveal"] .copy-button__label,
  .copy-button[data-variant="inline"] .copy-button__icons {
    transition: none;
  }
}
</style>
