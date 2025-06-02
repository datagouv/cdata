<template>
  <div>
    <div class="flex flex-wrap mb-2">
      <h2 class="!text-sm !mb-2.5 w-full flex-none sm:flex-1">
        {{ $t('Statistics from the last 12 months') }}
      </h2>
      <div>
        <BrandedButton
          color="secondary"
          :disabled="!downloadStatsUrl"
          :href="downloadStatsUrl || ''"
          :title="$t('Download file')"
          download="stats.csv"
          :icon="RiDownloadLine"
          size="xs"
        >
          {{ $t('Download statistics as CSV') }}
        </BrandedButton>
      </div>
    </div>
    <section
      class="flex flex-col md:flex-row px-4 pb-4"
    >
      <ClientOnly>
        <StatBox
          :title="$t('Views')"
          :data="metricsViews"
          type="line"
          :summary="metricsViewsTotal"
          class="md:w-1/3 mb-8 md:mb-0"
        />
        <StatBox
          :title="$t('Downloads')"
          :data="metricsDownloads"
          type="line"
          :summary="metricsDownloadsTotal"
          class="md:w-1/3 mb-8 md:mb-0"
        />
        <StatBox
          :title="$t('Reuses Visits')"
          :data="metricsReuses"
          type="line"
          :summary="metricsReusesTotal"
          class="md:w-1/3 mb-8 md:mb-0"
        />
      </ClientOnly>
    </section>
    <SectionCollapse
      :title="$t('Members')"
      :button-text="$t('See members')"
    >
      <template #buttons>
        <BrandedButton
          v-if="pendingRequests && pendingRequests.length"
          color="secondary"
          size="xs"
          :icon="RiCheckLine"
          :disabled="true"
        >
          {{ $t('Request pending approval') }}
        </BrandedButton>
        <ModalWithButton
          v-else-if="me && !alreadyMember"
          size="lg"
          :title="$t('Ask to join the organization')"
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
                {{ $t('Ask to join the organization') }}
              </BrandedButton>
            </div>
          </template>
          <p class="!mb-4">
            {{ $t('Organization administrator will have to accept your request.') }}
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
            :label="$t('Request reason')"
            :placeholder="$t('Specify your role in the organization and why you want to join it.')"
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
                {{ $t('Cancel') }}
              </BrandedButton>
              <BrandedButton
                color="primary"
                size="sm"
                @click="sendRequest(reason, close)"
              >
                {{ $t('Send your request') }}
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
                {{ member.role }}
              </AdminBadge>
            </p>
          </div>
        </div>
      </div>
    </SectionCollapse>
    <SectionCollapse
      :title="$t('Technical information')"
      :button-text="$t('See technical information')"
    >
      <DescriptionList class="mb-2">
        <div>
          <DescriptionListTerm>{{ $t('Latest update') }}</DescriptionListTerm>
          <DescriptionListDetails>{{ formatDate(organization.last_modified) }}</DescriptionListDetails>
        </div>
        <div>
          <DescriptionListTerm>{{ $t('ID') }}</DescriptionListTerm>
          <DescriptionListDetails class="flex items-center gap-2">
            {{ organization.id }}
            <CopyButton
              class="!-mt-0.5"
              :label="$t('Copy organization ID')"
              :copied-label="$t('Organization ID copied')"
              :text="organization.id"
              :hide-label="true"
            />
          </DescriptionListDetails>
        </div>
      </DescriptionList>
      <DescriptionList>
        <div>
          <DescriptionListTerm>{{ $t('Creation date') }}</DescriptionListTerm>
          <DescriptionListDetails>{{ formatDate(organization.created_at) }}</DescriptionListDetails>
        </div>
      </DescriptionList>
    </SectionCollapse>
  </div>
</template>

<script setup lang="ts">
import { Avatar, BrandedButton, CopyButton, formatDate, OrganizationNameWithCertificate, StatBox, type Organization } from '@datagouv/components-next'
import { RiCheckLine, RiDownloadLine, RiTeamLine } from '@remixicon/vue'
import type { MembershipRequest, PendingMembershipRequest } from '~/types/types'

const props = defineProps<{
  organization: Organization
}>()

const { t } = useI18n()

const config = useRuntimeConfig()
const { $api } = useNuxtApp()
const { toast } = useToast()
const me = useMaybeMe()

const metricsViews = ref<null | Record<string, number>>(null)
const metricsViewsTotal = ref<null | number>(null)
const metricsDownloads = ref<null | Record<string, number>>(null)
const metricsDownloadsTotal = ref<null | number>(null)
const metricsReuses = ref<null | Record<string, number>>(null)
const metricsReusesTotal = ref<null | number>(null)

const reason = ref('')

const alreadyMember = computed(() => me.value?.organizations.find(organization => organization.id === props.organization.id))

const downloadStatsUrl = computed(() => {
  if (!metricsViews.value || !metricsDownloads.value || !metricsReuses.value) {
    return null
  }

  return createOrganizationMetricsUrl(metricsViews.value, metricsDownloads.value, metricsReuses.value)
})

watchEffect(async () => {
  const metrics = await getOrganizationMetrics(props.organization.id)
  metricsDownloads.value = metrics.downloads
  metricsDownloadsTotal.value = metrics.downloadsTotal
  metricsReuses.value = metrics.reusesViews
  metricsReusesTotal.value = metrics.reusesViewsTotal
  metricsViews.value = metrics.datasetsViews
  metricsViewsTotal.value = metrics.datasetsViewsTotal
})

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
    toast.error(t('An error occured while sending your request'))
  }
}
</script>
