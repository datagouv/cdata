<template>
  <BrandedButton
    color="tertiary"
    size="2xs"
    :icon="RiFilterLine"
    keep-margins-even-without-borders
    @click="mobileFilterOpen = true"
  >
    {{ t('Filtres & tri') }}
  </BrandedButton>
</template>

<script setup lang="ts">
import { RiFilterLine } from '@remixicon/vue'
import BrandedButton from '../BrandedButton.vue'
import { useTranslation } from '../../composables/useTranslation'
import { useTabularContext } from './useTabularContext'

const { t } = useTranslation()
const { mobileFilterOpen } = useTabularContext()
</script>
