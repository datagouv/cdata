<template>
  <div>
    <div class="flex flex-wrap mb-6">
      <h2 class="text-sm w-full flex-none sm:flex-1 mb-0">
        {{ $t('Statistiques à partir de juillet 2022') }}
      </h2>
      <div>
        <BrandedButton
          color="secondary"
          :disabled="!downloadStatsUrl"
          :href="downloadStatsUrl || ''"
          download="stats.csv"
          :icon="RiDownloadLine"
          size="xs"
        >
          {{ $t('Télécharger les statistiques au format CSV') }}
        </BrandedButton>
      </div>
    </div>
    <section
      class="grid md:grid-cols-2 xl:grid-cols-4 gap-4 px-4 pb-4"
    >
      <ClientOnly>
        <StatBox
          :title="$t('Jeux de données')"
          :data="organization.metrics.datasets_by_months"
          type="bar"
          :summary="organization.metrics.datasets"
        />
        <StatBox
          :title="$t('API')"
          :data="organization.metrics.dataservices_by_months"
          type="bar"
          :summary="organization.metrics.dataservices"
        />
        <StatBox
          :title="$t('Réutilisations')"
          :data="organization.metrics.reuses_by_months"
          type="bar"
          :summary="organization.metrics.reuses"
        />
      </ClientOnly>
    </section>
    <Divider
      color="bg-gray-default"
      class="mb-6 pr-24"
    />
    <section
      class="grid md:grid-cols-2 xl:grid-cols-4 gap-4 px-4 pb-4"
    >
      <ClientOnly>
        <StatBox
          :title="$t('Vues')"
          :data="metricsDatasetsViews"
          type="line"
          :summary="metricsDatasetsViewsTotal"
        />
        <StatBox
          :title="$t('Téléchargements des données')"
          :data="metricsDownloads"
          type="line"
          :summary="metricsDownloadsTotal"
        />
        <StatBox
          :title="$t('Nombre de visites des API')"
          :data="metricsDataservicesViews"
          type="line"
          :summary="metricsDataservicesViewsTotal"
        />
        <StatBox
          :title="$t('Nombre de visites des réutilisations')"
          :data="metricsReuses"
          type="line"
          :summary="metricsReusesTotal"
        />
      </ClientOnly>
    </section>
    <SectionCollapse
      :title="$t('Membres')"
      :button-text="$t('Voir les membres')"
    >
      <template #buttons>
        <BrandedButton
          v-if="pendingRequests && pendingRequests.length"
          color="secondary"
          size="xs"
          :icon="RiCheckLine"
          :disabled="true"
        >
          {{ $t(`Requête en attente d'approbation`) }}
        </BrandedButton>
        <ModalWithButton
          v-else-if="me && !alreadyMember"
          size="lg"
          :title="$t(`Demander à rejoindre l'organisation`)"
        >
          <template #button="{ attrs, listeners }">
            <div>
              <BrandedButton
                color="secondary"
                size="xs"
                :icon="RiTeamLine"
                :loading="status === 'pending'"
                v-bind="attrs"
                v-on="listeners"
              >
                {{ $t(`Demander à rejoindre l'organisation`) }}
              </BrandedButton>
            </div>
          </template>
          <p class="!mb-4">
            {{ $t(`L'administrateur de l'organisation doit accepter votre demande.`) }}
          </p>
          <p class="flex items-center gap-2 !mb-4 text-sm">
            <Placeholder
              :src="organization.logo_thumbnail"
              type="organization"
              :size="28"
              class=" flex-none p-1 border rounded-sm border-gray-default"
            />
            <OrganizationNameWithCertificate
              :organization
              :certifier="config.public.title"
              :show-type="false"
              class="truncate"
              size="sm"
            />
          </p>
          <InputGroup
            v-model="reason"
            :label="$t('Motif de la demande')"
            :placeholder="$t(`Indiquer votre rôle dans l'organisation et pourquoi vous voulez la rejoindre.`)"
            type="textarea"
            :required="true"
          />
          <template #footer="{ close }">
            <div class="w-full flex gap-4 justify-end">
              <BrandedButton
                color="secondary"
                size="sm"
                @click="close"
              >
                {{ $t('Annuler') }}
              </BrandedButton>
              <BrandedButton
                color="primary"
                size="sm"
                @click="sendRequest(reason, close)"
              >
                {{ $t('Envoyer votre demande') }}
              </BrandedButton>
            </div>
          </template>
        </ModalWithButton>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="(member, index) in organization.members"
          :key="member.user.id"
          class="flex flex-wrap gap-4 px-6"
          :class="{ 'border-l border-gray-default': index % 3 }"
        >
          <div>
            <Avatar
              :user="member.user"
              :size="60"
              class="flex-none rounded-full"
            />
          </div>
          <div class="flex-1">
            <p class="!mb-0">
              {{ member.user.first_name }} {{ member.user.last_name }}
            </p>
            <p class="!mb-0">
              <AdminBadge
                type="secondary"
                size="sm"
              >
                {{ member.label }}
              </AdminBadge>
            </p>
          </div>
        </div>
      </div>
    </SectionCollapse>
    <SectionCollapse
      :title="$t('Informations techniques')"
      :button-text="$t('Voir les informations techniques')"
    >
      <DescriptionList class="mb-2">
        <div>
          <DescriptionListTerm>{{ $t('Dernière mise à jour') }}</DescriptionListTerm>
          <DescriptionListDetails>{{ formatDate(organization.last_modified) }}</DescriptionListDetails>
        </div>
        <div>
          <DescriptionListTerm>{{ $t('Identifiant') }}</DescriptionListTerm>
          <DescriptionListDetails class="flex items-center gap-2">
            {{ organization.id }}
            <CopyButton
              class="!-mt-0.5"
              :label="$t(`Copier l'identifiant de l'organisation`)"
              :copied-label="$t(`Identifiant de l'organisation copié !`)"
              :text="organization.id"
              :hide-label="true"
            />
          </DescriptionListDetails>
        </div>
      </DescriptionList>
      <DescriptionList>
        <div>
          <DescriptionListTerm>{{ $t('Date de création') }}</DescriptionListTerm>
          <DescriptionListDetails>{{ formatDate(organization.created_at) }}</DescriptionListDetails>
        </div>
      </DescriptionList>
    </SectionCollapse>
  </div>
