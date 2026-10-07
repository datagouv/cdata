<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Notifications') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-extrabold text-2xl text-gray-title mb-5">
      {{ t('Notifications') }}
    </h1>

    <AnimatedLoader v-if="settings === null || reasonDefaults === null" />
    <div
      v-else
      class="max-w-6xl space-y-8"
    >
      <BannerAction
        v-if="allOff"
        type="warning"
        :title="t('Toutes vos notifications sont désactivées')"
      >
        {{ t(`Vous recevez seulement ce qui demande une action de votre part : invitations, transferts, moissonneurs à valider.`) }}
        <template #button>
          <BrandedButton
            color="secondary"
            size="xs"
            @click="setAllOff(false)"
          >
            {{ t('Réactiver') }}
          </BrandedButton>
        </template>
      </BannerAction>

      <PaddedContainer class="!p-0 divide-y divide-gray-default">
        <div class="px-5 py-3 flex items-center justify-between">
          <h2 class="m-0 text-sm font-bold">
            {{ t('Ce qui vous concerne') }}
          </h2>
          <BrandedButton
            v-if="!allOff"
            color="tertiary"
            size="xs"
            @click="setAllOff(true)"
          >
            {{ t('Tout désactiver') }}
          </BrandedButton>
        </div>
        <div
          v-for="row in reasonRows"
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
                :checked="reasonValue(row.reason) === option.value"
                @change="saveReason(row.reason, option.value)"
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
                @change="saveCadence(option.value)"
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
      </PaddedContainer>

      <PaddedContainer
        v-if="groups.length"
        class="!p-0 divide-y divide-gray-default"
      >
        <div class="px-5 py-3">
          <h2 class="m-0 text-sm font-bold">
            {{ t('Contenus suivis') }}
          </h2>
          <p class="m-0 text-xs text-gray-medium">
            {{ t('Décocher un contenu : vous ne recevrez plus rien à son sujet.') }}
          </p>
        </div>
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
                {{ t('Contenu qui ne vous est plus accessible') }}
              </span>
              <span
                v-if="row.events.length"
                class="text-gray-medium"
              >
                ({{ row.events.map(eventLabel).join(', ') }})
              </span>
            </label>
          </div>
        </div>
      </PaddedContainer>

      <PaddedContainer
        v-if="otherRules.length"
        class="!p-0 divide-y divide-gray-default"
      >
        <h2 class="m-0 px-5 py-3 text-sm font-bold">
          {{ t('Autres réglages') }}
        </h2>
        <div
          v-for="rule in otherRules"
          :key="rule.id"
          class="px-5 py-2 flex items-center gap-4 text-sm"
        >
          <span class="flex-1">{{ describe(rule) }}</span>
          <BrandedButton
            color="tertiary"
            size="xs"
            @click="setRule(rule, !rule.enabled)"
          >
            {{ rule.enabled ? t('Oui') : t('Non') }}
          </BrandedButton>
          <BrandedButton
            color="tertiary"
            size="xs"
            :icon="RiDeleteBinLine"
            icon-only
            :title="t('Supprimer ce réglage')"
            keep-margins-even-without-borders
            @click="setRule(rule, null)"
          />
        </div>
      </PaddedContainer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AnimatedLoader, BannerAction, BrandedButton, PaddedContainer, toast } from '@datagouv/components-next'
import type { OrganizationReference } from '@datagouv/components-next'
import { RiDeleteBinLine } from '@remixicon/vue'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import CdataLink from '~/components/CdataLink.vue'
import type { Me } from '~/utils/auth'
import type { MailCadence, NotificationEvent, NotificationReason, NotificationReasonDefault, NotificationScope, NotificationSetting } from '~/types/notifications'

type ChannelsValue = 'both' | 'app' | 'mail' | 'none'

const { t } = useTranslation()
const { $api } = useNuxtApp()
const me = useMe()
const { settings, load, ruleValue, setRule } = useNotificationSettings()

// Every setting reads as a line: its label on the left, its choices on the right.
const ROW_CLASS = 'px-5 py-4 grid grid-cols-[14rem_1fr] items-center gap-6'
const CHOICES_CLASS = 'flex flex-wrap gap-x-6 gap-y-2'

const reasonDefaults = ref<Array<NotificationReasonDefault> | null>(null)

onMounted(async () => {
  load()
  reasonDefaults.value = await $api<Array<NotificationReasonDefault>>('/api/1/notifications/reasons/')
})

// "Turn everything off" is a rule on each channel, everywhere: a channel rule is the
// only kind a follow cannot bring back (see udata's `resolve`).
const allOff = computed(() => ruleValue({ channel: 'app' }) === false && ruleValue({ channel: 'mail' }) === false)

async function setAllOff(off: boolean) {
  await Promise.all([
    setRule({ channel: 'app' }, off ? false : null),
    setRule({ channel: 'mail' }, off ? false : null),
  ])
  toast.success(off ? t('Toutes les notifications sont désactivées') : t('Notifications réactivées'))
}

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

