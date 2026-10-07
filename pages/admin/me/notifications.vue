<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Notifications') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <div class="max-w-6xl mb-5 flex items-center justify-between gap-4">
      <h1 class="m-0 font-extrabold text-2xl text-gray-title">
        {{ t('Notifications') }}
      </h1>
      <!-- About the whole page, not about a channel: next to its title. -->
      <BrandedButton
        v-if="settings !== null && !paused"
        color="secondary"
        size="xs"
        :icon="RiNotificationOffLine"
        @click="togglePaused(true)"
      >
        {{ t('Mettre en pause les notifications') }}
      </BrandedButton>
    </div>

    <AnimatedLoader v-if="settings === null || organizations === null" />
    <div
      v-else
      class="max-w-6xl space-y-8"
    >
      <BannerAction
        v-if="paused"
        type="warning"
        :title="t('Toutes vos notifications sont désactivées')"
      >
        {{ t(`Vous recevez seulement ce qui demande une action de votre part : invitations, transferts, moissonneurs à valider.`) }}
        <template #button>
          <BrandedButton
            color="secondary"
            size="xs"
            @click="togglePaused(false)"
          >
            {{ t('Réactiver') }}
          </BrandedButton>
        </template>
      </BannerAction>

      <!-- Whether, per organization, and how when it differs from the kinds below -->
      <PaddedContainer
        v-if="organizations.length"
        class="!p-0 divide-y divide-gray-default"
      >
        <div :class="[ORGANIZATIONS_GRID_CLASS, 'py-3']">
          <h2 class="m-0 text-sm font-bold">
            {{ t('Organisations') }}
          </h2>
          <p class="m-0 text-xs text-gray-medium">
            {{ t('Notifications') }}
          </p>
          <p class="m-0 text-xs text-gray-medium">
            {{ t('Canaux') }}
          </p>
        </div>
        <div
          v-for="organization in organizations"
          :key="organization.scope.id"
          :class="[ORGANIZATIONS_GRID_CLASS, 'py-3']"
        >
          <div class="min-w-0 flex items-center gap-3">
            <OrganizationLogo
              :organization="organization.reference"
              size-class="size-8 flex-none rounded-sm border border-gray-default bg-white p-0.5"
            />
            <div class="min-w-0">
              <p class="m-0 text-sm font-bold truncate">
                {{ organization.reference.name }}
              </p>
              <p class="m-0 text-xs text-gray-medium">
                {{ ROLE_LABELS[organization.role] }}
              </p>
            </div>
          </div>
          <select
            class="fr-select !mt-0"
            :aria-label="t('Notifications de {organization}', { organization: organization.reference.name })"
            :value="levelOf(organization)"
            @change="saveLevel(organization, ($event.target as HTMLSelectElement).value as Level)"
          >
            <option
              v-for="level in LEVELS[organization.role]"
              :key="level"
              :value="level"
            >
              {{ LEVEL_LABELS[level] }}
            </option>
          </select>
          <select
            class="fr-select !mt-0"
            :aria-label="t('Canaux de {organization}', { organization: organization.reference.name })"
            :value="channelsChoiceOf(organization)"
            @change="saveChannelsChoice(organization, ($event.target as HTMLSelectElement).value as ChannelsChoice)"
          >
            <option
              v-for="choice in channelsChoices"
              :key="choice.value"
              :value="choice.value"
            >
              {{ choice.label }}
            </option>
          </select>
        </div>
      </PaddedContainer>

      <!-- How: the channels, per kind of notification -->
      <PaddedContainer class="!p-0 divide-y divide-gray-default">
        <div :class="[CHANNELS_GRID_CLASS, 'py-3']">
          <h2 class="m-0 text-sm font-bold">
            {{ t('Canaux de notification') }}
          </h2>
          <p
            v-for="channel in channelColumns"
            :key="channel.value"
            class="m-0 text-xs text-gray-medium text-center"
          >
            {{ channel.label }}
          </p>
        </div>
        <template
          v-for="kind in kindRows"
          :key="kind.key"
        >
          <div
            v-if="kind.main || showOtherKinds"
            :class="[CHANNELS_GRID_CLASS, 'py-3']"
          >
            <p
              class="m-0 text-sm"
              :class="kind.main ? 'font-bold' : 'pl-4'"
            >
              {{ kind.label }}
            </p>
            <div
              v-for="channel in channelColumns"
              :key="channel.value"
              class="flex justify-center"
            >
              <div class="fr-checkbox-group fr-checkbox-group--sm">
                <input
                  :id="`kind-${kind.key}-${channel.value}`"
                  type="checkbox"
                  :checked="kindChannelOn(kind.events, channel.value)"
                  @change="saveKindChannel(kind.events, channel.value, ($event.target as HTMLInputElement).checked)"
                >
                <!-- The DSFR draws the box on the label, sized for one line of text: without
                     visible text, the label keeps that line height so the box stays centered. -->
                <label
                  class="fr-label min-h-6"
                  :for="`kind-${kind.key}-${channel.value}`"
                >
                  <span class="sr-only">{{ kind.label }} : {{ channel.label }}</span>
                </label>
              </div>
            </div>
          </div>
          <div
            v-if="kind.main"
            class="px-5 py-2"
          >
            <BrandedButton
              color="tertiary"
              size="xs"
              :icon="showOtherKinds ? RiArrowUpSLine : RiArrowDownSLine"
              icon-right
              :aria-expanded="showOtherKinds"
              @click="showOtherKinds = !showOtherKinds"
            >
              {{ showOtherKinds ? t('Masquer les autres types de notification') : t('Autres types de notification') }}
            </BrandedButton>
          </div>
        </template>
      </PaddedContainer>

      <!-- When the mails leave, whatever they are about -->
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

      <template
        v-for="section in ruleSections"
        :key="section.title"
      >
        <PaddedContainer
          v-if="section.rows.length"
          class="!p-0 divide-y divide-gray-default"
        >
          <h2 class="m-0 px-5 py-3 text-sm font-bold">
            {{ section.title }}
          </h2>
          <div
            v-for="row in section.rows"
            :key="row.rule.id"
            class="px-5 py-3 flex items-center gap-3"
          >
            <component
              :is="row.icon"
              class="size-4 flex-none text-gray-medium"
              aria-hidden="true"
            />
            <div class="flex-1 min-w-0">
              <p class="m-0 text-sm font-bold truncate">
                <CdataLink
                  v-if="row.page"
                  :to="row.page"
                  class="link"
                >
                  {{ row.title }}
                </CdataLink>
                <template v-else>
                  {{ row.title }}
                </template>
              </p>
              <p
                v-if="row.detail"
                class="m-0 text-xs text-gray-medium"
              >
                {{ row.detail }}
              </p>
            </div>
            <BrandedButton
              color="tertiary"
              size="xs"
              @click="withdraw(row)"
            >
              {{ row.action }}
            </BrandedButton>
          </div>
        </PaddedContainer>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AnimatedLoader, BannerAction, BrandedButton, OrganizationLogo, PaddedContainer, toast } from '@datagouv/components-next'
