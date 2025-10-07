<template>
  <PaddedContainer class="p-4 pr-7">
    <LoadingBlock :status>
      <template v-if="activities && activities.total">
        <div
          v-for="(monthlyActivities, month) in groupedActivities"
          :key="month"
          class="my-1"
        >
          <p class="pl-3 mb-1 text-xs text-gray-medium">
            {{ month }}
          </p>
          <ul
            class="space-y-2 p-0 m-0"
          >
            <li
              v-for="(activity, activityIndex) in monthlyActivities"
              :key="`${activity.key}${activity.created_at}`"
              class="relative flex"
            >
              <div :class="[activityIndex === monthlyActivities.length - 1 ? 'h-6' : '-bottom-6', 'absolute left-0 top-0 flex w-6 justify-center']">
                <div class="w-px bg-gray-silver" />
              </div>
              <div class="relative flex size-6 flex-none items-center justify-center bg-white">
                <div class="size-[7px] rounded-full bg-gray-silver" />
              </div>
              <div class="flex w-full gap-x-3 items-start">
                <div class="flex items-center">
                  <Avatar
                    :rounded="true"
                    :size="16"
                    :user="activity.actor"
                    class="block"
                  />
                  <p class="m-0 text-xs font-bold ml-0.5 text-gray-title">
                    {{ activity.actor.first_name }}
                    {{ activity.actor.last_name }}
                  </p>
                </div>
                <details
                  v-if="hasChanges(activity)"
                  class="flex-1"
                >
                  <summary class="m-0 text-xs text-gray-title">
                    {{ getActivityTranslation(activity) }}
                  </summary>
                  <p class="m-2 text-xs">
                    {{ t('Aucun Champs mis à jour : | 1 Champ mis à jour : | {n} Champs mis à jour :', { n: activity.changes?.length ?? 0 }) }}
                  </p>
                  <div class="font-mono text-xs rounded-sm bg-gray-some p-4 m-2">
                    <ul class="list-['-'] pl-2 m-0">
                      <li
                        v-for="change in activity.changes"
                        :key="change"
                        class="pl-1"
                      >
                        {{ change }}
                      </li>
                    </ul>
                  </div>
                </details>
                <p
                  v-else
                  class="m-0 text-xs text-gray-title flex-1"
                >
                  {{ getActivityTranslation(activity) }}
                </p>
                <p class="m-0 text-xs text-gray-medium">
                  {{ t('le {date}', { date: formatDate(activity.created_at) }) }}
                </p>
              </div>
            </li>
          </ul>
        </div>
        <Pagination
          :total-results="activities.total"
          :page-size="activities.page_size"
          :page="activities.page"
          :link="getLink"
          @change="(newPage: string) => page = newPage"
        />
      </template>
      <div
        v-else
        class="flex flex-col items-center"
      >
        <nuxt-img
          src="/illustrations/list.svg"
          class="h-32"
        />
        <p class="fr-text--bold fr-my-3v">
          {{ t(`Il n'y a pas encore d'activité`) }}
        </p>
      </div>
    </LoadingBlock>
  </PaddedContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useTranslation } from '../composables/useTranslation'
import { getActivityTranslation } from '../functions/activities'
import { useFetch } from '../functions/api'
import { useFormatDate } from '../functions/dates'
import { getLink } from '../functions/pagination'
import type { PaginatedArray } from '../types/api'
import type { Activity } from '../types/activity'
import Avatar from './Avatar.vue'
import Pagination from './Pagination.vue'
import PaddedContainer from './PaddedContainer.vue'

const props = defineProps<{
  id?: string
  user?: string
}>()

const route = useRoute()
const { formatDate } = useFormatDate()
const { t } = useTranslation()

const page = ref(parseInt(route.query.page as string | undefined ?? '1', 10))

const { data: activities, status } = await useFetch<PaginatedArray<Activity>>('/api/1/activity/', {
  query: {
    related_to: props.id ?? undefined,
    user: props.user ?? undefined,
    page,
  },
})

const groupedActivities = computed(() => activities.value?.data.reduce((grouped, activity) => {
  const activityMonth = formatDate(activity.created_at, {
    dateStyle: undefined,
    day: undefined,
    month: 'long',
    year: 'numeric',
  })
  if (!grouped[activityMonth]) {
    grouped[activityMonth] = []
  }
  grouped[activityMonth].push(activity)
  return grouped
}, {} as Record<string, Array<Activity>>))

function hasChanges(activity: Activity) {
  return activity.changes && Array.isArray(activity.changes) && activity.changes.length
}
</script>
