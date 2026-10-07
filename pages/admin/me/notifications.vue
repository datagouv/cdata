<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Notifications') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-extrabold text-2xl text-gray-title mb-5">
      {{ t('Notifications') }}
    </h1>

    <div class="max-w-6xl space-y-8">
      <PaddedContainer class="!p-0 divide-y divide-gray-default">
        <div class="px-5 py-3 flex items-center justify-between">
          <h2 class="m-0 text-sm font-bold">
            {{ t('Ce qui vous concerne') }}
          </h2>
          <BrandedButton
            color="tertiary"
            size="xs"
            @click="disableAll"
          >
            {{ t('Tout désactiver') }}
          </BrandedButton>
        </div>
        <AnimatedLoader
          v-if="preferences === null"
          class="m-5"
        />
        <div
          v-for="row in reasonRows"
          v-else
          :key="row.reason"
          :class="ROW_CLASS"
        >
          <p
            :id="`reason-${row.reason}`"
            class="m-0 text-sm font-bold"
          >
            {{ row.label }}
          </p>
          <div
            role="radiogroup"
            :aria-labelledby="`reason-${row.reason}`"
            :class="CHOICES_CLASS"
          >
            <div
              v-for="option in channelOptions"
              :key="option.value"
              class="fr-radio-group fr-radio-group--sm"
            >
              <input
                :id="`reason-${row.reason}-${option.value}`"
                type="radio"
                :name="`reason-${row.reason}`"
                :checked="channelsValue(row.reason) === option.value"
                @change="saveChannels(row.reason, option.value)"
              >
              <label
                class="fr-label"
                :for="`reason-${row.reason}-${option.value}`"
              >
                {{ option.label }}
              </label>
            </div>
          </div>
        </div>
      </PaddedContainer>

      <PaddedContainer class="!p-0 divide-y divide-gray-default">
        <h2 class="m-0 px-5 py-3 text-sm font-bold">
          {{ t('E-mails') }}
        </h2>
        <div :class="ROW_CLASS">
          <p
            id="mail-cadence"
            class="m-0 text-sm font-bold"
          >
            {{ t('Rythme') }}
          </p>
          <div
            role="radiogroup"
            aria-labelledby="mail-cadence"
            :class="CHOICES_CLASS"
          >
            <div
              v-for="option in cadenceOptions"
              :key="option.value"
              class="fr-radio-group fr-radio-group--sm"
            >
              <input
                :id="`mail-cadence-${option.value}`"
                type="radio"
                name="mail-cadence"
                :checked="me.mail_cadence === option.value"
                @change="saveMe({ mail_cadence: option.value })"
              >
              <label
                class="fr-label"
                :for="`mail-cadence-${option.value}`"
              >
                {{ option.label }}
              </label>
            </div>
          </div>
        </div>
        <div :class="ROW_CLASS">
          <p
            id="mail-types"
            class="m-0 text-sm font-bold"
          >
            {{ t('Envoyer par e-mail') }}
          </p>
          <div
            role="group"
            aria-labelledby="mail-types"
            :class="CHOICES_CLASS"
          >
            <div
              v-for="type in mailTypes"
              :key="type.value"
              class="fr-checkbox-group fr-checkbox-group--sm"
            >
              <input
                :id="`mail-type-${type.value}`"
                type="checkbox"
                :checked="!me.mail_muted_types.includes(type.value)"
                @change="toggleMailType(type.value, ($event.target as HTMLInputElement).checked)"
              >
              <label
                class="fr-label"
                :for="`mail-type-${type.value}`"
              >
                {{ type.label }}
              </label>
            </div>
          </div>
        </div>
      </PaddedContainer>

      <PaddedContainer
        v-if="groups.length"
        class="!p-0 divide-y divide-gray-default"
      >
        <h2 class="m-0 px-5 py-3 text-sm font-bold">
          {{ t('Contenus suivis') }}
        </h2>
        <div
          v-for="group in groups"
          :key="group.key"
          class="px-5 py-3 space-y-2"
        >
          <div class="fr-checkbox-group fr-checkbox-group--sm">
            <input
              :id="`group-${group.key}`"
              type="checkbox"
              :checked="group.rows.every(row => row.followed)"
              :indeterminate="group.rows.some(row => row.followed) && !group.rows.every(row => row.followed)"
              @change="followAll(group.rows, ($event.target as HTMLInputElement).checked)"
            >
            <label
              class="fr-label font-bold"
              :for="`group-${group.key}`"
            >
              {{ group.label }}
            </label>
          </div>
          <div
            v-for="row in group.rows"
            :key="row.key"
            class="fr-checkbox-group fr-checkbox-group--sm pl-6"
          >
            <input
              :id="`subject-${row.key}`"
              type="checkbox"
              :checked="row.followed"
              @change="followAll([row], ($event.target as HTMLInputElement).checked)"
            >
            <label
              class="fr-label"
              :for="`subject-${row.key}`"
            >
              <CdataLink
                v-if="row.page"
                :to="row.page"
                class="link"
              >
                {{ row.title }}
              </CdataLink>
              <span
                v-else
                class="text-gray-medium"
              >
                {{ t(`Contenu qui ne vous est plus accessible`) }}
              </span>
            </label>
          </div>
        </div>
      </PaddedContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AnimatedLoader, BrandedButton, PaddedContainer, toast } from '@datagouv/components-next'
import type { OrganizationReference } from '@datagouv/components-next'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import CdataLink from '~/components/CdataLink.vue'
import type { Me } from '~/utils/auth'
import type { DiscussionNotification, MailCadence, NotificationChannel, NotificationPreference, NotificationReason, NotificationScope } from '~/types/notifications'