import type { OrganizationReference } from '@datagouv/components-next'
import { RiArrowDownSLine, RiArrowUpSLine, RiArticleLine, RiBookmarkLine, RiBuilding2Line, RiChat3Line, RiDatabase2Line, RiLineChartLine, RiNotification3Line, RiNotificationOffLine, RiServerLine, RiTerminalLine } from '@remixicon/vue'
import type { Component } from 'vue'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import CdataLink from '~/components/CdataLink.vue'
import type { Me } from '~/utils/auth'
import type { MailCadence, NotificationChannel, NotificationEvent, NotificationScope, NotificationSetting } from '~/types/notifications'

const { t } = useTranslation()
const { $api } = useNuxtApp()
const me = useMe()
const {
  settings, load, ruleValue, setRule, resolve,
  kindChannelOn, setKindChannel, organizationChannels, setOrganizationChannels, paused, setPaused,
} = useNotificationSettings()

// Every setting reads as a line: its label on the left, its choices on the right.
const ROW_CLASS = 'px-5 py-4 grid grid-cols-[18rem_1fr] items-center gap-6'
const CHOICES_CLASS = 'flex flex-wrap gap-x-6 gap-y-2'
// The label column of every other row, then one column per channel.
const CHANNELS_GRID_CLASS = 'px-5 grid grid-cols-[18rem_6rem_6rem_1fr] items-center gap-6'
const ORGANIZATIONS_GRID_CLASS = 'px-5 grid grid-cols-[18rem_1fr_1fr] items-center gap-6'

onMounted(async () => {
  await Promise.all([load(), loadOrganizations()])
})

async function togglePaused(value: boolean) {
  await setPaused(value)
  toast.success(value ? t('Toutes les notifications sont désactivées') : t('Notifications réactivées'))
}

const channelColumns = computed<Array<{ value: NotificationChannel, label: string }>>(() => [
  { value: 'app', label: t('Application') },
  { value: 'mail', label: t('E-mail') },
])

// The kinds of notification one can choose the channels of. The ones asking for an
// action are not listed: they always reach the user through both. Only the discussions
// are shown first, being the ones people actually want out of their mailbox; the others,
// rarely changed, wait behind a disclosure.
type KindRow = { key: string, label: string, events: Array<NotificationEvent>, main: boolean }

