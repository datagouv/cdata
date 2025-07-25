<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem
        v-if="currentOrganization"
        :to="`/admin/organizations/${currentOrganization.id}/harvesters`"
      >
        {{ t('Moissonneurs') }}
      </BreadcrumbItem>
      <template v-if="job">
        <BreadcrumbItem
          v-if="harvester"
          :to="getHarvesterAdminUrl(harvester)"
        >
          {{ harvester.name }}
        </BreadcrumbItem>
        <BreadcrumbItem>
          {{ job.id }}
        </BreadcrumbItem>
      </template>
      <BreadcrumbItem v-else-if="harvester">
        {{ harvester.name }}
      </BreadcrumbItem>
    </AdminBreadcrumb>

    <div v-if="harvester && !job">
      <div class="mb-5">
        <div class="flex flex-wrap items-center justify-between mb-3 gap-x-4 gap-y-2">
          <h1 class="flex-none w-full md:flex-1 font-bold text-gray-title text-2xl !mb-0">
            {{ harvester.name }}
          </h1>
          <BrandedButton
            v-if="harvester.validation.state === 'accepted' && harvester.active && (config.public.harvestEnableManualRun || isMeAdmin())"
            :icon="RiPlayLargeLine"
            size="xs"
            :loading
            @click="run"
          >
            {{ $t(`Planifier l'exécution`) }}
          </BrandedButton>
        </div>

        <div class="text-sm text-mentionGrey space-y-1.5">
          <div class="space-x-1">
            <RiToolsLine class="inline size-3" />
            <span>{{ $t('Implémentation:') }}</span>
            <span class="font-mono">{{ harvester.backend }}</span>
          </div>
          <div class="space-x-1">
            <RiLink class="inline size-3" />
            <span>{{ $t('URL:') }}</span>
            <span class="font-mono">{{ harvester.url }}</span>
          </div>
          <div class="space-x-1">
            <RiCalendarEventLine class="inline size-3" />
            <span>{{ $t('Planning :') }}</span>
            <span class="font-mono">{{ harvester.schedule || 'N/A' }}</span>
          </div>
          <div class="space-x-1">
            <RiCheckboxCircleLine class="inline size-3" />
            <span>{{ $t('Statut :') }}</span>
            <HarvesterBadge :harvester />
          </div>
        </div>

        <BannerAction
          v-if="harvester.validation.state === 'pending'"
          class="mt-3"
          type="primary"
          :title="$t(`Votre moissonneur est créé, il est en attente de validation de l'équipe administratrice de la plateforme.`)"
        >
          {{ $t("Merci de nous informer via le formulaire de contact suivant si vous souhaitez que nous validions votre moissonneur. Vous serez notifié à l’approbation (ou au refus).") }}

          <template #button>
            <BrandedButton
              :href="config.public.harvesterRequestValidationUrl"
              new-tab
            >
              {{ $t("Demander la validation") }}
            </BrandedButton>
          </template>
        </BannerAction>

        <BannerAction
          v-if="isMeAdmin() && harvester.validation.state === 'pending'"
          class="mt-3"
          type="primary"
          :title="$t('Validation du moissonneur')"
        >
          {{ $t("Attention les données seront publiées une fois le moissonneur validé.") }}

          <template #button>
            <ModalWithButton
              :title="$t('Validation du moissonneur')"
              size="lg"
            >
              <template #button="{ attrs, listeners }">
                <BrandedButton
                  v-bind="attrs"
                  v-on="listeners"
                >
                  {{ $t('Valider ou refuser…') }}
                </BrandedButton>
              </template>

              <div>
                <InputGroup
                  v-model="comment"
                  type="textarea"
                  :label="$t('Commentaire')"
                />
              </div>
              <template #footer="{ close }">
                <div
                  class="w-full flex justify-end space-x-4"
                >
                  <BrandedButton
                    color="primary"
                    :loading
                    @click="validate(close, 'accepted')"
                  >
                    {{ $t('Valider') }}
                  </BrandedButton>
                  <BrandedButton
                    color="danger"
                    :loading
                    @click="validate(close, 'refused')"
                  >
                    {{ $t('Refuser') }}
                  </BrandedButton>
                </div>
              </template>
            </ModalWithButton>
          </template>
        </BannerAction>
      </div>

      <TabLinks
        class="mb-5"
        :links="[
          { href: getHarvesterAdminUrl(harvester), label: t('Jobs') },
          { href: `${getHarvesterAdminUrl(harvester)}/configuration`, label: t('Configuration') },
        ]"
      />
    </div>

    <NuxtPage :page-key="route => route.fullPath" />
  </div>
</template>

<script setup lang="ts">
import { RiCalendarEventLine, RiCheckboxCircleLine, RiLink, RiPlayLargeLine, RiToolsLine } from '@remixicon/vue'
import { BannerAction, BrandedButton } from '@datagouv/components-next'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import HarvesterBadge from '~/components/Harvesters/HarvesterBadge.vue'
import TabLinks from '~/components/TabLinks.vue'
import type { HarvesterJob, HarvesterSource } from '~/types/harvesters'

const config = useRuntimeConfig()
const { t } = useI18n()
const { $api } = useNuxtApp()
const { toast } = useToast()

const { currentOrganization } = useCurrentOwned()

const route = useRoute()
const url = computed(() => `/api/1/harvest/source/${route.params.id}`)
const { data: harvester, refresh } = await useAPI<HarvesterSource>(url, { redirectOn404: true })
const job = ref<HarvesterJob | null>(null)
watchEffect(async () => {
  if (!harvester.value) return
  if (!route.params.jobid) return

  job.value = await $api(`/api/1/harvest/job/${route.params.jobid}/`)
})

const loading = ref(false)
const run = async () => {
  loading.value = true

  try {
    await $api(`/api/1/harvest/source/${route.params.id}/run`, {
      method: 'POST',
    })
    toast.success(t(`L'exécution est planifiée`))
  }
  finally {
    loading.value = false
  }
}

const comment = ref('')
const validate = async (close: () => void, state: 'accepted' | 'refused') => {
  try {
    loading.value = true
    await $api(`/api/1/harvest/source/${route.params.id}/validate`, {
      method: 'POST',
      body: JSON.stringify({
        state,
        comment: comment.value,
      }),
    })

    close()

    await refresh()
  }
  finally {
    loading.value = false
  }
}
</script>
