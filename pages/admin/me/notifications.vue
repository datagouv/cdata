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
        v-if="!paused"
        color="secondary"
        size="xs"
        :icon="RiNotificationOffLine"
        @click="togglePaused(true)"
      >
        {{ t('Mettre en pause les notifications') }}
      </BrandedButton>
    </div>

    <div class="max-w-6xl space-y-8">
      <!-- No reload once it wrote its rule: it then takes its key out of the URL, and the
           admin pages are keyed on the URL, so the page mounts again and reads its lists
           anew. Reloading from this instance would be cancelled by its unmount. -->
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

      <PaddedContainer class="!p-0 divide-y divide-gray-default">
        <h2 class="m-0 px-5 py-3 text-base font-bold">
          {{ t('E-mails') }}
        </h2>
        <div class="px-5 py-4">
          <RadioButtons
            :label="t('Rythme')"
            :options="cadenceOptions"
            :model-value="me?.mail_cadence"
            @update:model-value="saveCadence"
          />
        </div>
      </PaddedContainer>

      <template
        v-for="section in ruleSections"
        :key="section.title"
      >
        <PaddedContainer
          v-if="section.list.status.value === 'error'"
          class="!p-0"
        >
          <h2 class="m-0 px-5 py-3 text-base font-bold border-b border-gray-default">
            {{ section.title }}
          </h2>
          <p class="m-0 px-5 py-4 text-sm text-gray-medium">
            {{ t('Cette liste n\'a pas pu être chargée.') }}
          </p>
        </PaddedContainer>
        <!-- Only the follows hold their place while loading: the cut notifications are
             usually none, and their section would show up only to go away. -->
        <PaddedContainer
          v-else-if="!section.list.data.value && section.empty"
          class="!p-0"
        >
          <h2 class="m-0 px-5 py-3 text-base font-bold border-b border-gray-default">
            {{ section.title }}
          </h2>
          <div class="animate-pulse-placeholder divide-y divide-gray-default">
            <div
              v-for="index in 3"
              :key="index"
              class="px-5 py-4 space-y-2"
            >
              <div class="bg-gray-200 h-3 w-1/2" />
              <div class="bg-gray-200 h-2 w-1/3" />
            </div>
          </div>
        </PaddedContainer>
        <PaddedContainer
          v-else-if="section.list.data.value && (section.list.data.value.total || section.empty)"
          class="!p-0"
        >
          <h2 class="m-0 px-5 py-3 text-base font-bold border-b border-gray-default">
            {{ section.title }}
          </h2>
          <div
            v-if="!section.rows.length && section.empty"
            class="px-5 py-8 flex flex-col items-center text-center gap-2"
          >
            <RiNotification3Line
              class="size-6 text-gray-medium"
              aria-hidden="true"
            />
            <p class="m-0 text-sm font-medium">
              {{ section.empty.title }}
            </p>
            <p class="m-0 text-xs text-gray-medium max-w-md">
              {{ section.empty.explanation }}
            </p>
          </div>
          <ul
            v-else
            class="m-0 p-0 list-none divide-y divide-gray-default"
          >
            <li
              v-for="row in section.rows"
              :key="row.rule.id"
              class="px-5 py-3 flex items-start gap-3"
            >
              <!-- On the line of the title, whether a detail follows or not -->
              <component
                :is="row.icon"
                class="size-4 mt-0.5 flex-none text-gray-medium"
                aria-hidden="true"
              />
              <div class="flex-1 min-w-0">
                <p class="m-0 text-sm font-medium truncate">
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
                class="self-center"
                color="tertiary"
                size="xs"
                @click="withdraw(row)"
              >
                {{ row.action }}
              </BrandedButton>
            </li>
          </ul>
          <Pagination
            v-if="section.list.data.value.total > PAGE_SIZE"
            class="px-5 py-3 border-t border-gray-default"
            :page="section.list.page.value"
            :page-size="PAGE_SIZE"
            :total-results="section.list.data.value.total"
            @change="(page: number) => section.list.page.value = page"
          />
        </PaddedContainer>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BannerAction, BrandedButton, PaddedContainer, Pagination, toast, type PaginatedArray } from '@datagouv/components-next'
