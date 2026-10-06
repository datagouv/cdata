<template>
  <Menu
    as="div"
    class="relative inline-block text-left"
  >
    <MenuButton as="template">
      <BrandedButton
        color="secondary"
        size="xs"
        :icon="choice === 'ignored' ? RiNotificationOffLine : RiNotification3Line"
        icon-only
        :title="buttonTitle"
        :loading
      />
    </MenuButton>
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <MenuItems class="absolute right-0 z-10 mt-2 w-72 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden">
        <MenuItem
          v-for="option in options"
          :key="option.value"
          v-slot="{ active }"
        >
          <button
            type="button"
            class="flex gap-2 px-4 py-2 w-full text-left"
            :class="[active ? 'bg-gray-100 outline-hidden' : '']"
            @click="choose(option.value)"
          >
            <span class="flex-1 space-y-1">
              <span class="block text-sm text-gray-title">{{ option.label }}</span>
              <span class="block text-xs text-gray-plain">{{ option.description }}</span>
            </span>
            <RiCheckLine
              v-if="choice === option.value"
              class="size-4 flex-none text-new-primary"
              aria-hidden="true"
            />
          </button>
        </MenuItem>
      </MenuItems>
    </transition>
  </Menu>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
import { BrandedButton, toast } from '@datagouv/components-next'
import { RiCheckLine, RiNotification3Line, RiNotificationOffLine } from '@remixicon/vue'
import type { Thread } from '~/types/discussions'
import type { NotificationChannel, NotificationScope } from '~/types/notifications'

type Choice = 'default' | 'followed' | 'ignored'

const props = defineProps<{
  thread: Thread
}>()

const { t } = useTranslation()
const { load, decisionFor, decide } = useNotificationSettings()

onMounted(load)

const scope = computed<NotificationScope>(() => ({ class: 'Discussion', id: props.thread.id }))
const CHANNELS: Array<NotificationChannel> = ['app', 'mail']

// Only the decisions taken on this very discussion are known here: without one, what the
// user receives depends on their role and on the settings of the subject or organization.
const choice = computed<Choice>(() => {
  const decisions = CHANNELS.map(channel => decisionFor(scope.value, 'discussions', channel))
  if (decisions.includes(true)) return 'followed'
  if (decisions.includes(false)) return 'ignored'
  return 'default'
})

const options = computed<Array<{ value: Choice, label: string, description: string }>>(() => [
  { value: 'default', label: t('Par défaut'), description: t('Selon votre rôle et vos réglages de notifications') },
  { value: 'followed', label: t('Suivre la discussion'), description: t('Être notifié de chaque nouveau message, dans l\'application et par e-mail') },
  { value: 'ignored', label: t('Ne pas suivre'), description: t('Ne plus être notifié de cette discussion') },
])

const buttonTitle = computed(() => {
  switch (choice.value) {
    case 'followed':
      return t('Vous suivez cette discussion')
    case 'ignored':
      return t('Vous ne suivez pas cette discussion')
    default:
      return t('Notifications de cette discussion')
  }
})

const loading = ref(false)

async function choose(value: Choice) {
  if (value === choice.value) return
  const enabled = { default: null, followed: true, ignored: false }[value]
  loading.value = true
  try {
    await Promise.all(CHANNELS.map(channel => decide(scope.value, 'discussions', channel, enabled)))
    toast.success({
      default: t('Cette discussion suit désormais vos réglages par défaut'),
      followed: t('Vous suivez cette discussion'),
      ignored: t('Vous ne serez plus notifié de cette discussion'),
    }[value])
  }
  finally {
    loading.value = false
  }
}
</script>
