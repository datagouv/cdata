<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Notifications') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <div class="max-w-6xl mb-5 flex items-center justify-between gap-4">
      <h1 class="m-0 font-extrabold text-2xl text-gray-title">
        {{ t('Notifications') }}
      </h1>
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

    <AnimatedLoader v-if="settings === null" />
    <div
      v-else
      class="max-w-6xl space-y-8"
    >
      <MuteConfirmation />

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
import { AnimatedLoader, BannerAction, BrandedButton, PaddedContainer, toast } from '@datagouv/components-next'
import { RiArticleLine, RiBookmarkLine, RiBuilding2Line, RiChat3Line, RiDatabase2Line, RiLineChartLine, RiNotification3Line, RiNotificationOffLine, RiServerLine, RiTerminalLine } from '@remixicon/vue'
import type { Component } from 'vue'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import CdataLink from '~/components/CdataLink.vue'
import MuteConfirmation from '~/components/Notifications/MuteConfirmation.vue'
import type { Me } from '~/utils/auth'
import type { MailCadence, NotificationScope, NotificationSetting } from '~/types/notifications'

const { t } = useTranslation()
const { $api } = useNuxtApp()

useSeoMeta({ title: t('Notifications'), robots: 'noindex' })
const me = useMe()
const { settings, load, setRule, paused, setPaused } = useNotificationSettings()

// Every setting reads as a line: its label on the left, its choices on the right.
const ROW_CLASS = 'px-5 py-4 grid grid-cols-[18rem_1fr] items-center gap-6'
const CHOICES_CLASS = 'flex flex-wrap gap-x-6 gap-y-2'

onMounted(load)

async function togglePaused(value: boolean) {
  await setPaused(value)
  toast.success(value ? t('Toutes les notifications sont désactivées') : t('Notifications réactivées'))
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

// The rules the user set, each read back as a sentence with the one action that undoes
// it: removing the rule, which brings the defaults back.
type RuleRow = {
  rule: NotificationSetting
  icon: Component
  title: string
  page: string | null
  detail: string
  action: string
  done: string
}

const isFollow = (rule: NotificationSetting) => rule.scope !== null && rule.enabled

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
    detail: [rule.scope ? organizationOf(rule) : null, sentence].filter(Boolean).join(' · '),
    action: rule.enabled ? t('Retirer') : t('Réactiver'),
    done: rule.enabled ? t('Réglage retiré') : t('Notifications réactivées'),
  }
}

const ruleSections = computed(() => {
  const rules = settings.value ?? []
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
