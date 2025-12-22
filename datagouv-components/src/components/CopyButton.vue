<template>
  <button
    type="button"
    class="text-sm mb-0 md:whitespace-nowrap relative p-1 text-gray-medium leading-none text-left"
    :class="{ 'border bg-white rounded-sm text-gray-title': hideLabel }"
    @click="copy"
  >
    <span
      v-if="copied"
      class="flex items-center gap-1"
      :class="{ 'flex-row-reverse': reverse }"
      style="color: #3558a2;"
    >
      <RiCheckLine class="flex-none size-4 inline" />
      <span
        class="copy-label"
        :class="{ 'fr-sr-only': hideLabel }"
      >{{ copiedLabel }}</span>
    </span>
    <span
      v-if="!copied"
      class="flex items-center gap-1"
      :class="{ 'flex-row-reverse': reverse }"
    >
      <component
        :is="hideLabel ? RiClipboardLine : RiFileCopyLine"
        class="size-4 flex-none inline"
      />
      <span
        class="copy-link copy-label"
        :class="{ 'fr-sr-only': hideLabel }"
      >{{ label }}</span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { RiCheckLine, RiClipboardLine, RiFileCopyLine } from '@remixicon/vue'
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { useTranslation } from '../composables/useTranslation'

const props = withDefaults(defineProps<{
  text: string
  label: string
  copiedLabel: string
  hideLabel?: boolean
  reverse?: boolean
}>(), {
  hideLabel: false,
  reverse: false,
})

const { t } = useTranslation()
const copied = ref(false)

const copy = async () => {
  try {
    await navigator.clipboard.writeText(props.text)
    copied.value = true
    setTimeout(() => copied.value = false, 2000)
  }
  catch {
    toast.error(t('Impossible de copier dans le presse-papier'))
  }
}
</script>

  <style scoped>
  button:hover .copy-icon {
    color: #3558a2;
  }

  .copy-link {
    /* Using opacity here to prevent moving object with display:none (for example when clamping a text before the button) */
    opacity: 0%;
  }
  button:hover .copy-link {
    opacity: 100%;
  }

  /*
  We may want to enable this to leave more space for title in small screens… But it also affects
  buttons in the body of the resources panels and we don't want it…
  @container (max-width: 600px) {
    .copy-label {
      position: absolute;
      bottom: -1rem;
      left: 0;
    }
  } */
  </style>
