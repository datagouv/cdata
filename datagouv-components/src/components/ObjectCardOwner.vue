<template>
  <div
    v-if="organization"
    class="flex items-center gap-2 min-w-0 max-w-full text-sm/6 text-gray-title [overflow-wrap:anywhere]"
  >
    <OrganizationLogo
      v-if="showLogo"
      :organization="organization"
      size-class="size-8 p-1 flex-none"
    />
    <Toggletip
      v-if="showDetails && organizationUrl !== null"
      :styled-button="false"
      button-class="relative z-2 flex items-center max-w-full min-h-6 p-0 rounded border-0 bg-transparent text-left text-gray-title cursor-pointer
        hover:bg-gray-some hover:underline underline-offset-3 aria-expanded:bg-gray-active aria-expanded:underline
        focus-visible:outline-2 focus-visible:outline-new-focus focus-visible:outline-offset-3"
      :button-props="{ title: t('À propos de cette organisation') }"
      @opened="loadOrganization"
    >
      <OrganizationNameInline :organization />
      <template #toggletip>
        <section class="flex flex-col gap-4 text-sm/[22px] text-gray-title">
          <div class="flex flex-col gap-3 min-w-0">
            <header class="flex items-start gap-3">
              <OrganizationLogo
                :organization="summary"
                size-class="size-12 p-1 flex-none rounded border border-gray-default overflow-hidden"
              />
              <h3 class="flex-1 m-0 text-base/6 font-semibold">
                <OrganizationNameInline
                  :organization="summary"
                  :show-type="false"
                />
              </h3>
            </header>
            <OrganizationTypeBadge
              :type="getOrganizationType(summary)"
              class="self-start"
            />
            <p
              v-if="'metrics' in summary"
              class="flex flex-wrap gap-x-4 gap-y-2 m-0 text-gray-secondary"
            >
              <ObjectCardMetric
                :icon="RiDatabase2Line"
                :value="summary.metrics.datasets"
                :label="t('{n} jeux de données | {n} jeu de données | {n} jeux de données', summary.metrics.datasets)"
              >
                {{ t('Jeux de données') }}
              </ObjectCardMetric>
              <ObjectCardMetric
                :icon="RiTerminalLine"
                :value="summary.metrics.dataservices"
                :label="t('{n} API', summary.metrics.dataservices)"
              >
                {{ t('API') }}
              </ObjectCardMetric>
              <ObjectCardMetric
                :icon="RiLineChartLine"
                :value="summary.metrics.reuses"
                :label="t('{n} réutilisations | {n} réutilisation | {n} réutilisations', summary.metrics.reuses)"
              >
                {{ t('Réutilisations') }}
              </ObjectCardMetric>
            </p>
            <ObjectCardShortDescription
              v-if="'description' in summary"
              :text="summary.description"
            />
            <!-- Same line boxes as the metrics and the two-line description it stands for -->
            <div
              v-if="loading"
              role="status"
              class="flex flex-col gap-3"
            >
              <span class="sr-only">{{ t('Chargement…') }}</span>
              <span
                class="h-[18px] w-4/5 rounded bg-gray-some animate-pulse-placeholder"
                aria-hidden="true"
              />
              <span
                class="flex flex-col"
                aria-hidden="true"
              >
                <span
                  v-for="width in ['w-full', 'w-3/5']"
                  :key="width"
                  class="flex items-center h-[22px]"
                >
                  <span
                    class="h-3.5 rounded bg-gray-some animate-pulse-placeholder"
                    :class="width"
                  />
                </span>
              </span>
            </div>
          </div>
          <p
            v-if="loadFailed"
            role="status"
            class="m-0"
          >
            {{ t('Les détails de cette organisation sont temporairement indisponibles.') }}
          </p>
          <AppLink
            :to="organizationUrl || organization.page"
            class="block pt-3 border-t border-gray-default font-medium text-gray-title bg-none underline underline-offset-3"
          >
            {{ t('Voir la page de l’organisation') }}
          </AppLink>
        </section>
      </template>
    </Toggletip>
    <AppLink
      v-else-if="organizationUrl !== null"
      class="relative z-2 flex items-center min-w-0 text-gray-title bg-none underline underline-offset-3"
      :to="organizationUrl || organization.page"
    >
      <OrganizationNameInline :organization />
    </AppLink>
    <span
      v-else
      class="relative z-2 flex items-center min-w-0 cursor-text"
    >
      <OrganizationNameInline :organization />
    </span>
  </div>
  <div
    v-else-if="ownerName"
    class="min-w-0 text-sm/6 text-gray-title [overflow-wrap:anywhere]"
  >
    {{ ownerName }}
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { RiDatabase2Line, RiLineChartLine, RiTerminalLine } from '@remixicon/vue'
import { useTranslation } from '../composables/useTranslation'
import { useComponentsConfig } from '../config'
import { getOwnerName } from '../functions/owned'
import { getOrganizationType } from '../functions/organizations'
import type { Organization, OrganizationReference } from '../types/organizations'
import type { UserReference } from '../types/users'
import AppLink from './AppLink.vue'
import ObjectCardMetric from './ObjectCardMetric.vue'
import ObjectCardShortDescription from './ObjectCardShortDescription.vue'
import OrganizationLogo from './OrganizationLogo.vue'
import OrganizationNameInline from './OrganizationNameInline.vue'
import OrganizationTypeBadge from './OrganizationTypeBadge.vue'
import Toggletip from './Toggletip.vue'

const props = defineProps<{
  showDetails?: boolean
  showLogo?: boolean
  organization?: OrganizationReference | null
  owner?: UserReference | null
  // undefined falls back to organization.page; pass null to render plain, non-linked text
  organizationUrl?: RouteLocationRaw | null
}>()

const { t } = useTranslation()
const config = useComponentsConfig()

// The card only receives a reference (name, logo, badges): the description and the metrics
// shown in the details are fetched when they are first opened.
const fullOrganization = ref<Organization | null>(null)
const summary = computed(() => fullOrganization.value ?? props.organization!)
const loading = ref(false)
const loadFailed = ref(false)
let controller: AbortController | undefined
watch(() => props.organization?.id, () => {
  controller?.abort()
  fullOrganization.value = null
  loading.value = false
  loadFailed.value = false
})
onBeforeUnmount(() => controller?.abort())

async function loadOrganization() {
  if (!props.organization || fullOrganization.value || loading.value) return
  // Embedded full organizations (including gallery examples) need no extra request.
  if ('metrics' in props.organization && 'description' in props.organization) return
  const request = new AbortController()
  controller = request
  loading.value = true
  loadFailed.value = false
  try {
    const result = await config.$fetch<Organization>(`/api/1/organizations/${encodeURIComponent(props.organization.id)}/`, {
      baseURL: config.apiBase,
      signal: request.signal,
    })
    if (!request.signal.aborted) fullOrganization.value = result
  }
  catch {
    if (!request.signal.aborted) loadFailed.value = true
  }
  finally {
    if (!request.signal.aborted) loading.value = false
  }
}

const ownerName = computed(() => {
  if (!props.owner) return ''
  return getOwnerName({ organization: null, owner: props.owner })
})
</script>
