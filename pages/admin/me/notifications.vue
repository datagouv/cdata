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
        v-if="loaded && !paused"
        color="secondary"
        size="xs"
        :icon="RiNotificationOffLine"
        @click="togglePaused(true)"
      >
        {{ t('Mettre en pause les notifications') }}
      </BrandedButton>
    </div>

    <div
      v-if="!loaded"
      class="max-w-6xl space-y-8 animate-pulse-placeholder"
    >
      <div class="bg-gray-200 h-24 w-full" />
      <div class="bg-gray-200 h-40 w-full" />
    </div>
    <div
      v-else
      class="max-w-6xl space-y-8"
    >
      <MuteConfirmation @muted="load" />

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
          v-if="section.rows.length || section.empty"
          class="!p-0"
        >
          <h2 class="m-0 px-5 py-3 text-base font-bold border-b border-gray-default">
            {{ section.title }}
          </h2>
          <p
            v-if="!section.rows.length"
            class="m-0 px-5 py-4 text-sm text-gray-medium"
          >
            {{ section.empty }}
          </p>
          <ul
            v-else
            class="m-0 p-0 list-none divide-y divide-gray-default"
          >
            <li
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
                color="tertiary"
                size="xs"
                @click="withdraw(row)"
              >
                {{ row.action }}
              </BrandedButton>
            </li>
          </ul>
          <Pagination
            v-if="section.list.listed && section.list.listed.total > PAGE_SIZE"
            class="px-5 py-3 border-t border-gray-default"
            :page="section.list.page"
            :page-size="PAGE_SIZE"
            :total-results="section.list.listed.total"
            @change="(page: number) => changePage(section.list, page)"
          />
        </PaddedContainer>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BannerAction, BrandedButton, PaddedContainer, Pagination, toast, type PaginatedArray } from '@datagouv/components-next'
import { RiChat3Line, RiBuilding2Line, RiLineChartLine, RiNotification3Line, RiNotificationOffLine, RiServerLine, RiTerminalLine } from '@remixicon/vue'
import { useRouteQuery } from '@vueuse/router'
import type { Component } from 'vue'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import CdataLink from '~/components/CdataLink.vue'
import MuteConfirmation from '~/components/Notifications/MuteConfirmation.vue'
import RadioButtons from '~/components/RadioButtons.vue'
import type { Me } from '~/utils/auth'
import type { MailCadence, NotificationSetting } from '~/types/notifications'
import { getSubjectTypeIcon } from '~/utils/discussions'

const { t } = useTranslation()
const { $api } = useNuxtApp()

useSeoMeta({ title: t('Notifications'), robots: 'noindex' })
// Gone while the page is still shown, on signing out from it.
const me = useMaybeMe()
const { setRule, paused } = useNotificationSettings()

// Read again on every visit rather than kept: udata writes rules too (following what one
// edits), and another account may have signed in since. Each list has its own pages: the
// follows of a busy account keep growing.
const PAGE_SIZE = 20

function ruleList(followed: boolean, pageQuery: string) {
  return reactive({
    followed,
    page: useRouteQuery(pageQuery, 1, { transform: Number }),
    listed: null as PaginatedArray<NotificationSetting> | null,
  })
}
type RuleList = ReturnType<typeof ruleList>
const follows = ruleList(true, 'page_suivis')
const cuts = ruleList(false, 'page_coupees')
const loaded = computed(() => follows.listed !== null && cuts.listed !== null)

async function fetchList(list: RuleList) {
  list.listed = await $api<PaginatedArray<NotificationSetting>>('/api/1/notifications/settings/', {
    query: { followed: list.followed, page: list.page, page_size: PAGE_SIZE },
  })
  // Withdrawing the last rule of the last page leaves it empty: show the one before.
  const lastPage = Math.max(1, Math.ceil(list.listed.total / PAGE_SIZE))
  if (list.page > lastPage) {
    list.page = lastPage
    await fetchList(list)
  }
}

// Both lists: withdrawing an automatic follow moves it from one to the other.
function load() {
  return Promise.all([fetchList(follows), fetchList(cuts)])
}

async function changePage(list: RuleList, page: number) {
  list.page = page
  await fetchList(list)
}

onMounted(load)

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
    done: t('Vous ne suivez plus ce contenu'),
  }
}

function cutSentence(rule: NotificationSetting) {
  if (rule.enabled) return t('Vous recevez toujours ces notifications')
  if (rule.scope && rule.event) return t('Vous ne recevez plus : {event}', { event: eventLabel(rule.event) })
  if (rule.scope?.class === 'Organization') return t('Vous ne recevez rien sur cette organisation')
  if (rule.scope?.class === 'Discussion') return t('Vous ne recevez rien sur cette discussion')
  if (rule.scope) return t('Vous ne recevez rien sur ce contenu')
  if (rule.event) return t('Vous ne recevez plus ce type de notification')
  return t('Vous ne recevez plus rien')
}

function cutRow(rule: NotificationSetting): RuleRow {
  return {
    rule,
    icon: rule.scope
      ? getSubjectTypeIcon(rule.scope.class)
      : (rule.event && EVENT_ICONS[rule.event.split('.')[0]!]) || RiNotification3Line,
    title: rule.scope ? subjectTitle(rule) : rule.event ? eventLabel(rule.event) : t('Toutes les notifications'),
    page: rule.subject?.page ?? null,
    detail: [rule.subject?.organization?.name, cutSentence(rule)].filter(Boolean).join(' · '),
    action: rule.enabled ? t('Retirer') : t('Réactiver'),
    done: rule.enabled ? t('Réglage retiré') : t('Notifications réactivées'),
  }
}

const ruleSections = computed(() => [
  {
    title: t('Contenus suivis'),
    list: follows,
    rows: (follows.listed?.data ?? []).map(followRow),
    // Owning or administering something already brings its notifications: following
    // is for the rest.
    empty: t('Pour être prévenu de ce qui se passe sur un contenu, cliquez sur « Suivre » depuis sa page de discussions ou son espace d\'administration.'),
  },
  { title: t('Notifications coupées'), list: cuts, rows: (cuts.listed?.data ?? []).map(cutRow), empty: null },
])

// Withdrawing an automatic follow writes a "no" rather than nothing, which udata decides:
// the rule then moves to the cut notifications, hence both lists read again.
async function withdraw(row: RuleRow) {
  await setRule({ scope: row.rule.scope, event: row.rule.event }, null)
  await load()
  toast.success(row.done)
}
</script>
