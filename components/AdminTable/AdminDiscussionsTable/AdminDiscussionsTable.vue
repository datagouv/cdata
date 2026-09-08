<template>
  <AdminTable>
    <thead>
      <tr>
        <AdminTableTh
          :sorted="sorted('title')"
          scope="col"
          class="w-1/3"
          @sort="(direction: SortDirection) => $emit('sort', 'title', direction)"
        >
          {{ t("Discussion") }}
        </AdminTableTh>
        <AdminTableTh
          scope="col"
          class="w-1/3"
        >
          {{ t("Premier commentaire") }}
        </AdminTableTh>
        <AdminTableTh
          scope="col"
          class="w-44"
        >
          {{ t("Statut") }}
        </AdminTableTh>
        <AdminTableTh
          scope="col"
          class="min-w-56"
        >
          {{ t("Dernier commentaire") }}
        </AdminTableTh>
        <AdminTableTh
          :sorted="sorted('created')"
          scope="col"
          class="w-44"
          @sort="(direction: SortDirection) => $emit('sort', 'created', direction)"
        >
          {{ t("Créé le") }}
        </AdminTableTh>
        <AdminTableTh
          :sorted="sorted('closed')"
          scope="col"
          class="w-44"
          @sort="(direction: SortDirection) => $emit('sort', 'closed', direction)"
        >
          {{ t("Fermée le") }}
        </AdminTableTh>
        <AdminTableTh
          scope="col"
          class="w-0"
        >
          {{ t("Actions") }}
        </AdminTableTh>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="discussion in discussions"
        :key="discussion.id"
      >
        <td>
          <!-- Not <p>s: TextClamp is a .client component, its SSR placeholder is
               a <div> and a <div> inside a <p> is restructured by the browser
               parser, causing hydration mismatches -->
          <div class="fr-text--bold">
            <CdataLink
              class="link"
              :to="discussion.self_web_url"
            >
              <TextClamp
                :text="discussion.title"
                :auto-resize="true"
                :max-lines="2"
              />
            </CdataLink>
          </div>
          <div v-if="!subject && subjects[discussion.subject.id]">
            <CdataLink
              class="link inline-flex gap-1"
              :to="getSubjectPage(subjects[discussion.subject.id]!)"
            >
              <component
                :is="getSubjectTypeIcon(discussion.subject.class)"
                class="self-center size-3"
                aria-hidden="true"
              />
              <TextClamp
                class="overflow-wrap-anywhere"
                :text="getSubjectTitle(subjects[discussion.subject.id]!)"
                :auto-resize="true"
                :max-lines="1"
              />
            </CdataLink>
          </div>
        </td>
        <td>
          <TextClamp
            class="overflow-wrap-anywhere"
            :text="discussion.discussion[0].content"
            :auto-resize="true"
            :max-lines="3"
            @clamp-change="(clamped: boolean) => clampedContents[discussion.id] = clamped"
          />
          <p
            v-if="getOpenThreadLabel(discussion) && getSubjectOf(discussion)"
            class="m-0 text-right"
          >
            <button
              type="button"
              class="link italic"
              @click="openThread(discussion, isFullyShown(discussion))"
            >
              {{ getOpenThreadLabel(discussion) }}
            </button>
          </p>
        </td>
        <td>
          <AdminBadge
            size="xs"
            :type="getStatus(discussion).type"
          >
            {{ getStatus(discussion).label }}
          </AdminBadge>
        </td>
        <td>
          <div>
            <p><FormattedDate :date="getLastComment(discussion).posted_on" /></p>
            <p class="inline-flex items-center">
              {{ t('par ') }}
              <AvatarWithName
                class="fr-ml-1v"
                :user="getLastComment(discussion).posted_by"
              />
            </p>
          </div>
        </td>
        <td>
          <FormattedDate :date="discussion.created" />
        </td>
        <td>
          <template v-if="discussion.closed">
            <FormattedDate :date="discussion.closed" />
          </template>
        </td>
        <td>
          <div
            v-if="getSubjectOf(discussion)"
            class="flex items-center"
          >
            <BrandedButton
              size="xs"
              color="tertiary"
              :href="getDiscussionUrl(discussion.id, getSubjectOf(discussion))"
              :icon="RiEyeLine"
              :title="$t('Voir la discussion')"
              :aria-label="$t('Voir la discussion {title}', { title: discussion.title })"
              icon-only
              keep-margins-even-without-borders
            />

            <BrandedButton
              v-if="!discussion.closed"
              size="xs"
              color="tertiary"
              :icon="RiChatNewLine"
              :title="$t('Répondre à la discussion')"
              :aria-label="$t('Répondre à la discussion {title}', { title: discussion.title })"
              icon-only
              keep-margins-even-without-borders
              @click="openThread(discussion, true)"
            />

            <DiscussionsThreadModal
              :model-value="openedThreadId === discussion.id"
              :thread="discussion"
              :subject="getSubjectOf(discussion) ?? undefined"
              :respond-immediately="openedThreadId === discussion.id && openedToRespond"
              @update:model-value="(opened: boolean | undefined) => openedThreadId = opened ? discussion.id : null"
              @responded="$emit('refresh')"
            />
          </div>
        </td>
      </tr>
    </tbody>
  </AdminTable>
