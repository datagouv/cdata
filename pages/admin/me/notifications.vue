<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Notifications') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-extrabold text-2xl text-gray-title mb-5">
      {{ t('Notifications') }}
    </h1>

    <AnimatedLoader v-if="settings === null || reasonChannels === null" />
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
        <div :class="[CHANNELS_GRID_CLASS, 'py-3']">
          <h2 class="m-0 text-sm font-bold">
            {{ t('Ce qui vous concerne') }}
          </h2>
          <p
            v-for="channel in channelColumns"
            :key="channel.value"
            class="m-0 text-xs text-gray-medium text-center"
          >
            {{ channel.label }}
          </p>
          <BrandedButton
            v-if="!allOff"
            class="justify-self-end"
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
          :class="[CHANNELS_GRID_CLASS, 'py-3']"
        >
          <p class="m-0 text-sm font-bold">
            {{ row.label }}
          </p>
          <div
            v-for="channel in channelColumns"
            :key="channel.value"
            class="flex justify-center"
          >
            <div class="fr-checkbox-group fr-checkbox-group--sm">
              <input
                :id="`reason-${row.reason}-${channel.value}`"
                type="checkbox"
                :checked="channelsOf(row.reason).includes(channel.value)"
                @change="saveChannel(row.reason, channel.value, ($event.target as HTMLInputElement).checked)"
              >
              <!-- The DSFR draws the box on the label, sized for one line of text: without
                   visible text, the label keeps that line height so the box stays centered. -->
              <label
                class="fr-label min-h-6"
                :for="`reason-${row.reason}-${channel.value}`"
              >
                <span class="sr-only">{{ row.label }} : {{ channel.label }}</span>
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
import { AnimatedLoader, BannerAction, BrandedButton, PaddedContainer, toast } from '@datagouv/components-next'
import { RiArticleLine, RiBookmarkLine, RiBuilding2Line, RiChat3Line, RiDatabase2Line, RiLineChartLine, RiNotification3Line, RiServerLine, RiTerminalLine } from '@remixicon/vue'
import type { Component } from 'vue'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import CdataLink from '~/components/CdataLink.vue'
import type { Me } from '~/utils/auth'
import type { MailCadence, NotificationChannel, NotificationReason, NotificationScope, NotificationSetting } from '~/types/notifications'

const { t } = useTranslation()
const { $api } = useNuxtApp()
const me = useMe()
const { settings, load, setRule, resolve, setReasonChannels, allOff, setAllOff: writeAllOff } = useNotificationSettings()

// Every setting reads as a line: its label on the left, its choices on the right.
const ROW_CLASS = 'px-5 py-4 grid grid-cols-[18rem_1fr] items-center gap-6'
const CHOICES_CLASS = 'flex flex-wrap gap-x-6 gap-y-2'
// The label column of every other row, then one column per channel.
const CHANNELS_GRID_CLASS = 'px-5 grid grid-cols-[18rem_6rem_6rem_1fr] items-center gap-6'

onMounted(async () => {
  await Promise.all([load(), refreshReasons()])
})

async function setAllOff(off: boolean) {
  await writeAllOff(off)
  await refreshReasons()
  toast.success(off ? t('Toutes les notifications sont désactivées') : t('Notifications réactivées'))
}

const reasonRows = computed<Array<{ reason: NotificationReason, label: string }>>(() => [
  { reason: 'owner', label: t('Vos contenus') },
  { reason: 'organization.admin', label: t('Organisations que vous administrez') },
  { reason: 'organization.partial_editor', label: t('Contenus qui vous sont confiés') },
  { reason: 'organization.editor', label: t('Organisations où vous êtes éditeur') },
  { reason: 'discussion.participant', label: t('Discussions auxquelles vous participez') },
  { reason: 'contributor', label: t('Contenus que vous avez modifiés') },
  { reason: 'explicit_subscriber', label: t('Contenus que vous suivez') },
  { reason: 'requester', label: t('Réponses à vos demandes') },
  ...(isMeAdmin() ? [{ reason: 'sysadmin' as const, label: t('Administration du site') }] : []),
])

const channelColumns = computed<Array<{ value: NotificationChannel, label: string }>>(() => [
  { value: 'app', label: t('Application') },
  { value: 'mail', label: t('E-mail') },
])

// What each reason row really gets, as udata resolves it: the page never resolves rules
// by itself, so it cannot disagree with what is sent.
const reasonChannels = ref<Partial<Record<NotificationReason, Array<NotificationChannel>>> | null>(null)

async function refreshReasons() {
  const resolved = await resolve({ reasons: reasonRows.value.map(row => row.reason) })
  reasonChannels.value = Object.fromEntries(resolved.map(answer => [answer.reason, answer.channels]))
}

function channelsOf(reason: NotificationReason): Array<NotificationChannel> {
  return reasonChannels.value?.[reason] ?? []
}

async function saveChannel(reason: NotificationReason, channel: NotificationChannel, checked: boolean) {
  const others = channelsOf(reason).filter(other => other !== channel)
  await setReasonChannels(reason, checked ? [...others, channel] : others)
  await refreshReasons()
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

// The rules set elsewhere than in the reason table and "turn everything off", each read
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

const isFollow = (rule: NotificationSetting) => rule.scope !== null && rule.reason === null && rule.channel === null && rule.enabled
const isReasonRule = (rule: NotificationSetting) => rule.reason !== null && rule.scope === null && rule.event === null
const isAllOffRule = (rule: NotificationSetting) => allOff.value && rule.channel !== null && rule.scope === null && rule.event === null && rule.reason === null

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
  const reason = rule.reason ? reasonRows.value.find(row => row.reason === rule.reason)?.label ?? rule.reason : null

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
    detail: [rule.scope ? organizationOf(rule) : null, channel ? `${sentence} ${channel}` : sentence, reason].filter(Boolean).join(' · '),
    action: rule.enabled ? t('Retirer') : t('Réactiver'),
    done: rule.enabled ? t('Réglage retiré') : t('Notifications réactivées'),
  }
}

const ruleSections = computed(() => {
  const rules = (settings.value ?? []).filter(rule => !isReasonRule(rule) && !isAllOffRule(rule))
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