</template>

<script setup lang="ts">
import { Avatar, BrandedButton, CopyButton, OrganizationNameWithCertificate, StatBox, useFormatDate, type Organization } from '@datagouv/components-next'
import { RiCheckLine, RiDownloadLine, RiTeamLine } from '@remixicon/vue'
import Divider from '~/components/Divider.vue'
import type { MembershipRequest, PendingMembershipRequest } from '~/types/types'

const props = defineProps<{
  organization: Organization
}>()

const { t } = useI18n()
const { formatDate } = useFormatDate()

const config = useRuntimeConfig()
const { $api } = useNuxtApp()
const { toast } = useToast()
const me = useMaybeMe()

const metricsDataservicesViews = ref<null | Record<string, number>>(null)
const metricsDataservicesViewsTotal = ref<null | number>(null)
const metricsDatasetsViews = ref<null | Record<string, number>>(null)
const metricsDatasetsViewsTotal = ref<null | number>(null)
const metricsDownloads = ref<null | Record<string, number>>(null)
const metricsDownloadsTotal = ref<null | number>(null)
const metricsReuses = ref<null | Record<string, number>>(null)
const metricsReusesTotal = ref<null | number>(null)

watchEffect(async () => {
  const metrics = await getOrganizationMetrics(props.organization.id)
  metricsDownloads.value = metrics.downloads
  metricsDownloadsTotal.value = metrics.downloadsTotal
  metricsReuses.value = metrics.reusesViews
  metricsReusesTotal.value = metrics.reusesViewsTotal
  metricsDataservicesViews.value = metrics.dataservicesViews
  metricsDataservicesViewsTotal.value = metrics.dataservicesViewsTotal
  metricsDatasetsViews.value = metrics.datasetsViews
  metricsDatasetsViewsTotal.value = metrics.datasetsViewsTotal
})

const downloadStatsUrl = computed(() => {
  if (!metricsDatasetsViews.value || !metricsDownloads.value || !metricsDataservicesViews.value || !metricsReuses.value) {
    return null
  }

  return createOrganizationMetricsUrl(metricsDatasetsViews.value, metricsDownloads.value, metricsDataservicesViews.value, metricsReuses.value)
})

const reason = ref('')

const alreadyMember = computed(() => me.value?.organizations.find(organization => organization.id === props.organization.id))

const { data: pendingRequests, status, refresh } = await useAsyncData<Array<PendingMembershipRequest | MembershipRequest>>('membership-requests', () => {
  if (me.value) {
    return $api(`/api/1/organizations/${props.organization.id}/membership/`, {
      query: {
        user: me.value?.id,
        status: 'pending',
      },
    })
  }
  return Promise.resolve([])
})

async function sendRequest(comment: string, closeModal: () => void) {
  try {
    await $api(`/api/1/organizations/${props.organization.id}/membership/`, {
      method: 'POST',
      body: {
        comment,
      },
    })
    refresh()
    closeModal()
  }
  catch {
    toast.error(t(`Une erreur est survenue pendant l'envoi de votre demande`))
  }
}
</script>