import { RiArrowLeftRightLine, RiNotification3Line, RiNotificationOffLine, RiServerLine } from '@remixicon/vue'
import { useRouteQuery } from '@vueuse/router'
import type { Component } from 'vue'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import CdataLink from '~/components/CdataLink.vue'
import MuteConfirmation from '~/components/Notifications/MuteConfirmation.vue'
import RadioButtons from '~/components/RadioButtons.vue'
import type { Me } from '~/utils/auth'
import type { EventFamily, MailCadence, NotificationSetting } from '~/types/notifications'
import { getSubjectDemonstrative, getSubjectTypeIcon } from '~/utils/discussions'

const { t } = useTranslation()
const { $api } = useNuxtApp()

useSeoMeta({ title: t('Notifications'), robots: 'noindex' })
// Gone while the page is still shown, on signing out from it.
const me = useMaybeMe()
const { setRule, paused } = useNotificationSettings()

// Each list has its own pages: the follows of a busy account keep growing.
const PAGE_SIZE = 20

async function ruleList(followed: boolean, pageQuery: string) {
  const page = useRouteQuery(pageQuery, 1, { transform: Number })
  const { data, status, refresh } = await useAPI<PaginatedArray<NotificationSetting>>(
    '/api/1/notifications/settings/',
    { lazy: true, query: computed(() => ({ followed, page: page.value, page_size: PAGE_SIZE })) },
  )
  return { page, data, status, refresh }
}
type RuleList = Awaited<ReturnType<typeof ruleList>>
const [follows, cuts] = await Promise.all([ruleList(true, 'page_suivis'), ruleList(false, 'page_coupees')])

// Withdrawing the last rule of the last page leaves it empty: show the one before. Here
// rather than in `ruleList`, whose own `await` would leave the watchers to no component.
for (const list of [follows, cuts]) {
  watch(list.data, (listed) => {
    const lastPage = Math.max(1, Math.ceil((listed?.total ?? 0) / PAGE_SIZE))
    if (list.page.value > lastPage) list.page.value = lastPage
  })
}

// The two preferences of the account itself, rather than rules.
async function saveMe(body: Partial<Pick<Me, 'mail_cadence' | 'notifications_paused'>>) {
  const updated = await $api<Me>('/api/1/me/', { method: 'PUT', body })
  if (!me.value) return
  me.value.mail_cadence = updated.mail_cadence
  me.value.notifications_paused = updated.notifications_paused
}

async function togglePaused(value: boolean) {
  await saveMe({ notifications_paused: value })
  toast.success(value ? t('Toutes les notifications sont désactivées') : t('Notifications réactivées'))
}

const cadenceOptions = computed<Array<{ value: MailCadence, label: string }>>(() => [
  { value: 'immediate', label: t('À chaque fois') },
  { value: 'daily', label: t('Un résumé par jour') },
  { value: 'weekly', label: t('Un résumé par semaine') },
])

async function saveCadence(mailCadence: MailCadence | undefined) {
  if (!mailCadence) return
  await saveMe({ mail_cadence: mailCadence })
  toast.success(t('Préférence enregistrée'))
}

// The rules the user set, each read back as a sentence with the one action that undoes
// it.
type RuleRow = {
  rule: NotificationSetting
  icon: Component
  title: string
  page: string | null
  detail: string
  action: string
  done: string
}

// By the first segment of the type, for a rule about a kind of notification anywhere:
// what the notifications of the family are about.
const EVENT_ICONS: Record<EventFamily, Component> = {
  discussion: getSubjectTypeIcon('Discussion'),
  reuse: getSubjectTypeIcon('Reuse'),
  dataservice: getSubjectTypeIcon('Dataservice'),
  organization: getSubjectTypeIcon('Organization'),
  transfer: RiArrowLeftRightLine,
  harvest: RiServerLine,
}

