<template>
  <component
    :is="href ? (isDisabled ? 'span' : AppLink) : 'button'"
    v-bind="$attrs"
    class="branded-button"
    :data-size="size"
    :data-color="color"
    :data-loading="loading ? 'true' : undefined"
    :data-icon-only="isIconOnly ? 'true' : undefined"
    :data-icon-right="iconRight ? 'true' : undefined"
    :to="href && !isDisabled ? href : undefined"
    :type="href ? undefined : (type || 'button')"
    :disabled="href ? undefined : isDisabled"
    :role="href ? 'link' : undefined"
    :tabindex="href && isDisabled ? -1 : undefined"
    :aria-disabled="isDisabled ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    :aria-label="$attrs['aria-label'] || (isIconOnly ? $attrs.title : undefined)"
    :target="href && newTab ? '_blank' : undefined"
    :rel="href && newTab ? 'noopener noreferrer' : undefined"
    @click.capture="preventWhenDisabled"
  >
    <span
      v-if="icon || loading"
      class="branded-button__symbol"
    >
      <RiLoader4Line
        v-if="loading"
        class="branded-button__icon branded-button__spinner"
        aria-hidden="true"
        focusable="false"
      />
      <component
        :is="icon"
        v-else
        v-bind="iconAttrs"
        class="branded-button__icon"
        aria-hidden="true"
        focusable="false"
      />
    </span>
    <span
      v-if="hasLabel"
      class="branded-button__label"
      :class="{
        'sr-only': iconOnly,
        'branded-button__label--mobile-hidden': iconOnlyOnMobile && !!icon,
      }"
    ><slot /></span>
    <RiExternalLinkLine
      v-if="href && newTab && !isIconOnly"
      class="branded-button__icon"
      aria-hidden="true"
      focusable="false"
    />
    <span
      v-if="href && newTab"
      class="sr-only"
    > ({{ t('nouvel onglet') }})</span>
  </component>
</template>

<script setup lang="ts">
import type {
  Component,
  Slot,
  VNode,
} from 'vue'
import {
  Comment,
  computed,
  inject,
  Text,
  useSlots,
} from 'vue'
import { RiExternalLinkLine, RiLoader4Line } from '@remixicon/vue'
import type { RouteLocationRaw } from 'vue-router'
import AppLink from './AppLink.vue'
import { bannerActionTypeKey } from './BannerAction.vue'
import { useTranslation } from '../composables/useTranslation'

/**
 * Recommended colors:
 * - `primary`: the main action of a group;
 * - `secondary`: an alternative action;
 * - `tertiary`: a low-emphasis action;
 * - `danger`: a destructive action;
 * - `warning`: an admin action, for now;
 * - `white-flat`: a button on a dark or illustrated background.
 *
 * Kept for backward compatibility, not to be used in new code:
 * - `tertiary-blue`: renders like `tertiary`;
 * - `brown-illustration` and `green-illustration`: use `primary`.
 */
export type ColorType = 'primary' | 'secondary' | 'tertiary' | 'tertiary-blue' | 'warning' | 'danger' | 'brown-illustration' | 'green-illustration' | 'white-flat'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** `xl` is kept for backward compatibility, use `lg` in new code. */
  size?: '2xs' | 'xs' | 'sm' | 'lg' | 'xl'
  color?: ColorType
  disabled?: boolean
  loading?: boolean
  icon?: Component
  iconAttrs?: Record<string, string>
  href?: string | RouteLocationRaw
  newTab?: boolean
  iconOnly?: boolean
  iconOnlyOnMobile?: boolean
  iconRight?: boolean
  /**
   * @deprecated Tertiary buttons no longer have negative margins, so this prop has no effect.
   * It is kept so that existing code keeps compiling.
   */
  // eslint-disable-next-line vue/no-unused-properties -- kept for backward compatibility of the public API
  keepMarginsEvenWithoutBorders?: boolean
  type?: 'submit' | 'button'
}>(), {
  newTab: false,
  iconOnly: false,
  iconRight: false,
  keepMarginsEvenWithoutBorders: false,
})

const slots = useSlots()
const { t } = useTranslation()

