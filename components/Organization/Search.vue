<template>
  <Combobox
    v-slot="{ activeOption }"
    as="div"
    class="flex-1 relative"
  >
    <div class="fr-search-bar flex-wrap">
      <ComboboxLabel
        class="fr-label"
      >
        {{ t('Rechercher des données') }}
      </ComboboxLabel>
      <RiSearch2Line
        class="absolute text-base top-3 left-2"
        size="16"
        aria-hidden="true"
      />
      <ComboboxInput
        class="fr-input fr-col-12 !pl-8"
        :placeholder="t('Rechercher une organisation sur {platform}', { platform: config.public.title })"
        autocomplete="off"
        data-cy="search-input"
        name="q"
        @keydown.enter="moveToOrganization(activeOption.page)"
        @change="q = $event.target.value"
      />
    </div>
    <ComboboxOptions
      class="absolute w-full mt-2 max-h-60 overflow-auto bg-white py-1 drop-shadow rounded-b p-0"
    >
      <ComboboxOption
        v-for="option in options"
        :key="option.id"
        v-slot="{ active }"
        class="marker:hidden p-0"
        :value="option"
      >
        <div
          class="relative flex items-center py-2 fr-enlarge-link border-neutral-200 border-bottom"
          :class="{ 'bg-indigo-100 outline outline-1 outline-primary outline-offset-[-2px]': active }"
          @mousedown.left="moveToOrganization(option.page)"
        >
          <OrganizationLogo
            :organization="option"
            class="flex-none mx-2"
            size-class="size-8"
          />
          <CdataLink
            class="flex-1"
            :to="option.page"
            :external="true"
          >
            <span class="font-bold">{{ option.name }}</span>
          </CdataLink>
        </div>
      </ComboboxOption>
    </ComboboxOptions>
  </Combobox>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { OrganizationLogo, type Organization } from '@datagouv/components-next'
import { watchDebounced } from '@vueuse/core'
import { RiSearch2Line } from '@remixicon/vue'
import { Combobox, ComboboxInput, ComboboxLabel, ComboboxOption, ComboboxOptions } from '@headlessui/vue'

const { t } = useTranslation()
const { toast } = useToast()
const config = useRuntimeConfig()
const q = ref('')
const { $api } = useNuxtApp()

const options = ref<Array<Organization>>([])

async function fetchOptions() {
  try {
    const data = await $api<Array<Organization>>('/api/1/organizations/suggest/', { params: { q: q.value, size: 50 } })
    options.value = data.map((option: Organization) => ({
      ...option,
      id: option.id,
      page: `${option.page}#/information/membres`,
      link: option.page,
    }))
  }
  catch {
    toast.error(t(`Une erreur s'est produite lors de la mise à jour des options.`))
  }
}

async function moveToOrganization(page: string) {
  await navigateTo(page)
}

watchDebounced(q, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    await fetchOptions()
  }
}, { debounce: 300 })
</script>

<style scoped>
  .fr-icon-search-line::before {
    height: 1.25rem;
  }
</style>
