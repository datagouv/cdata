<template>
  <div
    class="fr-input-group"
    :class="inputGroupClass"
    @focusin="$emit('focusin')"
    @focusout="$emit('blur')"
  >
    <label
      v-if="!hideLabel"
      :class="showLabelInside ? 'absolute uppercase font-bold text-xs text-gray-medium py-3 pl-3' : 'fr-label'"
      :for="id"
    >
      {{ label }}
      <Required :required="required" />
      <span
        v-if="hintText"
        class="fr-hint-text"
      >{{ hintText }}</span>
    </label>
    <textarea
      v-if="type === 'textarea'"
      :id="id"
      class="fr-input"
      :class="{ 'fr-input--error': hasError, 'fr-input--warning': !hasError && hasWarning, 'fr-input--valid': isValid }"
      :aria-describedby="ariaDescribedBy"
      :aria-label="hideLabel ? label : undefined"
      :autocomplete
      :disabled
      :type
      :value="(modelValue as string | undefined)"
      :placeholder
      :required
      :spellcheck
      :rows="rows"
      @change="change"
    />
    <MarkdownEditor
      v-else-if="type === 'markdown'"
      :id="id"
      class="fr-mt-1w"
      :class="{ 'fr-input--error': hasError, 'fr-input--warning': !hasError && hasWarning, 'fr-input--valid': isValid }"
      :aria-describedby="ariaDescribedBy"
      :disabled="disabled"
      :value="(modelValue as string | undefined)"
      :placeholder="placeholder"
      :required="required"
      @change="change"
    />
    <input
      v-else
      :id="id"
      class="fr-input"
      :class="{ 'fr-input--error': hasError, 'fr-input--valid': isValid, '!pl-14': showLabelInside }"
      :aria-describedby="ariaDescribedBy"
      :autocomplete
      :disabled
      :type
      :placeholder
      :value="modelValue"
      :required
      :spellcheck
      @change="change"
    >
    <p
      v-if="isValid"
      :id="validTextId"
      class="fr-valid-text"
    >
      {{ validText }}
    </p>
    <p
      v-else-if="props.hasError"
      :id="errorTextId"
      class="fr-error-text"
    >
      {{ errorText }}
    </p>
    <p
      v-else-if="props.hasWarning && warningText"
      :id="warningTextId"
      class="text-default-warning text-sm mt-2"
    >
      <RiErrorWarningLine class="inline size-4 -translate-y-0.5 mr-1" />
      <span>{{ warningText }}</span>
    </p>
  </div>
</template>

<script setup lang="ts" generic="T">
import { RiErrorWarningLine } from '@remixicon/vue'
import { computed, type InputTypeHTMLAttribute } from 'vue'
import MarkdownEditor from '~/components/MarkdownEditor/MarkdownEditor.vue'
import Required from '~/components/Required/Required.vue'

export type InputValue = string | undefined | null

export type AllowedInputType = 'markdown' | 'textarea' | InputTypeHTMLAttribute

const emit = defineEmits<{
  'focusin': []
  'blur': []
  'change': [value: InputValue]
  'update:modelValue': [value: InputValue]
}>()

const props = withDefaults(defineProps<{
  ariaDescribedby?: string
  autocomplete?: string
  disabled?: boolean
  errorText?: string | null
  warningText?: string | null
  hasError?: boolean
  hasWarning?: boolean
  hintText?: string
  isValid?: boolean
  label: string
  hideLabel?: boolean
  showLabelInside?: boolean
  modelValue?: string | Date | null
  placeholder?: string
  required?: boolean
  spellcheck?: boolean
  type?: AllowedInputType
  validText?: string
  rows?: number
}>(), {
  ariaDescribedby: '',
  autocomplete: undefined,
  disabled: false,
  errorText: '',
  hasError: false,
  hasWarning: false,
  hintText: '',
  isValid: false,
  modelValue: undefined,
  placeholder: '',
  required: false,
  spellcheck: undefined,
  type: 'text',
  validText: '',
  hideLabel: false,
})

const id = useId()

const formInfo = inject<FormInfo<T> | null>('formInfo', null)
const formKey = inject<KeysOfUnion<T> | null>('formKey', null)

const hasError = computed(() => (formKey && formInfo) ? formInfo.getFirstError(formKey) : props.hasError)
const hasWarning = computed(() => (formKey && formInfo) ? formInfo.getFirstWarning(formKey) : props.hasWarning)

const errorText = computed(() => (formKey && formInfo) ? formInfo.getFirstError(formKey) : props.errorText)

const errorTextId = useId()
const warningTextId = useId()
const validTextId = useId()
const ariaDescribedBy = computed(() => {
  let describedBy = props.ariaDescribedby ? props.ariaDescribedby + ' ' : ''
  if (props.isValid) {
    describedBy += validTextId
  }
  else if (hasError.value) {
    describedBy += errorTextId
  }
  return describedBy
})

const inputGroupClass = computed(() => {
  return {
    'relative': props.showLabelInside,
    'fr-input-group--disabled': props.disabled,
    'fr-input-group--error': hasError.value,
    'fr-input-group--warning': !hasError.value && hasWarning.value,
    'fr-input-group--valid': props.isValid,
  }
})

function change(event: Event | string | null) {
  let value: InputValue
  if (event instanceof Event) {
    const target = event.target as HTMLSelectElement | HTMLInputElement | null
    value = target?.value
  }
  else {
    value = event
  }

  emit('update:modelValue', value)
  emit('change', value)
}
</script>