const bannerActionType = inject(bannerActionTypeKey, null)

const size = computed(() => {
  if (props.size) return props.size
  if (bannerActionType) return 'xs'
  return 'sm'
})

const color = computed<ColorType>(() => {
  if (props.color) return props.color
  if (bannerActionType) {
    return {
      primary: 'secondary' as ColorType,
      warning: 'warning' as ColorType,
      danger: 'danger' as ColorType,
    }[bannerActionType]
  }
  return 'primary'
})

const isDisabled = computed(() => props.disabled || props.loading)

const hasLabel = computed(() => hasSlotContent(slots.default))

// A button without a visible label is at least square, like an icon-only button.
const isIconOnly = computed(() => props.iconOnly || !hasLabel.value)

// A disabled link is rendered as a `<span>` and a loading button is disabled,
// but listeners set by the parent must not run either.
function preventWhenDisabled(event: Event) {
  if (!isDisabled.value) return
  event.preventDefault()
  event.stopImmediatePropagation()
}

function hasSlotContent(slot: Slot | undefined, slotProps = {}): boolean {
  if (!slot) return false

  return slot(slotProps).some((vnode: VNode) => {
    if (vnode.type === Comment) return false

    if (Array.isArray(vnode.children) && !vnode.children.length) return false

    return (
      vnode.type !== Text
      || (typeof vnode.children === 'string' && vnode.children.trim() !== '')
    )
  })
}
</script>

<style>
/*
 * Unlayered and without `!important` on purpose:
 * - the `[data-size]` / `[data-color]` qualifiers outweigh the global DSFR rules on `a`, `[href]`
 *   and `button` (at most one class and one element, or two pseudo-classes and one element for
 *   `:hover` / `:active`);
 * - Tailwind runs in `important` mode, so the utility classes a parent sets on the button
 *   (margins, width, display, radius, text color…) still take precedence.
 */
.branded-button[data-size] {
  --branded-button-height: calc(var(--spacing) * 10);
  --branded-button-padding-x: calc(var(--spacing) * 4);
  --branded-button-padding-y: calc(var(--spacing) * 1.5);
  --branded-button-font-size: var(--text-sm);
  --branded-button-line-height: calc(var(--spacing) * 5);
  --branded-button-icon: calc(var(--spacing) * 4);

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: calc(var(--spacing) * 2);
  box-sizing: border-box;
  min-height: var(--branded-button-height);
  max-width: 100%;
  margin: 0;
  padding: var(--branded-button-padding-y) var(--branded-button-padding-x);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background-color: var(--color-new-primary);
  background-image: none;
  color: var(--color-white);
  font-family: var(--font-marianne);
  font-size: var(--branded-button-font-size);
  font-weight: var(--font-weight-medium);
  line-height: var(--branded-button-line-height);
  text-align: center;
  text-decoration: none;
  cursor: pointer;
}

.branded-button[data-size]::after {
  display: none;
  content: none;
}

/* Sizes */
.branded-button[data-size="xs"] {
  --branded-button-height: calc(var(--spacing) * 8);
  --branded-button-padding-x: calc(var(--spacing) * 3);
  --branded-button-padding-y: calc(var(--spacing) * 1);
}

.branded-button[data-size="2xs"] {
  --branded-button-height: calc(var(--spacing) * 7);
  --branded-button-padding-x: calc(var(--spacing) * 2);
  --branded-button-padding-y: calc(var(--spacing) * 0.5);
  --branded-button-font-size: var(--text-xs);
  --branded-button-line-height: calc(var(--spacing) * 4.5);
}

.branded-button[data-size="lg"] {
  --branded-button-height: calc(var(--spacing) * 12);
  --branded-button-font-size: var(--text-base);
  --branded-button-line-height: calc(var(--spacing) * 6);
  --branded-button-icon: calc(var(--spacing) * 5);
}

.branded-button[data-size="xl"] {
  --branded-button-height: calc(var(--spacing) * 16);
  --branded-button-font-size: var(--text-lg);
  --branded-button-line-height: calc(var(--spacing) * 6);
  --branded-button-icon: calc(var(--spacing) * 5);
}

