<template>
  <PaddedContainer class="p-4 pr-7">
    <LoadingBlock :status>
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
            <div class="flex w-full gap-x-3 items-center">
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
              <p class="m-0 text-xs text-gray-title flex-1">
                {{ getActivityTranslation(activity) }}
                <small v-if="activity.changes">{{ activity.changes }}</small>
              </p>
              <p class="m-0 text-xs text-gray-medium">
                {{ $t('on {date}', { date: formatDate(activity.created_at) }) }}
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
        @change="(newPage) => page = newPage"
      />
    </LoadingBlock>
  </PaddedContainer>
</template>

<script setup lang="ts">
import { Avatar, Pagination } from '@datagouv/components-next'
import PaddedContainer from '~/components/PaddedContainer/PaddedContainer.vue'
import type { Activity } from '~/types/activity'
import type { PaginatedArray } from '~/types/types'

const props = defineProps<{
  id: string
}>()

const route = useRoute()
const page = ref(parseInt(route.query.page as string | undefined ?? '1', 10))

const { data: activities, status } = await useAPI<PaginatedArray<Activity>>('/api/1/activity/', {
  query: {
    related_to: props.id,
    page,
  },
})

const groupedActivities = computed(() => activities?.value.data.reduce((grouped, activity) => {
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
</script>