type ChannelsValue = 'both' | 'app' | 'mail' | 'none'

const { t } = useTranslation()
const { $api } = useNuxtApp()
const me = useMe()
const { settings, load, decide } = useNotificationSettings()

// Every setting reads as a line: its label on the left, its choices on the right.
const ROW_CLASS = 'px-5 py-4 grid grid-cols-[14rem_1fr] items-center gap-6'
const CHOICES_CLASS = 'flex flex-wrap gap-x-6 gap-y-2'

const preferences = ref<Array<NotificationPreference> | null>(null)

onMounted(async () => {
  load()
  preferences.value = await $api<Array<NotificationPreference>>('/api/1/notifications/preferences/')
})

const reasonRows = computed<Array<{ reason: NotificationReason, label: string }>>(() => [
  { reason: 'owner', label: t('Vos contenus') },
  { reason: 'organization.admin', label: t('Organisations que vous administrez') },
  { reason: 'organization.partial_editor', label: t('Contenus qui vous sont confiés') },
  { reason: 'organization.editor', label: t('Organisations où vous êtes éditeur') },
  { reason: 'discussion.participant', label: t('Discussions auxquelles vous participez') },
  { reason: 'explicit_subscriber', label: t('Contenus que vous suivez') },
])

const channelOptions = computed<Array<{ value: ChannelsValue, label: string }>>(() => [
  { value: 'both', label: t('Application et e-mail') },
  { value: 'app', label: t('Application seulement') },
  { value: 'mail', label: t('E-mail seulement') },
  { value: 'none', label: t('Jamais') },
])

const CHANNELS_BY_VALUE: Record<ChannelsValue, Array<NotificationChannel>> = {
  both: ['app', 'mail'],
  app: ['app'],
  mail: ['mail'],
  none: [],
}

function channelsValue(reason: NotificationReason): ChannelsValue {
  const channels = preferences.value?.find(preference => preference.reason === reason)?.channels ?? []
  if (channels.includes('app')) return channels.includes('mail') ? 'both' : 'app'
  return channels.includes('mail') ? 'mail' : 'none'
}

async function saveChannels(reason: NotificationReason, value: ChannelsValue) {
  preferences.value = await $api<Array<NotificationPreference>>('/api/1/notifications/preferences/', {
    method: 'PUT',
    body: { reason, channels: CHANNELS_BY_VALUE[value] },
  })
  toast.success(t('Préférence enregistrée'))
}

const cadenceOptions = computed<Array<{ value: MailCadence, label: string }>>(() => [
  { value: 'immediate', label: t('À chaque fois') },
  { value: 'daily', label: t('Un résumé par jour') },
  { value: 'weekly', label: t('Un résumé par semaine') },
])

// Reuses and APIs are only announced in the app, discussions are the only mails to choose from.
const mailTypes = computed<Array<{ value: DiscussionNotification['type'], label: string }>>(() => [
  { value: 'discussion.new', label: t('Nouvelles discussions') },
  { value: 'discussion.comment', label: t('Réponses') },
  { value: 'discussion.closed', label: t('Discussions clôturées') },
])

async function toggleMailType(type: DiscussionNotification['type'], checked: boolean) {
  const muted = me.value.mail_muted_types.filter(muted => muted !== type)
  await saveMe({ mail_muted_types: checked ? muted : [...muted, type] })
}

async function saveMe(body: Partial<Pick<Me, 'mail_cadence' | 'mail_muted_types'>>) {
  const updated = await $api<Me>('/api/1/me/', { method: 'PUT', body })
  me.value.mail_cadence = updated.mail_cadence
  me.value.mail_muted_types = updated.mail_muted_types
  toast.success(t('Préférence enregistrée'))
}

type SubjectRow = {
  key: string
  scope: NotificationScope
  title: string | null
  page: string | null
  followed: boolean
}

// One row per subject, grouped under its organization: unchecking an organization
// stops following everything one worked on there.
const groups = computed(() => {
  const rows = new Map<string, SubjectRow & { organization: OrganizationReference | null }>()
  for (const setting of settings.value ?? []) {
    const key = `${setting.scope.class}-${setting.scope.id}`
    const row = rows.get(key)
    if (row) {
      row.followed ||= setting.enabled
      continue
    }
    rows.set(key, {
      key,
      scope: setting.scope,
      title: setting.subject?.title ?? null,
      page: setting.subject?.page ?? null,
      followed: setting.enabled,
      organization: setting.subject?.organization ?? null,
    })
  }

  const byOrganization = new Map<string, { key: string, label: string, rows: Array<SubjectRow> }>()
  for (const row of rows.values()) {
    const key = row.organization?.id ?? 'none'
    if (!byOrganization.has(key)) {
      byOrganization.set(key, { key, label: row.organization?.name ?? t('Sans organisation'), rows: [] })
    }
    byOrganization.get(key)!.rows.push(row)
  }
  return [...byOrganization.values()]
})

async function followAll(rows: Array<SubjectRow>, followed: boolean) {
  const decided = (settings.value ?? []).filter(setting => rows.some(row => row.scope.class === setting.scope.class && row.scope.id === setting.scope.id))
  await Promise.all(decided.map(setting => decide(setting.scope, setting.event, followed)))
  toast.success(followed ? t('Suivi réactivé') : t('Vous ne suivez plus ces contenus'))
}

async function disableAll() {
  for (const row of reasonRows.value) {
    preferences.value = await $api<Array<NotificationPreference>>('/api/1/notifications/preferences/', {
      method: 'PUT',
      body: { reason: row.reason, channels: [] },
    })
  }
  toast.success(t('Toutes les notifications sont désactivées'))
}
</script>