/* Colors */
.branded-button[data-color="secondary"] {
  border-color: var(--color-new-gray-dark);
  background-color: var(--color-white);
  color: var(--color-new-gray-dark);
}

.branded-button:is([data-color="tertiary"], [data-color="tertiary-blue"]) {
  background-color: transparent;
  color: var(--color-new-primary);
}

.branded-button[data-color="warning"] {
  border-color: var(--color-new-warning);
  background-color: var(--color-white);
  color: var(--color-new-warning);
}

.branded-button[data-color="danger"] {
  border-color: var(--color-new-error);
  background-color: var(--color-white);
  color: var(--color-new-error);
}

.branded-button[data-color="white-flat"] {
  background-color: var(--color-white);
  color: var(--color-new-primary);
}

.branded-button[data-color="brown-illustration"] {
  background-color: var(--color-new-brown-illustration);
}

.branded-button[data-color="green-illustration"] {
  background-color: var(--color-new-green-illustration);
}

/* Hover and press, without moving the control */
.branded-button[data-color="primary"]:not([aria-disabled="true"]):hover {
  background-color: var(--color-new-primary-hover);
}

.branded-button:is([data-color="secondary"], [data-color="tertiary"], [data-color="tertiary-blue"], [data-color="warning"], [data-color="danger"], [data-color="white-flat"]):not([aria-disabled="true"]):hover {
  background-color: var(--color-gray-some);
}

.branded-button:is([data-color="brown-illustration"], [data-color="green-illustration"]):not([aria-disabled="true"]):hover {
  filter: brightness(0.95);
}

.branded-button[data-size]:not([aria-disabled="true"]):active {
  box-shadow: inset 0 0 0 1px currentColor;
}

.branded-button[data-size]:focus-visible {
  outline: 2px solid var(--color-new-focus);
  outline-offset: 3px;
  box-shadow: none;
}

/* Disabled and loading, shared by every color */
.branded-button[data-size][aria-disabled="true"] {
  border-color: var(--color-gray-default);
  background-color: var(--color-gray-some);
  color: var(--color-new-gray-medium-clic);
  opacity: 1;
  cursor: default;
}

.branded-button[data-size][data-loading="true"] {
  cursor: wait;
}

/* Icon-only: at least square */
.branded-button[data-size][data-icon-only="true"] {
  min-width: max(calc(var(--spacing) * 8), var(--branded-button-height));
  min-height: max(calc(var(--spacing) * 8), var(--branded-button-height));
  padding: calc(var(--spacing) * 1.5);
}

/*
 * Long labels may wrap. `break-word` rather than `anywhere`: a button squeezed by a flex or
 * table parent never gets narrower than its longest word.
 */
.branded-button__label {
  min-width: 0;
  white-space: normal;
  overflow-wrap: break-word;
}

.branded-button__symbol {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: var(--branded-button-icon);
  min-height: var(--branded-button-icon);
}

.branded-button[data-icon-right="true"] .branded-button__symbol {
  order: 1;
}

.branded-button__icon {
  flex: none;
  width: var(--branded-button-icon);
  height: var(--branded-button-icon);
}

.branded-button__spinner {
  animation: branded-button-spin 1000ms linear infinite;
}

@keyframes branded-button-spin {
  to {
    transform: rotate(360deg);
  }
}

/* Same breakpoint as Tailwind's `sm` in datagouv-components */
@media (max-width: 575.98px) {
  .branded-button[data-size]:has(.branded-button__label--mobile-hidden) {
    min-width: var(--branded-button-height);
    padding: calc(var(--spacing) * 1.5);
  }

  .branded-button__label--mobile-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }
}

/* Touch targets */
@media (pointer: coarse) {
  .branded-button[data-size] {
    min-height: max(calc(var(--spacing) * 11), var(--branded-button-height));
  }

  .branded-button[data-size]:is([data-icon-only="true"], :has(.branded-button__label--mobile-hidden)) {
    min-width: max(calc(var(--spacing) * 11), var(--branded-button-height));
  }
}

@media (prefers-reduced-motion: reduce) {
  .branded-button__spinner {
    animation: none;
  }
}
</style>