const kindRows = computed<Array<KindRow>>(() => [
  { key: 'discussion', label: t('Discussions'), events: ['discussion'], main: true },
  { key: 'reuse', label: t('Nouvelles réutilisations'), events: ['reuse.created'], main: false },
  { key: 'dataservice', label: t('Nouvelles API'), events: ['dataservice.created'], main: false },
  { key: 'badge', label: t('Badges de vos organisations'), events: ['organization.badge'], main: false },
  { key: 'membership', label: t('Réponses à vos demandes d\'adhésion'), events: ['organization.membership.accepted', 'organization.membership.refused'], main: false },
  { key: 'harvest', label: t('Moissonneurs validés ou refusés'), events: ['harvest.source.accepted', 'harvest.source.refused'], main: false },
])

const isKindChannelRule = (rule: NotificationSetting) => rule.scope === null && rule.channel !== null
  && kindRows.value.some(kind => kind.events.includes(rule.event!))

// Open from the start when one of them was changed, so that no choice stays hidden.
const showOtherKinds = ref(false)
watch(settings, () => {
  if (kindRows.value.some(kind => !kind.main && channelColumns.value.some(channel => !kindChannelOn(kind.events, channel.value)))) {
    showOtherKinds.value = true
  }
}, { immediate: true })

async function saveKindChannel(events: Array<NotificationEvent>, channel: NotificationChannel, on: boolean) {
  await setKindChannel(events, channel, on)
  toast.success(t('Préférence enregistrée'))
}

type Role = 'organization.admin' | 'organization.editor' | 'organization.partial_editor'
type Level = 'all' | 'followed' | 'assigned'
type OrganizationRow = { scope: NotificationScope, reference: OrganizationReference, role: Role }

const ROLE_LABELS = computed<Record<Role, string>>(() => ({
  'organization.admin': t('Administrateur'),
  'organization.editor': t('Éditeur'),
  'organization.partial_editor': t('Éditeur partiel'),
}))

// What one hears about by default depends on the role: a partial editor starts with the
// datasets assigned to them, and may still ask for everything of the organization.
const LEVELS: Record<Role, Array<Level>> = {
  'organization.admin': ['all', 'followed'],
  'organization.editor': ['all', 'followed'],
  'organization.partial_editor': ['all', 'assigned', 'followed'],
}
const DEFAULT_LEVELS: Record<Role, Level> = {
  'organization.admin': 'all',
  'organization.editor': 'followed',
  'organization.partial_editor': 'assigned',
}

const LEVEL_LABELS = computed<Record<Level, string>>(() => ({
  all: t('Tout recevoir'),
  followed: t('Seulement ce que vous suivez'),
  assigned: t('Vos jeux de données assignés'),
}))

// The organizations of the user and their role in each, as udata gives the reasons.
const organizations = ref<Array<OrganizationRow> | null>(null)

async function loadOrganizations() {
  const scopes = me.value.organizations.map(organization => ({ class: 'Organization' as const, id: organization.id }))
  if (!scopes.length) {
    organizations.value = []
    return
  }
  const resolved = await resolve({ scopes })
  organizations.value = me.value.organizations.flatMap((organization) => {
    const reasons = resolved.find(answer => answer.scope?.id === organization.id)?.reasons ?? []
    const role = reasons.find((reason): reason is Role => reason in DEFAULT_LEVELS)
    return role ? [{ scope: { class: 'Organization', id: organization.id }, reference: organization, role }] : []
  })
}

// A rule on the organization says yes or no to everything about it; without one, the
// role decides.
function levelOf(organization: OrganizationRow): Level {
  const enabled = ruleValue({ scope: organization.scope })
  if (enabled === null) return DEFAULT_LEVELS[organization.role]
  return enabled ? 'all' : 'followed'
}

async function saveLevel(organization: OrganizationRow, level: Level) {
  const enabled = level === DEFAULT_LEVELS[organization.role] ? null : level === 'all'
  await setRule({ scope: organization.scope }, enabled)
  toast.success(t('Préférence enregistrée'))
}

type ChannelsChoice = 'inherit' | 'both' | 'app' | 'mail'

const channelsChoices = computed<Array<{ value: ChannelsChoice, label: string }>>(() => [
  { value: 'inherit', label: t('Selon le type de notification') },
  { value: 'both', label: t('Application et e-mail') },
  { value: 'app', label: t('Application seulement') },
  { value: 'mail', label: t('E-mail seulement') },
])

const CHANNELS_OF_CHOICE: Record<ChannelsChoice, Array<NotificationChannel> | null> = {
  inherit: null,
  both: ['app', 'mail'],
  app: ['app'],
  mail: ['mail'],
}

function channelsChoiceOf(organization: OrganizationRow): ChannelsChoice {
  const channels = organizationChannels(organization.scope)
  if (channels === null) return 'inherit'
  if (channels.includes('app')) return channels.includes('mail') ? 'both' : 'app'
  return 'mail'
}