function reasonDefault(reason: NotificationReason) {
  return reasonDefaults.value?.find(item => item.reason === reason)?.default ?? false
}

// A reason row writes up to three rules: whether one is concerned at all, then a rule
// per channel turned off.
function reasonValue(reason: NotificationReason): ChannelsValue {
  const concerned = ruleValue({ reason }) ?? reasonDefault(reason)
  const app = ruleValue({ reason, channel: 'app' }) !== false
  const mail = ruleValue({ reason, channel: 'mail' }) !== false
  if (!concerned || (!app && !mail)) return 'none'
  if (app && mail) return 'both'
  return app ? 'app' : 'mail'
}

async function saveReason(reason: NotificationReason, value: ChannelsValue) {
  const concerned = value !== 'none'
  await Promise.all([
    setRule({ reason }, concerned === reasonDefault(reason) ? null : concerned),
    setRule({ reason, channel: 'app' }, concerned && value === 'mail' ? false : null),
    setRule({ reason, channel: 'mail' }, concerned && value === 'app' ? false : null),
  ])
  toast.success(t('Préférence enregistrée'))
}

const cadenceOptions = computed<Array<{ value: MailCadence, label: string }>>(() => [
  { value: 'immediate', label: t('À chaque fois') },
  { value: 'daily', label: t('Un résumé par jour') },
  { value: 'weekly', label: t('Un résumé par semaine') },
])

async function saveCadence(mailCadence: MailCadence) {
  const updated = await $api<Me>('/api/1/me/', { method: 'PUT', body: { mail_cadence: mailCadence } })
  me.value.mail_cadence = updated.mail_cadence
  toast.success(t('Préférence enregistrée'))
}

type SubjectRow = {
  key: string
  scope: NotificationScope
  title: string | null
  page: string | null
  followed: boolean
  // The notifications the follow is restricted to, empty when it covers all of them
  events: Array<NotificationEvent>
}

const isSubjectRule = (setting: NotificationSetting) => setting.scope !== null && setting.reason === null && setting.channel === null

// One row per followed or ignored subject, grouped under its organization: unchecking an
// organization stops everything one followed there.
const groups = computed(() => {
  const rows = new Map<string, SubjectRow & { organization: OrganizationReference | null }>()
  for (const setting of (settings.value ?? []).filter(isSubjectRule)) {
    const scope = setting.scope!
    const key = `${scope.class}-${scope.id}`
    const row = rows.get(key) ?? {
      key,
      scope,
      title: setting.subject?.title ?? null,
      page: setting.subject?.page ?? null,
      followed: false,
      events: [],
      organization: setting.subject?.organization ?? null,
    }
    row.followed ||= setting.enabled
    if (setting.event) row.events.push(setting.event)
    rows.set(key, row)
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

// Unchecking means hearing nothing more about the subject, whatever the role in its
// organization; checking follows all of it again.
async function followAll(rows: Array<SubjectRow>, followed: boolean) {
  for (const row of rows) {
    const narrower = (settings.value ?? []).filter(setting => isSubjectRule(setting) && setting.event !== null && setting.scope!.class === row.scope.class && setting.scope!.id === row.scope.id)
    await Promise.all(narrower.map(setting => setRule(setting, null)))
    await setRule({ scope: row.scope }, followed)
  }
  toast.success(followed ? t('Suivi réactivé') : t('Vous ne recevrez plus rien sur ces contenus'))
}

// The rules none of the forms above can show: set through the API, or left behind by a
// form that changed since.
const otherRules = computed(() => (settings.value ?? []).filter((setting) => {
  if (isSubjectRule(setting)) return false
  if (setting.scope || setting.event) return true
  if (setting.reason) return false
  return setting.channel === null || setting.enabled
}))

const EVENT_LABELS = computed<Record<NotificationEvent, string>>(() => ({
  DiscussionEvent: t('Discussions'),
  NewDiscussion: t('Nouvelles discussions'),
  NewDiscussionComment: t('Réponses'),
  DiscussionClosed: t('Discussions clôturées'),
  DatasetReusedEvent: t('Réutilisations et API'),
  ReuseCreated: t('Nouvelles réutilisations'),
  DataserviceCreated: t('Nouvelles API'),
}))

function eventLabel(event: NotificationEvent) {
  return EVENT_LABELS.value[event]
}

function describe(rule: NotificationSetting) {
  const parts = [
    rule.scope ? (rule.subject?.title ?? t('Contenu qui ne vous est plus accessible')) : t('Partout'),
    rule.event ? eventLabel(rule.event) : t('Toutes les notifications'),
  ]
  if (rule.reason) parts.push(reasonRows.value.find(row => row.reason === rule.reason)?.label ?? rule.reason)
  if (rule.channel) parts.push(rule.channel === 'app' ? t('Dans l\'application') : t('Par e-mail'))
  return parts.join(' · ')
}
</script>
