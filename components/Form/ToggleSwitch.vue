<template>
  <div class="space-y-1">
    <div class="flex items-center space-x-6">
      <Switch
        v-model="enabled"
        :class="[enabled ? 'bg-datagouv-defaultLight hover:!bg-datagouv-defaultLight' : 'bg-gray-200 hover:!bg-gray-200', 'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full !border-2 !border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-datagouv-defaultbg-datagouv-defaultLight focus:ring-offset-2']"
        style="border: inherit /** cancel DSFR default border: none **/"
      >
        <span class="sr-only">{{ label }}</span>
        <span :class="[enabled ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none relative inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']">
          <span
            :class="[enabled ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in', 'absolute inset-0 flex size-full items-center justify-center transition-opacity']"
            aria-hidden="true"
          >
            <RiCloseLine class="size-3 text-gray-400" />
          </span>
          <span
            :class="[enabled ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out', 'absolute inset-0 flex size-full items-center justify-center transition-opacity']"
            aria-hidden="true"
          >
            <RiCheckLine class="size-3 text-datagouv-defaultLight" />
          </span>
        </span>
      </Switch>
      <div>{{ label }}</div>
    </div>
    <div class="text-xs/5">
      <div
        v-if="enabled"
        class="text-datagouv"
      >
        {{ labelTrue }}
      </div>
      <div v-else>
        {{ labelFalse }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Switch } from '@headlessui/vue'
import { RiCheckLine, RiCloseLine } from '@remixicon/vue'

const props = defineProps<{
  label: string
  labelTrue?: string
  labelFalse?: string
}>()

const { t } = await useTranslation()

const labelTrue = computed(() => props.labelTrue || t('Activé'))
const labelFalse = computed(() => props.labelFalse || t('Désactivé'))

const enabled = defineModel<boolean>({ required: true })
</script>