async function saveChannelsChoice(organization: OrganizationRow, choice: ChannelsChoice) {
  await setOrganizationChannels(organization.scope, CHANNELS_OF_CHOICE[choice])
  toast.success(t('Préférence enregistrée'))
}

const isMemberOrganizationRule = (rule: NotificationSetting) => rule.scope?.class === 'Organization'
  && rule.event === null
  && (organizations.value ?? []).some(organization => organization.scope.id === rule.scope!.id)

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

// The rules set elsewhere than in the forms above, each read
// back as a sentence with the one action that undoes it: removing the rule, which brings
// the defaults back.
type RuleRow = {
  rule: NotificationSetting
  icon: Component
  title: string
  page: string | null
  detail: string
  action: string
  done: string
}

const isFollow = (rule: NotificationSetting) => rule.scope !== null && rule.channel === null && rule.enabled

const SCOPE_ICONS: Record<NotificationScope['class'], Component> = {
  Organization: RiBuilding2Line,
  Discussion: RiChat3Line,
  Dataset: RiDatabase2Line,
  Reuse: RiLineChartLine,
  Dataservice: RiTerminalLine,
  Post: RiArticleLine,
  Topic: RiBookmarkLine,
}

// By the first segment of the type, for a rule about a kind of notification anywhere.
const EVENT_ICONS: Record<string, Component> = {
  discussion: RiChat3Line,
  reuse: RiLineChartLine,
  dataservice: RiTerminalLine,
  organization: RiBuilding2Line,
  harvest: RiServerLine,
}

const { eventLabel } = useNotificationLabels()

function subjectTitle(rule: NotificationSetting) {
  return rule.subject?.title ?? t('Contenu qui ne vous est plus accessible')
}

// The organization a subject belongs to, unless the subject is that organization.
function organizationOf(rule: NotificationSetting) {
  const organization = rule.subject?.organization
  return organization && organization.id !== rule.scope?.id ? organization.name : null
}

function followRow(rule: NotificationSetting): RuleRow {
  return {
    rule,
    icon: SCOPE_ICONS[rule.scope!.class],
    title: subjectTitle(rule),
    page: rule.subject?.page ?? null,
    detail: [
      organizationOf(rule),
      rule.event ? t('{event} seulement', { event: eventLabel(rule.event) }) : null,
      rule.origin === 'edited' ? t('Suivi automatique : vous l\'avez modifié') : null,
    ].filter(Boolean).join(' · '),
    action: t('Ne plus suivre'),
    done: t('Vous ne suivez plus ce contenu'),
  }
}

function cutRow(rule: NotificationSetting): RuleRow {
  const channel = rule.channel === 'mail' ? t('par e-mail') : rule.channel === 'app' ? t('dans l\'application') : null

  let sentence: string
  if (rule.scope && rule.event) sentence = t('Vous ne recevez plus : {event}', { event: eventLabel(rule.event) })
  else if (rule.scope?.class === 'Organization') sentence = t('Vous ne recevez rien sur cette organisation')
  else if (rule.scope?.class === 'Discussion') sentence = t('Vous ne recevez rien sur cette discussion')
  else if (rule.scope) sentence = t('Vous ne recevez rien sur ce contenu')
  else if (rule.event) sentence = t('Vous ne recevez plus ce type de notification')
  else sentence = t('Vous ne recevez plus rien')
  if (rule.enabled) sentence = t('Vous recevez toujours ces notifications')

  return {
    rule,
    icon: rule.scope
      ? SCOPE_ICONS[rule.scope.class]
      : (rule.event && EVENT_ICONS[rule.event.split('.')[0]!]) || RiNotification3Line,
    title: rule.scope ? subjectTitle(rule) : rule.event ? eventLabel(rule.event) : t('Toutes les notifications'),
    page: rule.subject?.page ?? null,
    detail: [rule.scope ? organizationOf(rule) : null, channel ? `${sentence} ${channel}` : sentence].filter(Boolean).join(' · '),
    action: rule.enabled ? t('Retirer') : t('Réactiver'),
    done: rule.enabled ? t('Réglage retiré') : t('Notifications réactivées'),
  }
}

const ruleSections = computed(() => {
  // The rules shown by the forms above are not listed again.
  const rules = (settings.value ?? []).filter(rule => !isKindChannelRule(rule) && !isMemberOrganizationRule(rule))
  return [
    { title: t('Contenus suivis'), rows: rules.filter(isFollow).map(followRow) },
    { title: t('Notifications coupées'), rows: rules.filter(rule => !isFollow(rule)).map(cutRow) },
  ]
})

async function withdraw(row: RuleRow) {
  await setRule(row.rule, null)
  toast.success(row.done)
}
</script>
