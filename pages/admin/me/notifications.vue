<template>
  <div>
    <AdminBreadcrumb>
      <BreadcrumbItem>{{ t('Notifications') }}</BreadcrumbItem>
    </AdminBreadcrumb>

    <h1 class="font-extrabold text-2xl text-gray-title mb-5">
      {{ t('Notifications') }}
    </h1>

    <h2 class="text-sm font-bold uppercase m-0 mb-3">
      {{ t('Fréquence des e-mails') }}
    </h2>
    <PaddedContainer class="!p-5 mb-10 max-w-4xl">
      <RadioButtons
        v-model="cadence"
        :label="t('À quel rythme voulez-vous recevoir les e-mails sur les discussions ?')"
        :options="cadenceOptions"
        stacked
      />
      <p class="m-0 text-xs text-gray-medium">
        {{ t(`Les demandes qui attendent une action de votre part (adhésion, transfert, moissonneur) sont toujours envoyées immédiatement.`) }}
      </p>
    </PaddedContainer>

    <h2 class="text-sm font-bold uppercase m-0 mb-3">
      {{ t('Ce qui vous est notifié') }}
    </h2>
    <p class="text-sm text-gray-plain max-w-4xl mb-4 text-pretty">
      {{ t(`Par défaut, vous êtes notifié de ce qui concerne vos propres contenus, ceux des organisations que vous administrez ou qui vous ont été confiés, et des discussions auxquelles vous participez. Un sujet sans réglage suit celui de son organisation, puis la ligne « Partout ».`) }}
    </p>

    <AdminTable :loading="settings === null">
      <thead>
        <tr>
          <AdminTableTh rowspan="2">
            {{ t('Sujet') }}
          </AdminTableTh>
          <AdminTableTh colspan="2">
            {{ t('Discussions') }}
          </AdminTableTh>
          <AdminTableTh>
            {{ t('Réutilisations et API') }}
          </AdminTableTh>
        </tr>
        <tr>
          <AdminTableTh
            v-for="column in columns"
            :key="`${column.category}-${column.channel}`"
            class="w-40"
          >
            {{ column.channel === 'app' ? t('Notifications') : t('E-mails') }}
          </AdminTableTh>
        </tr>
      </thead>
      <tbody v-if="settings !== null">
        <tr
          v-for="scope in scopes"
          :key="scope ? `${scope.class}-${scope.id}` : 'everywhere'"
        >
          <td>
            <NotificationScopeLabel
              v-if="scope"
              :scope
            />
            <span
              v-else
              class="font-bold"
            >
              {{ t('Partout') }}
            </span>
          </td>
          <td
            v-for="column in columns"
            :key="`${column.category}-${column.channel}`"
          >
            <SelectGroup
              class="!mb-0"
              :label="column.label"
              hide-label
              hide-null-option
              :options="decisionOptions"
              :model-value="decisionFor(scope, column.category, column.channel)"
              @update:model-value="(enabled) => save(scope, column.category, column.channel, enabled as boolean | null)"
            />
          </td>
        </tr>
      </tbody>
    </AdminTable>
  </div>
</template>

<script setup lang="ts">
import { PaddedContainer, SelectGroup, toast } from '@datagouv/components-next'
import AdminBreadcrumb from '~/components/Breadcrumbs/AdminBreadcrumb.vue'
import BreadcrumbItem from '~/components/Breadcrumbs/BreadcrumbItem.vue'
import AdminTable from '~/components/AdminTable/Table/AdminTable.vue'
import AdminTableTh from '~/components/AdminTable/Table/AdminTableTh.vue'
import NotificationScopeLabel from '~/components/Notifications/NotificationScopeLabel.vue'
import RadioButtons from '~/components/RadioButtons.vue'
import type { MailCadence, NotificationCategory, NotificationChannel, NotificationScope } from '~/types/notifications'

const { t } = useTranslation()
const { $api } = useNuxtApp()
const me = useMe()
const { settings, load, decisionFor, decide } = useNotificationSettings()

onMounted(load)

// Reuses and dataservices are only announced in the app: the API refuses a mail decision about them.
const columns = computed<Array<{ category: NotificationCategory, channel: NotificationChannel, label: string }>>(() => [
  { category: 'discussions', channel: 'app', label: t('Discussions, dans l\'application') },
  { category: 'discussions', channel: 'mail', label: t('Discussions, par e-mail') },
  { category: 'reuses', channel: 'app', label: t('Réutilisations et API, dans l\'application') },
])

const decisionOptions = computed(() => [
  { label: t('Par défaut'), value: null },
  { label: t('Activées'), value: true },
  { label: t('Désactivées'), value: false },
])

const SCOPE_ORDER: Array<NotificationScope['class']> = ['Organization', 'Dataset', 'Dataservice', 'Reuse', 'Post', 'Topic', 'Discussion']

// "Everywhere" first, then one row per subject the user took a decision about.
const scopes = computed<Array<NotificationScope | null>>(() => {
  const bySubject = new Map<string, NotificationScope>()
  for (const setting of settings.value ?? []) {
    if (setting.scope) bySubject.set(`${setting.scope.class}-${setting.scope.id}`, setting.scope)
  }
  const sorted = [...bySubject.values()].sort((a, b) => SCOPE_ORDER.indexOf(a.class) - SCOPE_ORDER.indexOf(b.class))
  return [null, ...sorted]
})

async function save(scope: NotificationScope | null, category: NotificationCategory, channel: NotificationChannel, enabled: boolean | null) {
  await decide(scope, category, channel, enabled)
  toast.success(t('Préférence enregistrée'))
}

const cadenceOptions = computed<Array<{ value: MailCadence, label: string, description: string }>>(() => [
  { value: 'immediate', label: t('Immédiatement'), description: t('Un e-mail à chaque nouveau message') },
  { value: 'daily', label: t('Une fois par jour'), description: t('Un résumé des discussions de la journée') },
  { value: 'weekly', label: t('Une fois par semaine'), description: t('Un résumé des discussions de la semaine') },
])

const cadence = computed({
  get: () => me.value.mail_cadence,
  set: async (mailCadence: MailCadence) => {
    const previous = me.value.mail_cadence
    me.value.mail_cadence = mailCadence
    try {
      await $api('/api/1/me/', { method: 'PUT', body: { mail_cadence: mailCadence } })
      toast.success(t('Fréquence des e-mails enregistrée'))
    }
    catch {
      // `$api` already reported the error, the radio only has to show the cadence actually saved
      me.value.mail_cadence = previous
    }
  },
})
</script>