const { eventLabel } = useNotificationLabels()

function subjectTitle(rule: NotificationSetting) {
  return rule.subject?.title ?? t('Contenu qui ne vous est plus accessible')
}

function followRow(rule: NotificationSetting): RuleRow {
  return {
    rule,
    icon: getSubjectTypeIcon(rule.scope!.class),
    title: subjectTitle(rule),
    page: rule.subject?.page ?? null,
    detail: [
      rule.subject?.organization?.name,
      rule.event ? t('{event} seulement', { event: eventLabel(rule.event) }) : null,
      rule.origin === 'edited' ? t('Suivi automatique : vous l\'avez modifié') : null,
      rule.origin === 'discussed' ? t('Suivi automatique : vous avez participé à ses discussions') : null,
    ].filter(Boolean).join(' · '),
    action: t('Ne plus suivre'),
    done: t('Vous ne suivez plus {subject}', {
      subject: rule.subject ? `« ${rule.subject.title} »` : getSubjectDemonstrative(t, rule.scope!.class),
    }),
  }
}

function cutSentence(rule: NotificationSetting) {
  if (rule.enabled) return t('Vous recevez toujours ces notifications')
  // A thread is muted for all of its notifications, which all are discussion ones.
  if (rule.scope?.class === 'Discussion') return t('Vous ne recevez rien sur cette discussion')
  if (rule.scope && rule.event) return t('Vous ne recevez plus : {event}', { event: eventLabel(rule.event) })
  if (rule.scope) return t('Vous ne recevez rien sur {subject}', { subject: getSubjectDemonstrative(t, rule.scope.class) })
  if (rule.event) return t('Vous ne recevez plus ce type de notification')
  return t('Vous ne recevez plus rien')
}

function cutRow(rule: NotificationSetting): RuleRow {
  return {
    rule,
    icon: rule.scope
      ? getSubjectTypeIcon(rule.scope.class)
      : rule.event ? EVENT_ICONS[rule.event.split('.')[0] as EventFamily] : RiNotification3Line,
    title: rule.scope ? subjectTitle(rule) : rule.event ? eventLabel(rule.event) : t('Toutes les notifications'),
    page: rule.subject?.page ?? null,
    detail: [rule.subject?.organization?.name, cutSentence(rule)].filter(Boolean).join(' · '),
    action: rule.enabled ? t('Retirer') : t('Réactiver'),
    done: rule.enabled ? t('Réglage retiré') : t('Notifications réactivées'),
  }
}

type RuleSection = {
  title: string
  list: RuleList
  rows: Array<RuleRow>
  // `null` hides the section while empty, which is the normal state of the cut ones.
  empty: { title: string, explanation: string } | null
}

const ruleSections = computed<Array<RuleSection>>(() => [
  {
    title: t('Contenus suivis'),
    list: follows,
    rows: (follows.data.value?.data ?? []).map(followRow),
    // Owning or administering something already brings its notifications: following
    // is for the rest, and nothing here does not mean hearing about nothing.
    empty: {
      title: t('Aucun contenu suivi en plus'),
      explanation: t('Pour être prévenu de ce qui se passe sur un contenu, cliquez sur « Suivre » depuis sa page de discussions ou son espace d\'administration.'),
    },
  },
  { title: t('Notifications coupées'), list: cuts, rows: (cuts.data.value?.data ?? []).map(cutRow), empty: null },
])

// Withdrawing an automatic follow writes a "no" rather than nothing, which udata decides:
// the rule then moves to the cut notifications, hence both lists read again.
async function withdraw(row: RuleRow) {
  await setRule({ scope: row.rule.scope, event: row.rule.event }, null)
  await Promise.all([follows.refresh(), cuts.refresh()])
  toast.success(row.done)
}
</script>
