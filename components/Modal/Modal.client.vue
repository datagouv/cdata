<template>
  <Dialog
    :id="modalId"
    :aria-labelledby="showTitle ? modalTitleId : null"
    :aria-label="!showTitle ? title : null"
    class="border-none text-inherit z-[1750] p-0 m-0 flex flex-col items-stretch fixed top-0 right-0 bottom-0 left-0 w-full h-full motion-reduce:transition-none outline-none"
    :class="{
      'visible opacity-100 w-full h-full transition-[opacity,visibility] duration-300 motion-reduce:transition-none': opened,
      'bg-white': isFullscreen,
      'bg-black/[0.6] justify-center': !isFullscreen,
      'opacity-0 invisible': !opened,
    }"
    :open="opened"
    as="dialog"
    @close="emit('close')"
  >
    <DialogPanel
      :as="form ? 'form': 'div'"
      class="w-full h-full"
      @submit="$emit('submit', $event)"
    >
      <div
        class="h-full md:container md:mx-auto fr-container--fluid grid grid-cols-12 p-0 m-0 justify-center"
      >
        <div
          class="col-span-12 overflow-y-auto grid grid-cols-1 items-center"
          :class="contentSize"
        >
          <div
            class="pointer-events-auto z-[2000] bg-white"
            :class="{ 'overflow-y-visible h-full': isFullscreen, 'drop-shadow overflow-y-auto max-h-[calc(100%-2rem)]': !isFullscreen }"
          >
            <div
              class="flex items-center justify-end pt-4 px-4 sm:px-8 pb-2"
              :class="{ 'pl-0 pr-0': isFullscreen }"
            >
              <BrandedButton
                :title="$t('Fermer la fenêtre modale')"
                color="tertiary"
                :aria-controls="modalId"
                :icon="RiCloseLine"
                icon-right
                :keep-margins-even-without-borders="isFullscreen"
                @click="emit('close')"
              >
                {{ $t('Fermer') }}
              </BrandedButton>
            </div>
            <div
              class="px-4 sm:px-8 pb-[3.5rem] sm:pb-[4rem] contrast-more:border-solid contrast-more:border-1"
              :class="{ 'pl-0 pr-0': isFullscreen }"
            >
              <DialogTitle
                v-if="showTitle"
                :id="modalTitleId"
                class="mb-4 font-bold text-gray-950 text-xl md:text-2xl flex items-center space-x-2"
              >
                <slot name="iconTitle" />
                <span>{{ title }}</span>
              </DialogTitle>
              <slot />
            </div>
            <div
              v-if="$slots.footer"
              class="flex p-4 sm:px-8 -mt-10 sticky bottom-0 bg-white contrast-more:border-solid contrast-more:border-t-1 motion-reduce:transition-none"
            >
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </DialogPanel>
  </Dialog>
</template>

<script setup lang="ts">
import { BrandedButton } from '@datagouv/components-next'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { RiCloseLine } from '@remixicon/vue'

const props = withDefaults(defineProps<{
  /** Modal id to set for an external button `arial-controls` */
  id?: string
  opened?: boolean
  /** Modale title, required for accessibility purpose */
  title: string
  /** Removes modal title and adds it as aria-label */
  showTitle?: boolean

  /** The modal size, can be fullscreen for special ones  */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen'

  form?: boolean
}>(), {
  opened: false,
  showTitle: true,
  size: 'md',
  form: false,
})

const emit = defineEmits<{
  close: []
  submit: [e: SubmitEvent]
}>()

const randomId = useId()
const modalId = props.id ? props.id : `modal-${randomId}`
const modalTitleId = `modal-title-${randomId}`
const contentSize = getSize()
const isFullscreen = props.size === 'fullscreen'

function getSize() {
  switch (props.size) {
    case 'sm':
      return 'md:col-start-5 md:col-span-4'
    case 'md':
      return 'md:col-start-4 md:col-span-6 lg:col-start-5 lg:col-span-4'
    case 'lg':
      return 'md:col-start-3 md:col-span-8'
    case 'xl':
      return 'md:col-start-2 md:col-span-10'
    case 'fullscreen':
      return ''
  }
}
</script>
