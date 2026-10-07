<template>
  <!-- Must be rendered inside a `relative group` container (the parent banner
       wrapper provides the positioning context and the group-hover reveal), and
       only rendered by the parent for users with `organization.permissions.edit`. -->
  <div v-if="organization">
    <template v-if="repositioning">
      <div class="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
        <span class="bg-black/60 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2">
          <RiArrowUpDownLine class="size-4" />
          {{ $t('Glisser pour repositionner') }}<template v-if="position != null"> · {{ position }}%</template>
        </span>
      </div>
      <div class="absolute bottom-3 right-3 z-10 flex gap-2">
        <BrandedButton
          size="sm"
          color="primary"
          :loading="saving"
          @click="$emit('save-reposition')"
        >
          {{ $t('Enregistrer') }}
        </BrandedButton>
        <BrandedButton
          size="sm"
          @click="$emit('cancel-reposition')"
        >
          {{ $t('Annuler') }}
        </BrandedButton>
      </div>
    </template>
    <template v-else>
      <!-- Desktop: hover / focus-within overlay -->
      <div class="hidden sm:block absolute inset-0 z-10 pointer-events-none opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <div class="absolute inset-0 bg-black/20 pointer-events-none" />
        <div
          v-if="hasCustomBanner"
          class="absolute top-3 right-3 flex gap-2 pointer-events-auto"
        >
          <BrandedButton
            color="secondary"
            size="sm"
            @click="$emit('open-flyout')"
          >
            {{ $t('Modifier') }}
          </BrandedButton>
          <BrandedButton
            v-if="organization.banner_image"
            color="secondary"
            size="sm"
            @click="$emit('start-reposition')"
          >
            {{ $t('Repositionner') }}
          </BrandedButton>
          <BrandedButton
            color="secondary"
            size="sm"
            icon-only
            :icon="RiDeleteBinLine"
            :title="$t('Supprimer la bannière')"
            :aria-label="$t('Supprimer la bannière')"
            @click="$emit('delete-banner')"
          />
        </div>
        <div
          v-else
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
        >
          <BrandedButton
            color="secondary"
            size="sm"
            :icon="RiAddLine"
            @click="$emit('open-flyout')"
          >
            {{ $t('Ajouter une bannière') }}
          </BrandedButton>
        </div>
      </div>
      <!-- Mobile: persistent edit button -->
      <BrandedButton
        class="sm:hidden absolute bottom-3 right-3"
        color="secondary"
        size="sm"
        icon-only
        :icon="RiEditLine"
        :title="$t('Modifier la bannière')"
        :aria-label="$t('Modifier la bannière')"
        @click="$emit('open-flyout')"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { RiAddLine, RiArrowUpDownLine, RiDeleteBinLine, RiEditLine } from '@remixicon/vue'
import { BrandedButton, type Organization } from '@datagouv/components-next'

const props = defineProps<{
  organization: Organization
  repositioning: boolean
  saving?: boolean
  position?: number
}>()

defineEmits<{
  'open-flyout': []
  'start-reposition': []
  'save-reposition': []
  'cancel-reposition': []
  'delete-banner': []
}>()

const hasCustomBanner = computed(() => !!(props.organization.banner_image || props.organization.banner_color))
</script>
