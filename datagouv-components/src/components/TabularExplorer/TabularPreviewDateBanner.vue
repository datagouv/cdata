<template>
  <div
    v-if="parsingFinishedAt"
    class="flex items-start gap-2 border-b px-3 py-2.5"
    :class="isStale ? 'border-new-warning-light-hover bg-new-warning-light' : 'border-new-info-light-hover bg-new-info-light'"
  >
    <span
      class="flex size-5 shrink-0 items-center justify-center"
      aria-hidden="true"
    >
      <RiErrorWarningLine
        v-if="isStale"
        class="size-4 text-new-warning"
      />
      <RiInformationLine
        v-else
        class="size-4 text-new-info"
      />
    </span>
    <div class="min-w-0 flex-1">
      <template v-if="isStale">
        <p class="m-0 text-xs/5 font-bold">
          {{ t('Prévisualisation non actualisée') }}
        </p>
        <p class="m-0 text-xs/5">
          <TranslationT keypath="Le fichier source a été mis à jour le {date}. Les données affichées ici peuvent différer de la dernière version.">
            <template #date>
              <FormattedDate :date="resource.last_modified" />
            </template>
          </TranslationT>
        </p>
      </template>
      <template v-else>
        <p class="m-0 text-xs/5 font-bold">
          {{ t('Prévisualisation') }}
        </p>
        <p class="m-0 text-xs/5">
          <TranslationT keypath="Dernière mise à jour le {date}.">
            <template #date>
              <FormattedDate :date="parsingFinishedAt" />
            </template>
          </TranslationT>
        </p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RiErrorWarningLine, RiInformationLine } from '@remixicon/vue'
import FormattedDate from '../FormattedDate.vue'
import TranslationT from '../TranslationT.vue'
import { useTranslation } from '../../composables/useTranslation'
import { getTabularPreviewDate, isTabularPreviewStale } from '../../functions/tabularPreview'
import type { Resource } from '../../types/resources'

const props = defineProps<{ resource: Resource }>()

const { t } = useTranslation()

const parsingFinishedAt = computed(() => getTabularPreviewDate(props.resource))
const isStale = computed(() => isTabularPreviewStale(props.resource))
</script>