</template>

<script setup lang="ts">
import { AvatarWithName, BrandedButton, FormattedDate } from '@datagouv/components-next'
import { RiChatNewLine, RiEyeLine } from '@remixicon/vue'
import AdminTable from '../Table/AdminTable.vue'
import AdminTableTh from '../Table/AdminTableTh.vue'
import type { DiscussionSortedBy, DiscussionSubjectTypes, Thread } from '~/types/discussions'
import type { AdminBadgeType, SortDirection } from '~/types/types'
import { getDiscussionUrl, getSubject, getSubjectTypeIcon, getSubjectTitle } from '~/utils/discussions'

const props = defineProps<{
  discussions: Array<Thread>
  sortDirection: SortDirection
  sortedBy: DiscussionSortedBy
  subject?: DiscussionSubjectTypes
}>()

defineEmits<{
  (event: 'sort', column: DiscussionSortedBy, direction: SortDirection): void
  (event: 'refresh'): void
}>()

const { t } = useTranslation()
const { $api } = useNuxtApp()

const subjects = ref<Record<string, DiscussionSubjectTypes | null>>({})
const subjectsPromises = ref<Record<string, Promise<void>>>({})

watchEffect(async () => {
  if (props.subject) return

  for (const discussion of props.discussions) {
    if (discussion.subject.id in subjectsPromises.value) continue

    subjectsPromises.value[discussion.subject.id] = getSubject($api, discussion.subject)
      .then((subject) => {
        subjects.value[discussion.subject.id] = subject // Working because there is no conflicts between IDs from different types
      })
  }

  await Promise.all(Object.values(subjectsPromises.value))
})

const openedThreadId = ref<string | null>(null)
const openedToRespond = ref(false)
const clampedContents = ref<Record<string, boolean>>({})

function openThread(discussion: Thread, respond: boolean) {
  openedToRespond.value = respond
  openedThreadId.value = discussion.id
}

/** The table already shows the whole thread: there is nothing left to read. */
function isFullyShown(discussion: Thread): boolean {
  return discussion.discussion.length === 1 && !clampedContents.value[discussion.id]
}

function getSubjectOf(discussion: Thread): DiscussionSubjectTypes | null {
  return props.subject ?? subjects.value[discussion.subject.id] ?? null
}

/**
 * Label of the trigger opening the whole thread: the number of answers when
 * there are some, an invitation to read the first comment in full when the
 * table clamped it away, and otherwise what is left to do on the thread.
 * Nothing on a closed thread the table already shows entirely.
 */
function getOpenThreadLabel(discussion: Thread): string | null {
  const answers = discussion.discussion.length - 1
  if (answers > 0) {
    return t('et {n} commentaire suivant | et {n} commentaires suivants', { n: answers })
  }
  if (clampedContents.value[discussion.id]) {
    return t('voir plus')
  }
  if (!discussion.closed) {
    return t('répondre')
  }
  return null
}

function sorted(column: DiscussionSortedBy) {
  if (props.sortedBy === column) {
    return props.sortDirection
  }
  return null
}

function getStatus(thread: Thread): { label: string, type: AdminBadgeType } {
  if (thread.closed) {
    return {
      label: t('Clos'),
      type: 'secondary',
    }
  }

  if (thread.discussion.length === 1) {
    return {
      label: t('Nouveau'),
      type: 'primary',
    }
  }

  return {
    label: t('Répondu'),
    type: 'secondary',
  }
}
</script>
