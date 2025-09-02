<template>
  <form
    :id="formId"
    class="flex"
  >
    <Sidemenu
      class="w-5/12 hidden lg:block"
      :button-text="$t('Aide')"
      :on-right="true"
      :fixed="true"
    >
      <template #title>
        <span
          class="fr-icon--sm fr-icon-question-line"
          aria-hidden="true"
        />
        {{ $t('Aide') }}
      </template>

      <div
        :id="accordionsId"
        class="flex flex-col"
      />
    </Sidemenu>
    <div class="w-full lg:w-7/12">
      <div
        class="bg-white"
        :class="{ 'fr-p-3w': !noMargin }"
      >
        <slot />
      </div>
    </div>
  </form>
</template>

<script setup lang="ts" generic="T">
import type { FormInfo } from '~/composables/useForm'

import { key } from '~/components/Accordion/injectionKey'

const props = withDefaults(defineProps<{
  formInfo: FormInfo<T>
  formId?: string
  noMargin?: boolean
}>(), {
  noMargin: false,
})
const accordionsId = useId()

provide('accordionsId', accordionsId)
provide('formInfo', props.formInfo)

const opened = ref<string | null>(null)

provide(key, {
  isOpen(id: string) {
    return opened.value === id
  },

  open(id: string) {
    opened.value = id
  },

  toggle(id: string) {
    if (opened.value === id) {
      opened.value = null
    }
    else {
      opened.value = id
    }
  },

  unregister(id: string) {
    if (opened.value === id) {
      opened.value = null
    }
  },
})
</script>
