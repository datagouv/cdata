<template>
  <div
    class="flex flex-wrap gap-2"
    role="listbox"
    :aria-labelledby="question.title"
    tabindex="0"
    :aria-activedescendant="active"
    @keydown="handleKeyPressForActiveDescendant"
    @keydown.space="selectActiveChoice"
    @keydown.enter="selectActiveChoice"
    @focusout="focusOut"
  >
    <template v-if="'choices' in question">
      <SupportChoice
        v-for="choice in question.choices"
        :key="choice.id"
        :active="isActive(choice.id)"
        :selected="choice.id === selected"
        @select="$emit('select', choice.id)"
      >
        {{ choice.label }}
      </SupportChoice>
    </template>
    <template v-else-if="'segment' in question">
      <form
        class="w-4xl"
        @submit.prevent="submit(question)"
      >
        <InputGroup
          v-model="form.email"
          label="Votre adresse email"
          type="email"
          :required="true"
          :has-error="!!getFirstError('email')"
          :error-text="getFirstError('email')"
          @blur="touch('email')"
        />
        <InputGroup
          v-model="form.subject"
          label="Le sujet de votre question"
          type="text"
          :required="true"
          :has-error="!!getFirstError('subject')"
          :error-text="getFirstError('subject')"
          @blur="touch('subject')"
        />
        <InputGroup
          v-model="form.body"
          label="Votre question"
          type="textarea"
          :required="true"
          :has-error="!!getFirstError('body')"
          :error-text="getFirstError('body')"
          @blur="touch('body')"
        />
        <div
          v-if="messageSent"
          class="flex w-56 text-center"
        >
          <SimpleBanner type="primary">
            Message envoyé !
          </SimpleBanner>
        </div>
        <BrandedButton
          v-else
          type="submit"
          :loading
        >
          Envoyer
        </BrandedButton>
      </form>
    </template>
    <template v-else-if="'answer' in question">
      <SimpleBanner
        type="gray"
        class="p-8"
      >
        <h4 class="font-extrabold mb-3 text-lg">
          Explication
        </h4>
        <MarkdownViewer
          v-if="answerResponse"
          :content="answerResponse"
        />
        <div
          v-if="'button_link' in question"
          class="mt-2 text-center"
        >
          <BrandedButton
            :href="question.button_link"
          >
            {{ question.button_text }}
          </BrandedButton>
        </div>
      </SimpleBanner>
    </template>
  </div>
</template>

<script setup lang="ts">
import { BrandedButton, SimpleBanner } from '@datagouv/components-next'
import MarkdownViewer from '~/components/MarkdownViewer/MarkdownViewer.vue'
import useActiveDescendant from '~/datagouv-components/src/composables/useActiveDescendant'
import type { Question, QuestionWithSegment } from '~/types/support'

const emit = defineEmits<{
  select: [id: string | undefined]
}>()

const props = defineProps<{
  question: Question
  selected: string | undefined
}>()

const answerResponse = ref('')
const loading = ref(false)
const messageSent = ref(false)

const { toast } = useToast()

const { isActive, active, focusOut, handleKeyPressForActiveDescendant } = useActiveDescendant('choices' in props.question ? props.question.choices : [], 'horizontal')

const { form, touch, getFirstError, validate } = useForm({
  email: '',
  subject: '',
  body: '',
}, {
  email: [required(), email()],
  subject: [required()],
  body: [required()],
}, {
})

watchEffect(async () => {
  if (props.question && 'answer' in props.question) {
    const module = await import(`~/assets/config/answers/${props.question.answer}.md?raw`)
    answerResponse.value = module.default
  }
})

function selectActiveChoice(e: Event) {
  if (active.value) {
    e.preventDefault()
    emit('select', active.value)
  }
}

async function submit(question: QuestionWithSegment) {
  if (!validate()) {
    return
  }
  loading.value = true
  try {
    await $fetch('/api/send-message', {
      method: 'POST',
      body: {
        email: form.value.email,
        segment: question.segment,
        subject: form.value.subject,
        body: form.value.body,
      },
    })
    messageSent.value = true
  }
  catch {
    toast.error(`Une erreur est survenue lors de l'envoi de votre demande`)
  }
  finally {
    loading.value = false
  }
}
</script>
