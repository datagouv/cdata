<template>
  <PaddedContainer class="p-4 pr-7">
    <LoadingBlock
      v-slot="{ data: activities }"
      :status
      :data="activities"
    >
      <template v-if="activities.total">
        <div class="space-y-14">
          <section
            v-for="(monthlyActivities, month) in groupedActivities"
            :key="month"
          >
            <!-- The rule carries the eye from the month across to the entries it opens,
                 and spaces the groups apart without boxing each of them in. -->
            <div class="flex items-center gap-x-4 mb-6">
              <h3 class="m-0 text-[13px] leading-5 font-medium text-gray-plain">
                <FormattedDate
                  :date="month"
                  :options="{ dateStyle: undefined, year: 'numeric', month: 'long', day: undefined }"
                />
              </h3>
              <div class="h-px flex-1 bg-gray-default" />
            </div>
            <ul class="space-y-6 p-0 m-0 list-none">
              <li
                v-for="activity in monthlyActivities"
                :key="`${activity.key}${activity.created_at}`"
              >
                <div class="text-sm/6 text-gray-title">
                  <ActivityActor
                    :actor="activity.actor"
                    :size="16"
                    class="mr-1 align-middle"
                  />
                  <slot
                    name="activity"
                    v-bind="{ class: '', activity }"
                  >
                    {{ getActivityTranslation(activity) }}
                    <AppLink
                      v-if="activity.extras.resource_id"
                      :to="getResourceLink(activity)"
                    >
                      {{ getResourceLabel(activity) }}
                    </AppLink>
                  </slot>
                  <span class="text-gray-low">&middot;</span>
                  <FormattedDate
                    class="text-[13px] leading-6 text-gray-medium"
                    :date="activity.created_at"
                    :options="{ dateStyle: undefined, day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }"
                  />
                </div>
                <!-- Indented past the avatar so the detail lines up with the text above
                     it rather than with the picture. -->
                <dl
                  v-if="hasChanges(activity)"
                  class="ml-11 mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm"
                >
                  <dt class="m-0 text-gray-title">
                    {{ t('Métadonnées modifiées') }}
                  </dt>
                  <dd class="m-0 text-gray-medium">
                    {{ activity.changes!.map(change => getActivityChangeLabel(activity, change)).join(', ') }}
                  </dd>
                </dl>
              </li>
            </ul>
          </section>
        </div>
        <Pagination
          :total-results="activities.total"
          :page-size="activities.page_size"
          :page="activities.page"
          @change="(newPage: number) => page = newPage"
        />
      </template>
      <div
        v-else
        class="flex flex-col items-center"
      >
        <img
          :src="listSrc"
          class="h-32"
        >
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
import { useTranslation } from '../../composables/useTranslation'
import { getActivityChangeLabel, getActivityTranslation } from '../../functions/activities'
import { useFetch } from '../../functions/api'
import type { PaginatedArray } from '../../types/api'
import type { Activity } from '../../types/activity'
import ActivityActor from './ActivityActor.vue'
import AppLink from '../AppLink.vue'
import LoadingBlock from '../LoadingBlock.vue'
import Pagination from '../Pagination.vue'
import PaddedContainer from '../PaddedContainer.vue'
import FormattedDate from '../FormattedDate.vue'
import listSrc from '../../../assets/illustrations/list.svg?url'

const props = defineProps<{
  id?: string
  user?: string
}>()

const route = useRoute()
const { t } = useTranslation()

const page = ref(parseInt(route.query.page as string | undefined ?? '1', 10))

const { data: activities, status } = await useFetch<PaginatedArray<Activity>>('/api/1/activity/', {
  query: {
    related_to: props.id ?? undefined,
    user: props.user ?? undefined,
    page,
  },
})

// Grouping on a month read in the reader's timezone would change both the number of
// groups and their keys between the server render and the browser's — a mismatch on
// the children themselves, which no `data-allow-mismatch` covers. The `YYYY-MM` the
// timestamp starts with is the same string for everyone; the month is worded from it
// at render time.
const groupedActivities = computed(() => activities.value?.data.reduce((grouped, activity) => {
  const activityMonth = activity.created_at.slice(0, 7)
  if (!grouped[activityMonth]) {
    grouped[activityMonth] = []
  }
  grouped[activityMonth].push(activity)
  return grouped
}, {} as Record<string, Array<Activity>>))

function hasChanges(activity: Activity) {
  return activity.changes && Array.isArray(activity.changes) && activity.changes.length
}

// The title is only carried by the activities recorded since the backend started
// storing it; the older ones have nothing but the identifier to name the resource by.
function getResourceLabel(activity: Activity) {
  return activity.extras.resource_title ?? activity.extras.resource_id ?? ''
}

// The dataset page opens a resource from `?resource_id`, and `related_to_url` already
// carries that page. A removed resource has nothing left to open, so its name stays
// plain text rather than leading to a "file not found".
function getResourceLink(activity: Activity) {
  if (activity.key === 'dataset:resource:deleted') return null
  if (activity.related_to_kind !== 'Dataset' || !activity.extras.resource_id) return null
  return `${activity.related_to_url}?resource_id=${activity.extras.resource_id}`
}
</script>
